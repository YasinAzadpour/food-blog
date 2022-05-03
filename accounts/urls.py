from django.urls import path
from .views import *


app_name = 'accounts' 

urlpatterns = [
    path('sign-in', auth, name='sign_in'),
    path('sign-up', auth, name='sign_up'),
    path('log-out', log_out, name='log_out'),
]
