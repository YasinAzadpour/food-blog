import json

import numpy as np
from accounts.forms import SignUpForm, UpdateUser
from django.contrib.auth import get_user_model, login, authenticate
from django.core.exceptions import ObjectDoesNotExist
from django.http.response import JsonResponse
from django.middleware import csrf
from django.views.decorators.http import require_POST
from accounts.models import Token
from PIL import Image


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
