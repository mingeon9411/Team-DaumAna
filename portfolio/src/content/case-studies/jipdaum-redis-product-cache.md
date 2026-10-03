---
title: "상품 목록 조회에 Redis 캐싱 적용 — 붙이자마자 잡은 직렬화 버그 2개와 배포 전에 막은 프로덕션 장애"
date: "2026-09-03"
period:
  start: "2026-09-03"
  end: "2026-09-03"
role: ["Backend"]
stack: ["Spring Boot", "Redis", "Java", "Docker"]
highlights:
  - "상품 목록 조회(GET /api/shop/products)에 Spring Cache + Redis를 적용하고 응답 바디 동일성을 검증. 캐시 미스 534ms·히트 28ms를 관측했으며, 반복 측정에 따른 성능 개선율과는 구분"
  - "DTO가 record라 JDK 기본 직렬화 대상이 아니라는 점과, JSON 직렬화로 바꾸면서 LocalDateTime이 깨지는 문제 2건을 실측으로 잡아 커밋 전에 고침"
  - "배포 워크플로우를 먼저 읽고 프로덕션에 Redis가 없을 수 있다는 걸 확인한 뒤, 캐시 장애 시 예외 대신 DB 직접 조회로 폴백하는 안전장치를 만들어 실제로 Redis를 내린 채 200 응답을 확인하고서야 배포"
tags: ["Backend", "Performance", "Caching", "Redis"]
summary: "상품 목록 API에 Redis 캐싱을 붙이는 작업에서, 붙이는 것 자체보다 붙이고 나서 실제로 호출해보며 드러난 두 가지 직렬화 버그와 배포 인프라 리스크를 정리했다. 코드는 하루 만에 끝났지만, 검증 없이 그대로 배포했다면 상품 목록 API가 500으로 죽거나 프론트가 날짜를 못 읽는 상태로 나갔을 사례."
---

## Summary (읽기 전에 30초)

| 항목 | 내용 |
|---|---|
| **목표** | 상품 목록 조회(`ProductService.getProducts`)를 Redis로 캐싱해 반복 조회 성능 개선 |
| **붙이자마자 터진 문제 1** | `GenericJackson2JsonRedisSerializer`의 기본 `ObjectMapper`에 JSR-310 모듈이 없어 `LocalDateTime` 필드에서 `InvalidDefinitionException` → 상품 목록 API 500 |
| **붙이자마자 터진 문제 2** | 모듈을 등록해도 `WRITE_DATES_AS_TIMESTAMPS`를 안 끄면 캐시 히트 때만 `created_at`이 `"2026-07-27T..."`가 아니라 `[2026,7,27,...]` 배열로 나와, DB 조회와 캐시 히트의 응답 모양이 달라지는 회귀 |
| **배포 전에 막은 문제** | 프로덕션 EC2의 `application.yml`은 git과 별개로 호스트에 고정 마운트돼 있어 이번 변경이 자동 반영되지 않고, EC2에 Redis 컨테이너가 있는지 확인할 방법이 없었음 — 그대로 배포하면 Redis 연결 실패 시 상품 목록 API 전체가 500으로 죽을 위험 |
| **해결** | JSR-310 등록 + 타임스탬프 옵션 끄기로 직렬화 문제 해결, `CachingConfigurer.errorHandler()`로 캐시 실패를 로그만 남기고 삼키게 해 Redis 없이도 서비스가 정상 응답하도록 안전망 추가 |
| **검증 범위** | 캐시 미스/히트 응답 바디 동일성과 Redis 중단 시 200 응답 확인. 응답 시간은 제한된 관측치이며, 반복 측정·동시 요청·관리자 수정 후 무효화의 HTTP 경로 검증은 후속 과제 |

## 배경 — 캐싱 대상과 선택 이유

`ProductService.getProducts(search, categoryId, collection)`은 검색어·카테고리·진열 조합별로 매번 DB를 조회하는, 트래픽이 몰릴 상품 목록 화면의 핵심 조회다. Django Admin이 같은 MySQL 인스턴스를 직접 쓰는 구조([DB 공유 설계 케이스 스터디](/case-studies/jipdaum-db-architecture) 참고)라 캐시 무효화 이벤트를 양쪽에 연동하는 건 과한 설계라고 판단했고, 대신 TTL 30초로 최종 일관성을 택했다 — Django에서 상품을 고쳐도 최대 30초 지연 후 반영되는 정도는 이 서비스 규모에서 감수할 만한 트레이드오프다.

Spring Boot의 캐시 추상화(`@Cacheable`/`@CacheEvict`) + `spring-boot-starter-data-redis`만으로 구현했다. 커스텀 캐시 매니저나 별도 무효화 파이프라인은 만들지 않았다.

```java
@Cacheable(value = "products", key = "#search + ':' + #categoryId + ':' + #collection")
public List<ProductDetailResponse> getProducts(String search, Long categoryId, String collection) { ... }
```

Spring 관리자 API의 상품/옵션 생성·수정·삭제(`AdminProductService`, `AdminProductOptionService`)에는 `@CacheEvict(value = "products", allEntries = true)`를 붙였다. Django Admin의 직접 DB 수정에는 이 경로가 실행되지 않으므로 TTL 만료 후 반영된다.

## 버그 1 — 기본 ObjectMapper에 JSR-310이 없다

`RedisCacheConfiguration`의 기본 직렬화(JDK `Serializable`)는 캐시 대상 DTO(`ProductDetailResponse` 등)가 record라 애초에 쓸 수 없어 `GenericJackson2JsonRedisSerializer`(JSON)로 바꿨다. 여기까지는 흔한 선택인데, 실제로 엔드포인트를 호출해보니 곧바로 500이 떴다.

```
Caused by: com.fasterxml.jackson.databind.exc.InvalidDefinitionException:
Java 8 date/time type `java.time.LocalDateTime` not supported by default:
add Module "com.fasterxml.jackson.datatype:jackson-datatype-jsr310" to enable handling
```

`GenericJackson2JsonRedisSerializer()`(무인자 생성자)가 내부적으로 만드는 `ObjectMapper`는 애플리케이션의 Spring MVC용 `ObjectMapper`(JSR-310 자동 등록됨)와 별개의 인스턴스라, `created_at`(`LocalDateTime`) 필드에서 바로 막혔다. `GenericJackson2JsonRedisSerializer.builder().objectMapper(...)`로 직접 만든 `ObjectMapper`에 `JavaTimeModule`을 등록해 넘기는 방식으로 해결했다.

## 버그 2 — 타임스탬프 옵션을 안 끄면 캐시 히트 때만 응답이 달라진다

모듈을 등록하고 나니 500은 사라졌는데, 캐시 히트 응답과 DB 직접 조회 응답을 `diff`로 비교하는 습관이 없었다면 놓쳤을 문제가 하나 더 있었다.

```
DB 조회:    "created_at":"2026-07-27T22:41:25.992678"
캐시 히트:  "created_at":[2026,7,27,22,41,25,992678000]
```

Jackson의 `JavaTimeModule`은 기본값이 `SerializationFeature.WRITE_DATES_AS_TIMESTAMPS = true`라 날짜를 배열로 직렬화한다. Spring Boot가 자동 구성하는 애플리케이션 기본 `ObjectMapper`는 이 옵션을 꺼두기 때문에 평소 REST 응답은 문자열로 나오지만, 새로 만든 Redis 전용 `ObjectMapper`는 그 설정을 물려받지 않는다. 캐시가 30초마다 만료되니 같은 요청인데 타이밍에 따라 응답 JSON의 필드 타입이 달라지는 셈 — 프론트가 `created_at`을 `new Date(...)`로 파싱하는 코드였다면 캐시 히트 순간에만 깨졌을 회귀다. `.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)`로 고정했다.

```java
ObjectMapper redisObjectMapper = new ObjectMapper()
        .registerModule(new JavaTimeModule())
        .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
```

두 버그 모두 코드 리뷰만으로는 안 보이고, 캐시 미스(1차 요청)와 캐시 히트(2차 요청)의 실제 응답을 `curl` + `diff`로 맞대봐야 드러나는 종류였다.

## 배포 전에 멈춘 이유 — 프로덕션에 Redis가 없을 수도 있다

기능 구현이 끝난 뒤 바로 커밋·배포하는 대신, `.github/workflows/docker-publish.yml`을 먼저 읽었다. EC2 배포 스텝은 `/opt/jipdaum/config/application.yml`을 컨테이너에 볼륨 마운트만 하고 있어서, 이 저장소에 아무리 Redis 설정을 커밋해도 **프로덕션 설정 파일은 이 배포로 갱신되지 않는다**. 그리고 EC2의 `jipdaum-net` 네트워크에 Redis 컨테이너가 떠 있는지 이 세션에서는 확인할 방법이 없었다.

이 상태로 그냥 push하면: 프로덕션 앱은 Redis 설정이 없으니 기본값(`localhost:6379`)으로 접속을 시도하고, 컨테이너 안에서 `localhost`는 자기 자신이라 연결이 거부되고, `@Cacheable`이 그 예외를 그대로 던지면 **상품 목록 API 전체가 500**이 된다. 캐싱은 성능 최적화일 뿐인데 그것 때문에 핵심 조회 API가 죽는 건 받아들일 수 없는 실패 모드라고 판단해, 배포를 보류하고 안전장치부터 만들었다.

```java
@Configuration
@EnableCaching
public class CacheConfig implements CachingConfigurer {
    @Override
    public CacheErrorHandler errorHandler() {
        return new CacheErrorHandler() {
            @Override
            public void handleCacheGetError(RuntimeException e, Cache cache, Object key) {
                log.warn("캐시 조회 실패({}) - DB에서 직접 조회합니다: {}", cache.getName(), e.getMessage());
            }
            // handleCachePutError / handleCacheEvictError / handleCacheClearError도 동일하게 로그만
        };
    }
}
```

`CachingConfigurer.errorHandler()`로 캐시 관련 예외(조회/저장/무효화/전체삭제)를 앱까지 전파시키지 않고 경고 로그만 남기도록 만든 뒤, 로컬 Redis 컨테이너를 `docker stop`으로 직접 내리고 다시 요청을 날려 확인했다.

```
$ docker stop jibdaum-redis
$ curl -s -o /dev/null -w "status=%{http_code}\n" http://localhost:8081/api/shop/products
status=200
```

Redis가 없어도 200이 정상적으로 나오는 걸 확인하고 나서야 커밋·push했다. 이 안전장치 덕분에 프로덕션에 Redis가 없어도 "캐싱 없이 정상 동작"으로 안전하게 내려가고, Redis를 나중에 추가하면 그 시점부터 자동으로 캐싱 효과를 받는다.

## 검증 기록과 측정 범위

| 지표 | 값 |
|---|---|
| 상품 목록 조회, 캐시 미스(DB) 관측값 | 534ms |
| 상품 목록 조회, 캐시 히트(Redis) 관측값 | 28ms |
| 캐시 히트/미스 응답 바디 동일 여부 | 동일 (`diff` 결과 없음, 두 버그 수정 후) |
| Redis 다운 상태에서의 응답 | 200 (경고 로그만, 서비스 정상) |
| 당시 전체 회귀 테스트 | 33개 통과, 0 실패 — 동시 요청 부하 검증과는 별개 |
| Redis 캐시 스탬피드(TTL 만료 순간 동시 요청) 대응 | 없음 — 아래 한계 참고 |

534ms와 28ms는 캐시 적용 후 미스와 히트 경로를 호출하며 남긴 관측값이다. 측정 환경의 상세 사양·상품 데이터 규모·요청 반복 횟수·동시 요청 수와 응답 시간 분포는 기록하지 않았다. 따라서 이 두 값을 서비스 전체의 성능 개선율이나 평균·p95 응답 시간으로 해석하지 않는다.

다음 측정에서는 동일 환경과 상품 데이터 수, 요청 조건을 기록하고 캐시 미스와 히트를 나눠 반복 호출할 계획이다. 표본 수·동시 요청 수와 함께 중앙값·p95·오류율을 남겨 효과를 비교하고, TTL 만료 시 동시 요청도 별도로 확인한다. 이 재측정은 위의 완료된 기능 검증에 포함되지 않는다.

## 재발 방지 · 남은 과제

- **캐시 스탬피드 미대응**: TTL 30초가 만료되는 순간 요청이 몰리면 같은 데이터를 DB에서 반복 조회할 수 있다. 실제 동시 요청 한계는 아직 측정하지 않았으며, TTL 만료 구간의 DB 부하를 확인한 뒤 동시 로딩 제어가 필요한지 판단한다.
- **`@CacheEvict`가 실제 HTTP 경로로 e2e 검증되지 않음**: 어노테이션이 캐시 이름(`products`)과 정확히 일치하는지는 코드로 확인했지만, 관리자 로그인 → 상품 수정 → 목록 재조회까지 실제로 뚫어서 무효화를 검증하지는 않았다(로그인 플로우가 OAuth2라 로컬에서 빠르게 재현하기 번거로워 생략).
- **캐시 히트율 계측이 없음**: TTL 30초가 적절한 값인지 판단할 근거(히트율, 초당 무효화 빈도)가 없다. Micrometer + Redis `INFO` 커맨드로 히트/미스 카운터를 노출하면 이 값을 실측 기반으로 조정할 수 있다.
- **운영 환경 확인**: 이 사례에서 직접 확인한 것은 로컬 Redis 중단 시 조회가 성공한다는 점이다. 문서 작성 당시 운영 Redis 구성은 확인하지 못했으며, 운영 캐싱 효과는 EC2의 Redis 연결 설정과 실제 히트 여부를 확인해야 판단할 수 있다.
