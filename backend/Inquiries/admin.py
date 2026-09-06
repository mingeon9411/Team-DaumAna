from django.contrib import admin
from django.utils import timezone
from django.utils.html import format_html
from .models import Inquiry


@admin.register(Inquiry)
class InquiryAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'title', 'status_badge', 'created_at', 'answered_at']
    list_filter = ['created_at']
    search_fields = ['title', 'content', 'user__username', 'user__email']
    readonly_fields = ['user', 'title', 'content', 'created_at', 'answered_at']
    autocomplete_fields = ['user']

    fieldsets = (
        ('문의 내용', {
            'fields': ('user', 'title', 'content', 'created_at'),
        }),
        ('답변', {
            'fields': ('answer', 'answered_at'),
            'description': '답변 내용을 입력하고 저장하면 회원 마이페이지에 바로 노출됩니다.',
        }),
    )

    @admin.display(description='상태')
    def status_badge(self, obj):
        if obj.answer:
            return format_html('<span style="color:#2e7d32;font-weight:700">답변완료</span>')
        return format_html('<span style="color:#e65100">답변대기</span>')

    def save_model(self, request, obj, form, change):
        # answer가 이번에 처음 채워졌으면(비어있다가 값이 생기면) 답변 일시를 자동으로 찍는다 —
        # 관리자가 매번 answered_at을 손으로 입력할 필요가 없게.
        if obj.answer and not obj.answered_at:
            obj.answered_at = timezone.now()
        super().save_model(request, obj, form, change)
