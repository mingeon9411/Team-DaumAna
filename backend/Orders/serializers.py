# 백엔드 개발자가 추후 공통 연동을 위해 core 폴더 안에도 serializers.py 파일을 만들 예정이라면, 
# 파일 시스템 인지 오류를 막기 위해 껍데기 파일만 만들어 놨어요.
# 기능별 앱 분리로 인해 이 파일의 시리얼라이저들은 각각의 앱 폴더로 이사했어요.
# 장고 규격 유지를 위해 파일은 절대 삭제하지 않고 빈 상태로 보존합니다. 알았죠? 팀원 여러분~! ^__^

from rest_framework import serializers
from .models import Cart


class CartItemSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField(source='product.id', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    price = serializers.IntegerField(source='product.base_price', read_only=True)
    image = serializers.CharField(source='product.thumbnail_url', read_only=True)
    option_id = serializers.SerializerMethodField()
    option_name = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'product_id', 'product_name', 'price', 'image',
                  'option_id', 'option_name', 'quantity']

    def get_option_id(self, obj):
        return obj.option.id if obj.option else None

    def get_option_name(self, obj):
        if obj.option:
            return f"{obj.option.option_name}: {obj.option.option_value}"
        return None