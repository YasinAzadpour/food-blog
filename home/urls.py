from django.urls import path
from .views import *


app_name = 'home' 

urlpatterns = [
    path('', home, name="home"),
    path('about', about, name="about"),
    path('me/settings', if_login, name="edit_profile"),
    # path('cart', if_login, name="card"),
    path('admin-panel', admin_panel, name="admin_panel"),
    path('foods/<slug:slug>', get_food, name="update_food"),
    path('orders/<int:id>', av_cart, name="get_avalable_cart"),
]
