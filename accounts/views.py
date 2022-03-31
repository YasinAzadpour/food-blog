from django.contrib import auth
from django.shortcuts import redirect, render


def auth(request):
    if not request.user.is_authenticated:
        template_name = 'index.html'
        return render(request,template_name)

    return redirect('/')


def log_out(request):
    auth.logout(request)
    return redirect('accounts:sign_in')
