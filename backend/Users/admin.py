from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User  # 👈 현재 Users 앱 내부의 고도화된 커스텀 유저 모델 로드

# ====================================================================
# 👤 [Users Domain] 커스텀 회원 관리 어드민 엔지니어링 (단독 전담 고정)
# ====================================================================
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Django 순정 BaseUserAdmin을 상속받아 오라클 암호화(Hashing) 인프라를 지키면서
    집다움 플랫폼의 물리 컬럼 구조에 맞게 리스트 디스플레이를 튜닝합니다.
    """
    
    # 1. 어드민 유저 메인 목록 화면에 노출할 오라클 컬럼 매핑 최적화
    # 'created_at' 필드명을 장고 표준 명칭인 'date_joined'로 교정 (오라클 DB에는 created_at으로 잘 들어갑니다!)
    list_display = ['id', 'username', 'nickname', 'email', 'is_staff', 'is_active', 'date_joined']
    
    # 2. 대량의 회원 정보 검색 시 오라클 인덱스를 타게 할 검색 최적화 필드 정의
    search_fields = ['username', 'nickname', 'email']
    
    # 3. 우측 사이드바 필터링 기능 추가 (회원 상태 관제용)
    list_filter = ['is_staff', 'is_active', 'is_superuser']
    
    # 4. 정렬 순서를 ID 오름차순(오라클 시퀀스 순서)으로 정렬
    ordering = ['id']

    # 5. 상세조회 및 회원 수정 화면에서 'created_at' 컬럼이 내장 폼과 충돌하지 않도록 필드셋 커스텀
    # 일반 BaseUserAdmin의 필드셋 설정을 유지하되, 필요 시 확장 가능하도록 아키텍처 개방
    fieldsets = BaseUserAdmin.fieldsets + (
        ('집다움 프로필 정보', {'fields': ('nickname',)}),
    )