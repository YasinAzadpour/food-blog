import json
from django.http import Http404

import numpy as np
from accounts.forms import UpdateUser,SignUpForm
from django.contrib.auth import get_user_model, login, authenticate, logout
from django.contrib.auth.forms import PasswordChangeForm
from django.core.exceptions import ObjectDoesNotExist
from django.http.response import JsonResponse
from django.middleware import csrf
from django.views.decorators.http import require_POST
from accounts.models import Token
from home.forms import *
from home.models import *
from PIL import Image
from django.contrib.sessions.models import Session
import random


User = get_user_model()


@require_POST
def sign_in(request):
    try:
        assert not request.user.is_authenticated
        phone = request.POST['phone']
        password = request.POST['password']

        this_user = User.objects.get(phone=phone)

        if this_user.check_password(password):
            print(Token.send_to_user(this_user).code)
            # TODO: Use an api for send this code 

            return JsonResponse({'result': 'ok'})

        return JsonResponse({'result': 'error', 'password': 'phone and password do not match!'})

    except ObjectDoesNotExist:
        return JsonResponse({'result': 'error', 'phone': 'This user does not exist!'})

    except:
        return JsonResponse({'result': 'error'})

@require_POST
def sign_up(request):
    if not request.user.is_authenticated:
        passwd = request.POST['password']
        request.POST = extract_data_from_form(request.POST)|{"password1": passwd, "password2": passwd}

        form = SignUpForm(request.POST)
        
        if form.is_valid():
            user = form.save()
            print(f"[ {Token.send_to_user(user).code } ] send to user")
            # TODO: send to user

        return JsonResponse(clean_json_errors(form)|{'csrfmiddlewaretoken': csrf.get_token(request)})

    return JsonResponse({"result": "error"})

@require_POST
def get_token(request):
    try:
        assert not request.user.is_authenticated
        phone = request.POST['phone']
        password = request.POST['password']
        code  = request.POST['code']

        this_user = authenticate(phone=phone, password=password)
        
        assert this_user is not None
        result = Token.evalute_code(code, this_user)

        if result == "ok":
            login(request, this_user)
            return JsonResponse({'result': 'ok'})

        return JsonResponse({'result': 'error', 'code': result})

    except:
        return JsonResponse({'result': 'error'})

@require_POST
def resend_token(request):
    try:
        phone = request.POST['phone']
        password = request.POST['password']
        this_user = authenticate(phone=phone, password=password)

        assert this_user is not None
        # delete all previus code 
        Token.objects.filter(user=this_user).delete()
        # send new code to user
        print(f"[ {Token.send_to_user(this_user).code } ] send to user")
        # TODO: send code to user
        
        return JsonResponse({'result': 'ok'})

    except:
        return JsonResponse({'result': 'error'})

@require_POST
def edit_profile(request):
    if request.user.is_authenticated:

        user = request.user

        request.POST = extract_data_from_form(request.POST)

        # merge old and new data
        form = UpdateUser(user.to_json()|request.POST, request.FILES, instance=user)

        if form.is_valid():
            profile = request.FILES.get('profile')
            form.save()
            if profile:
                profile = np.array(Image.open(profile))
                print(user.crop_profile(profile))

        data = clean_json_errors(form)|{'me': user.to_json()}
        return JsonResponse(data)

    return JsonResponse({'result': 'error'})


@require_POST
def change_password(request):
    request.POST = extract_data_from_form(request.POST)

    form = PasswordChangeForm(request.user,request.POST)
    
    if form.is_valid():
        user = form.save()
        login(request,user)

    return JsonResponse(clean_json_errors(form)|{'csrfmiddlewaretoken': csrf.get_token(request)})

@require_POST
def log_out(request):
    logout(request) 
    return JsonResponse({'result': 1})

@require_POST
def delete_account(request):
    user = request.user
    if user.is_authenticated:
        password = request.POST.get('password')
        is_valid = user.check_password(password)

        if is_valid:
            user.delete()
            return JsonResponse({'result': 1})

        return JsonResponse({'result': 0,'password': 'Incurrect password.'})
        
    return JsonResponse({'result': 0})

@require_POST
def kill_all_other(request):
    user = request.user
    if user.is_authenticated:
        my_session_key = request.session.session_key
        for s in Session.objects.exclude(session_key=my_session_key):
            data = s.get_decoded()
            if data.get('_auth_user_id') == str(user.pk):
                s.delete()

        return JsonResponse({'result': 1})
        
    return JsonResponse({'result': 0})

@require_POST
def me(request):
    user = request.user
    if user.is_authenticated:
        return JsonResponse({'result': 1, 'me': user.to_json()})

    return JsonResponse({'result': 0,'me': {}})


@require_POST
def send_feedback(request):
    if request.user.is_authenticated:
        request.POST = extract_data_from_form(request.POST|{"user": request.user})
        form = FeedbackForm(request.POST)
        if form.is_valid():
            form.save()

        return JsonResponse(clean_json_errors(form))

    return JsonResponse({'result': 'error'})

@require_POST
def home(request):
    user = request.user if request.user.is_authenticated else None
    is_home = request.POST.get('all',True)
    data = {'result': 1}
    data['tel'] = Link.get_tel()
    data['links']= [l.to_json() for l in Link.objects.exclude(name='tel')]
    data['me'] = user.to_json() if user else {}
    # data['csrfmiddlewaretoken'] = csrf.get_token(request)
    if is_home:
        data['feedbacks']= [f.to_json() for f in Feedback.objects.filter(is_read=True)[:5]]
        data['reccomendeds']= [f.to_json() for f in Food.objects.all().order_by("-id")[:15]]
        data['foods'] = [c.to_json(user) for c in Category.objects.all()]

    return JsonResponse(data)

@require_POST
def deliver_cart(request):
    try:
        assert request.user.is_superuser
        cart = Cart.objects.get(id=request.POST['id'])
        cart.delivered = True
        cart.save()
        return JsonResponse({"result": 1})

    except:
        return JsonResponse({'result': 0})

@require_POST
def pay_cart(request):
    try:
        user = request.user
        assert user.is_authenticated
        cart = user.cart
        cart.address = request.POST['address']
        # PRODUCTION: Conect to the bank
        cart.paid = True
        cart.save()

        return JsonResponse({"result": "ok"})

    except:
        return JsonResponse({"result": "error"})

@require_POST
def buy(request):
    # try:

    if request.user.is_authenticated:
        food_id = request.POST['id']
        food_quantity = request.POST['quantity']
        cart = request.user.manage_orders(food_id, food_quantity)
        return JsonResponse({"result": 1})

    return JsonResponse({"result": 0})
    # except:

@require_POST
def like(request):
    try:
        assert request.user.is_authenticated
        food_id = request.POST["id"]
        request.user.like_food(food_id)
        data = {
            "result": 1,
            # "likedFoods": [f.id for f in request.user.liked_foods.all()]
        }
        return JsonResponse(data)

    except:
        return JsonResponse({"result": 1})


@require_POST
def about_us(request):
    about = AboutUs.get_last()
    return JsonResponse({'result': 1}|about)

@require_POST
def get_food(request, slug):
    try:
        data  = {'result': 1}
        user =request.user
        food = Food.objects.get(slug=slug)
        if user.is_authenticated:
            data['paid'] = user.orders.filter(food=food).exists()
            data['quantity'] = user.orders.get(food=food).quantity if data['paid'] else 1
        return JsonResponse(data|food.to_json())
    except Food.DoesNotExist:
        raise Http404



def clean_json_errors(form):

    if form.errors:
        data = json.loads(form.errors.as_json())
        for key, value in data.items():
            data[key] = value[0]['message']
        
        data['result'] = 'error'

        return data

    return {"result": "ok"}

def extract_data_from_form(data):
    newData = {}
    for key,value in data.items():
        newData[key] = value[0] if type(value) == list else value
    
    return newData

@require_POST
def admin_data(request):
    user = request.user
    data = {}
    if user.is_superuser:
        # TODO: use real data
        data['income'] = {
            "weak": {
                "data": [random.randint(.5e6,1e6) for _ in range(7)],
                "labels": ["SAT","SUN","MON","TUE","WED","THU","FRI"],
            },
            "month": {
                "data": [random.randint(1e6,5e6) for _ in range(30)],
                "labels": list(range(1,31))
            },
            "year": {
                "data": [random.randint(10e6,50e6) for _ in range(3)],
                "labels": [2019, 2020, 2021],
            }
        }

        data['orders'] = User.get_avalable_orders()
        return JsonResponse({'result': 1}|data)

    return JsonResponse({'result': 0})

@require_POST
def get_order(request, id):
    try:
        assert request.user.is_superuser
        cart = Cart.objects.get(id=id)
        return JsonResponse({"result": 1,'cart': cart.to_json()})

    except:
        return JsonResponse({'result': 0})

@require_POST
def my_cart(request):
    user = request.user
    if user.is_authenticated:
        return JsonResponse({"result": 1,'cart': user.cart.to_json()})

    return JsonResponse({'result': 0})
