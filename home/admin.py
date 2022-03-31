from django.contrib import admin
from .models import *


@admin.register(Food)
class FoodAdmin(admin.ModelAdmin):

    list_display = ('name', 'price', 'cal')
    search_fields = ('name',)


admin.site.register(Category)
admin.site.register(AboutUs)
admin.site.register(Cart)
admin.site.register(Order)


@admin.register(Link)
class LinkAdmin(admin.ModelAdmin):
    list_display = ('name', 'url')
