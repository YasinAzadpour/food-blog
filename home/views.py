from django.shortcuts import render
from django.http.response import Http404
from .models import *
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required

User= get_user_model()

def home(request):
    return render(request, 'index.html')

def about(request):
    try:
        assert AboutUs.get_last()
        return render(request, 'index.html')
    except:
        raise Http404

@login_required(login_url="accounts/sign-in")
def if_login(request):
    return render(request, 'index.html')


def profile_for_admin(request, phone):
    try:
        assert request.user.is_superuser
        User.objects.get(phone=phone)
        return render(request, 'index.html')

    except:
        raise Http404

def admin_panel(request):
    if request.user.is_superuser:
        return render(request, 'index.html')

    raise Http404

def update_food(request, id):
    try:
        assert request.user.is_superuser
        Food.objects.get(id=id)
        return render(request, 'index.html')

    except:
        raise Http404

def get_food(request, slug):
    try:
        Food.objects.get(slug=slug)
        return render(request, 'index.html')

    except:
        raise Http404

def av_cart(request, id):
    try:
        assert request.user.is_superuser
        Cart.objects.get(id=id)
        return render(request, 'index.html')

    except:
        raise Http404