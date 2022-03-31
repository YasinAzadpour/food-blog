from django.urls import path
from .views import *


app_name = 'api' 

urlpatterns = [
    path('accounts/sign-in', sign_in, name='sign_in'),
    path('accounts/sign-up', sign_up, name='sign_up'),
    path('accounts/edit', edit_profile, name='sign_up'),
    path('accounts/get-token', get_token, name='get_token'),
    path('accounts/resend-token', resend_token, name='resend_token'),
]
