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
            'description': '답변 내용을 입력하고 저장하면 회원 마이페이지에 바로 표시됩니다.',
        }),
    )

    @admin.display(description='상태')
    def status_badge(self, obj):
        if obj.answer:
            return format_html(
                '<span style="color:#2e7d32;font-weight:700">{}</span>', '답변 완료'
            )
        return format_html('<span style="color:#e65100">{}</span>', '답변 대기')

    def save_model(self, request, obj, form, change):
        if obj.answer and not obj.answered_at:
            obj.answered_at = timezone.now()
        super().save_model(request, obj, form, change)
