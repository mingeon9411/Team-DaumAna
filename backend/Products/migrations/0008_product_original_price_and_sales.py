from django.db import migrations, models


SALE_DISCOUNTS = {
    2: 16, 3: 28, 6: 12, 7: 21, 8: 9, 9: 25, 10: 14, 18: 7, 19: 23,
    20: 11, 21: 27, 22: 19, 23: 8, 27: 26, 31: 18, 34: 30, 35: 17,
    36: 13, 37: 29, 38: 6,
}


def apply_sales(apps, schema_editor):
    Product = apps.get_model('Products', 'Product')
    for product in Product.objects.filter(
        collection='main', id__in=SALE_DISCOUNTS, original_price__isnull=True
    ):
        original_price = product.base_price
        product.original_price = original_price
        product.base_price = original_price * (100 - SALE_DISCOUNTS[product.id]) // 100
        product.save(update_fields=['original_price', 'base_price'])


class Migration(migrations.Migration):

    dependencies = [
        ('Products', '0007_set_same_day_shipping_products'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='original_price',
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
        migrations.RunPython(apply_sales, migrations.RunPython.noop),
    ]
