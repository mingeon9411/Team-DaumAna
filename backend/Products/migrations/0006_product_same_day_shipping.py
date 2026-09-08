from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Products', '0005_wishlist'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='same_day_shipping',
            field=models.BooleanField(default=False),
        ),
    ]
