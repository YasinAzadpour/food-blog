from django.urls import path
from .views import *


app_name = 'api' 

urlpatterns = [
    path('accounts/sign-in', sign_in, name='sign_in'),
    path('accounts/sign-up', sign_up, name='sign_up'),
    path('accounts/edit', edit_profile, name='sign_up'),
    path('accounts/get-token', get_token, name='get_token'),
    path('accounts/resend-token', resend_token, name='resend_token'),
    path('accounts/remove', remove_user, name='remove_user'),
    path('foods/create', manage_foods, name='create_food'),
    path('foods/remove', remove_food, name='remove_food'),
    path('foods/update/<int:id>', manage_foods, name='update_food'),
    path('foods/like', like, name='like_food'),
    path('category/new', create_categroy, name='create_category'),
    path('feedbacks/mark-as-read', mark_feedback_as_read, name='mark_feedback_as_read'),
    path('feedbacks/send', send_feedback, name='send_feedback'),
    path('cart/pay', pay_cart, name='pay_cart'),
    path('cart/deliver', deliver_cart, name='deliver_cart'),
    path('buy', buy, name='buy'),
    path('profile/<phone>', get_user_data, name='get_user_data'),
    path('refresh', refresh, name='refresh'),

]
