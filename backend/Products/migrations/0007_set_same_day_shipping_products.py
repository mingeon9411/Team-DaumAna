from django.db import migrations


SAME_DAY_SHIPPING_PRODUCT_NAMES = [
    '북유럽풍 러그 B형', '우드 롱 무드등', '북유럽풍 침대 작은 무드등',
    '린넨 우드 소파', '북유럽 소파', '유러피안 우드 소파',
    '린넨 빨래 바구니', '북유럽 문양 빨래 바구니', '북유럽풍 러그 A형',
    '친환경 우드 빨래 바구니', '우드 의자', '유럽풍 피서지 의자', '북유럽 침대',
]


def set_same_day_shipping(apps, schema_editor):
    Product = apps.get_model('Products', 'Product')
    products = Product.objects.filter(collection='main')
    products.update(same_day_shipping=False)
    products.filter(name__in=SAME_DAY_SHIPPING_PRODUCT_NAMES).update(same_day_shipping=True)


class Migration(migrations.Migration):

    dependencies = [
        ('Products', '0006_product_same_day_shipping'),
    ]

    operations = [
        migrations.RunPython(set_same_day_shipping, migrations.RunPython.noop),
    ]
