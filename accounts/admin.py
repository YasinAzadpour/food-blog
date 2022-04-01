from django.contrib import admin
from django.utils.translation import gettext_lazy as _

from .models import MyUser


@admin.register(MyUser)
class UserAdmin(admin.ModelAdmin):
    fieldsets = (
        (None, {'fields': ('phone', 'password')}),
        (_('Personal info'), {'fields': ('profile', 'name', 'email', 'address', 'liked_foods')}),
        (_('Permissions'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )

    list_display = ('phone', 'email', 'name', 'is_staff','is_superuser')
    list_filter = ('is_staff', 'is_superuser', 'is_active')
    search_fields = ('phone', 'name', 'email')

