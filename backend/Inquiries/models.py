from django.db import models


class Inquiry(models.Model):
    """마이페이지 1:1 문의 — 회원이 제목/내용으로 남기면, 관리자가 이 admin
    화면에서 answer 필드만 채워 답변한다(별도 API 없이 Django Admin이 곧 답변 창구)."""
    user = models.ForeignKey('Users.User', on_delete=models.CASCADE, related_name='inquiries', verbose_name='작성자')
    title = models.CharField(max_length=200, verbose_name='제목')
    content = models.TextField(verbose_name='문의 내용')
    answer = models.TextField(null=True, blank=True, verbose_name='답변')
    answered_at = models.DateTimeField(null=True, blank=True, verbose_name='답변 일시')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='작성일')

    class Meta:
        db_table = 'JIPDAUM_INQUIRY'
        verbose_name = '1:1 문의'
        verbose_name_plural = '1:1 문의 목록'
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.user.username}] {self.title}"
