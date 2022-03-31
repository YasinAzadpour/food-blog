import os
from datetime import datetime, timedelta, timezone

import cv2
from django.conf import settings
from django.contrib import auth
from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import AbstractUser
from django.core import files
from django.core.exceptions import ObjectDoesNotExist
from django.db import models
from django.utils.crypto import get_random_string
from django.utils.translation import gettext_lazy as _
from phonenumber_field.modelfields import PhoneNumberField


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, phone, name, email, password, **extra_fields):
        """
        Create and save a user with the given phone, email, and password.
        """
        if not phone:
            raise ValueError('The given phone must be set')
            
        email = self.normalize_email(email)
        # Lookup the real model class from the global app registry so this
        # manager method can be used in migrations. This is fine because
        # managers are by definition working on the real model.
        user = self.model(phone=phone, email=email, **extra_fields)
        user.password = make_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, phone, name, email=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(phone, name, email, password, **extra_fields)

    def create_superuser(self, phone, name, email=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self._create_user(phone, name, email, password, **extra_fields)

    def with_perm(self, perm, is_active=True, include_superusers=True, backend=None, obj=None):
        if backend is None:
            backends = auth._get_backends(return_tuples=True)
            if len(backends) == 1:
                backend, _ = backends[0]
            else:
                raise ValueError(
                    'You have multiple authentication backends configured and '
                    'therefore must provide the `backend` argument.'
                )
        elif not isinstance(backend, str):
            raise TypeError(
                'backend must be a dotted import path string (got %r).'
                % backend
            )
        else:
            backend = auth.load_backend(backend)
        if hasattr(backend, 'with_perm'):
            return backend.with_perm(
                perm,
                is_active=is_active,
                include_superusers=include_superusers,
                obj=obj,
            )
        return self.none()


class MyUser(AbstractUser):

    username = last_name = first_name = None
    name = models.CharField(max_length=50)
    phone = PhoneNumberField(unique=True)
    email = models.EmailField(blank=True)
    profile = models.ImageField(upload_to="users/", blank=True)
    address = models.CharField(max_length=500, default='', blank=True)

    objects = UserManager()

    USERNAME_FIELD = 'phone'
    REQUIRED_FIELDS = ['email', 'name']

    def __str__(self):
        return f"{self.phone}"

    def crop_profile(self, img, ColorConversionCode=cv2.COLOR_BGR2RGB):
        '''
        `output-size`: 400*400
        `output-path` : users/(user.id)/(user.id)-profile.png 
        '''
        try:
            imageY, imageX = img.shape[0], img.shape[1]

            maxSize = imageX if imageX < imageY else imageY
            x = 0 if imageY < imageX else int(imageY/2-(maxSize/2))
            y = 0 if imageX < imageY else int(imageX/2-(maxSize/2))

            img = img[x:x+maxSize, y:y+maxSize]
            img = cv2.cvtColor(img, ColorConversionCode)

            img = cv2.resize(img, settings.USER_PROFILE_IMAGE_SIZE)

            path = f'{settings.USER_DATA_PATH}/{self.pk}/'
            if not os.path.exists(path):
                os.mkdir(path)
            path += f'{self.pk}-profile.png'

            self.profile.delete()
            cv2.imwrite(path, img)

            self.profile = files.File(open(path, 'rb')).name.replace('web/media/', '')
            self.save()
            return True

        except:
            return False

    def to_json(self):
        data = {
            'id': self.pk,
            'phone': self.phone.as_e164,
            'name': self.name,
            'email': self.email,
            'profile': self.profile.url if self.profile else '',
            'address': self.address,
            'isStaff': self.is_staff,
            'isSuperUser': self.is_superuser,
        }
        return data

    def send_message(msg):
        pass


class Token(models.Model):
    user = models.ForeignKey(MyUser, on_delete=models.CASCADE)
    code = models.CharField(max_length=10)
    date = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.phone}"

    @classmethod
    def evalute_code(cls, code, user):
        try:
            codes = cls.objects.filter(user=user)
            this_code = codes.get(code=code)
            codes.delete()
            now = datetime.now(tz=timezone.utc)
            return "ok" if now - this_code.date < timedelta(minutes=1) else "Code expired."

        except ObjectDoesNotExist:
            return "Invalid code."

        except:
            return None
        
    @classmethod
    def gen_key(cls, user, length=10):
        try:
            return cls.objects.create(user=user, code=get_random_string(length))
        except:
            return None

    @classmethod
    def send_to_user(cls, user):
        token  = cls.gen_key(user)
        # send message ...
        return token
