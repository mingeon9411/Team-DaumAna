from django.contrib import admin
from django.urls import path

# 회원/상품/쿠폰/결제/챗봇 API는 전부 Spring Boot(jipdaum-spring)로 이관 완료.
# Django는 이제 관리자 화면(admin) 전용 — MySQL 스키마는 계속 Django 마이그레이션이 소유하고,
# Spring 쪽 JPA는 ddl-auto: none으로 스키마에 손대지 않는다.
urlpatterns = [
    path('admin/', admin.site.urls),
]
