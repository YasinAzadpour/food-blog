import json

import numpy as np
from accounts.forms import UpdateUser,SignUpForm
from django.contrib.auth import get_user_model, login, authenticate
from django.core.exceptions import ObjectDoesNotExist
from django.http.response import JsonResponse
from django.middleware import csrf
from django.views.decorators.http import require_POST
from accounts.models import Token
from home.forms import *
from home.models import *
from PIL import Image
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
            print(Token.send_to_user(user).code)

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
        print(Token.send_to_user(this_user).code)
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

        data = clean_json_errors(form)|{'user': user.to_json()}
        return JsonResponse(data)

    return JsonResponse({'result': 'error'})


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
def mark_feedback_as_read(request):
    try:
        id = request.POST['id']

        assert request.user.is_superuser
        
        feedback = Feedback.objects.get(id=id)
        feedback.is_read = True
        feedback.save()

        feedbacks  = [f.to_json() for f in Feedback.objects.filter(is_read=False)]

        return JsonResponse({'result': 'ok', 'feedbacks': feedbacks})

    except:
        return JsonResponse({'result': 'error'})


@require_POST
def create_categroy(request):
    try:
        assert request.user.is_superuser
        form = CategoryForm(request.POST)

        if form.is_valid():
            form.save()

        categories = list(Category.objects.all().values())
        return JsonResponse(clean_json_errors(form)|{"categories": categories})
        
    except:
        return JsonResponse({"result": "error"})
   
@require_POST
def manage_foods(request, id=None):
    if request.user.is_superuser:
        
        request.POST = extract_data_from_form(request.POST)
        if id and Food.objects.filter(id=id).exists():
                food = Food.objects.get(id=id)
                form = FoodForm(request.POST, request.FILES, instance=food)

        else:
            form = FoodForm(request.POST, request.FILES)

        if form.is_valid():
            image = request.FILES.get('image')
            food = form.save()
            if image:
                image = np.array(Image.open(image))
                food.crop_image(image)
                
        all_foods = [f.to_json() for f in Food.objects.all()]
        return JsonResponse(clean_json_errors(form)|{"foods": all_foods})

    return JsonResponse({'result': 'error'})

@require_POST
def remove_food(request):
    try:
        id = request.POST['id']

        assert request.user.is_superuser
        
        Food.objects.get(id=id).delete()
        all_foods = [f.to_json() for f in Food.objects.all()]

        return JsonResponse({'result': 'ok',"foods": all_foods})

    except:
        return JsonResponse({'result': 'error'})

@require_POST
def remove_user(request):
    try:
        id = request.POST['id']

        assert request.user.is_superuser
        assert request.user.id != id
        
        User.objects.get(id=id).delete()

        allUsers = [u.to_json() for u in User.objects.all()]

        return JsonResponse({'result': 'ok', 'allUsers': allUsers})

    except:
        return JsonResponse({'result': 'error'})

@require_POST
def get_user_data(request, phone):
    try:

        assert request.user.is_superuser
        
        user = User.objects.get(phone=phone).to_json()

        return JsonResponse({'result': 'ok'} | user)

    except:
        return JsonResponse({'result': 'error'})

@require_POST
def refresh(request):
    # try:
    user = request.user
    data = {'main': {},'admin': {}, 'result': 'ok'}
    data['main']['sitename'] = "Chef"
    data['main']['tel'] = Link.get_tel()
    data['main']['csrfmiddlewaretoken'] = csrf.get_token(request)
    data['main']['links']= Link.get_tel()
    data['main']['about'] = AboutUs.get_last()
    data['main']['feedbacks']= [f.to_json() for f in Feedback.objects.filter(is_read=True)[:5]]
    data['main']['reccomendeds']= [f.to_json() for f in Food.objects.all().order_by("-id")[:5]]
    data['main']['foods'] = [c.to_json() for c in Category.objects.all()]

    if user.is_superuser:
        data['admin']['categories']= [{"id":c.id, "name": c.name} for c in Category.objects.all()]
        # TODO: use real data
        data['admin']['income'] = {
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
        data['admin']['users'] = [u.to_json() for u in User.objects.exclude(is_superuser=True, id=request.user.id)]
        data['admin']['feedbacks'] = [f.to_json() for f in Feedback.objects.filter(is_read=False)]
        data['admin']['foods'] = [f.to_json() for f in Food.objects.all()]
        data['admin']['orders'] = User.get_avalable_orders()

    if request.user.is_authenticated:
        data['main']['user'] = user.to_json()
        data['main']['likedFoods'] = [f.id for f in user.liked_foods.all()]
        data['main']['cart'] = [{"quantity": o.quantity}|o.food.to_json() for o in user.orders]
        data['main']['cartPaid'] = user.cart.paid

    else:
        data['main']['user'] = {}
        data['main']['likedFoods'] = []
        data['main']['cart'] = []
        data['main']['cartPaid'] = False


    return JsonResponse(data)

    # except:
    #     return JsonResponse({'result': 'error'})

@require_POST
def deliver_cart(request):
    try:
        assert request.user.is_superuser
        cart = Cart.objects.get(id=request.POST['id'])
        cart.delivered = True
        cart.save()
        return JsonResponse({"result": "ok", "orders": User.get_avalable_orders()})

    except:
        return JsonResponse({'result': 'error'})

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
    try:

        assert request.user.is_authenticated
        food_id = request.POST['id']
        food_quantity = request.POST['quantity']
        cart = request.user.manage_orders(food_id, food_quantity)
        cart = [{"quantity": i.quantity}|i.food.to_json() for i in cart]
        return JsonResponse({"result": "ok", "cart": cart})

    except:
        return JsonResponse({"result": "error"})

@require_POST
def like(request):
    try:
        assert request.user.is_authenticated
        food_id = request.POST["id"]
        request.user.like_food(food_id)
        data = {
            "result": "ok",
            "likedFoods": [f.id for f in request.user.liked_foods.all()]
        }
        return JsonResponse(data)

    except:
        return JsonResponse({"result": "error"})

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
