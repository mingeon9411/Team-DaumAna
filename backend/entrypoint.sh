#!/bin/sh
set -e

# MySQL 스키마 소유권은 Django 마이그레이션에 있음 (jipdaum-spring은 ddl-auto: none)
python manage.py migrate --noinput

# whitenoise가 서빙할 admin 정적 파일 생성
python manage.py collectstatic --noinput

exec gunicorn config.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 3 \
    --access-logfile - \
    --error-logfile -
