from django.contrib import admin
from .models import Product, ProductImage, Order


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    max_num = 5


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price',
                    'stock_quantity', 'owner', 'created_at']
    list_filter = ['category', 'created_at']
    search_fields = ['name', 'description', 'owner__email']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [ProductImageInline]


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ['product', 'order', 'created_at']
    list_filter = ['created_at']
    search_fields = ['product__name']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'product', 'buyer', 'seller',
                    'quantity', 'total_price', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['product__name', 'buyer__email', 'seller__email']
    readonly_fields = ['created_at', 'updated_at', 'total_price']
    list_editable = ['status']
