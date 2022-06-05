import os

import cv2
from django.conf import settings
from django.core import files
from django.db import models
from phonenumber_field.modelfields import PhoneNumberField


class Cart(models.Model):
    user = models.ForeignKey('accounts.MyUser', on_delete=models.CASCADE)
    delivered = models.BooleanField(default=False)
    paid = models.BooleanField(default=False)
    address = models.CharField(max_length=100, default='')
    # TODO: use map

    def to_json(self):
        items = [item.to_json() for item in self.orders.all()]
        data = {
                "id": self.id,
                "items": items,
                "price": sum([i["price"]*i["quantity"] for i in items]),
                "address": self.address,
                "user": self.user.to_json(),
                "paid": self.paid,
        }
        return data
        
    def __str__(self):
        return f"{self.user.phone}({'delivered' if self.delivered else 'not-delivered'})"


class Order(models.Model):
    cart = models.ForeignKey('home.Cart', on_delete=models.CASCADE,related_name="orders")
    food = models.ForeignKey('home.Food', on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)

    def to_json(self):
        return self.food.to_json()|{"quantity":self.quantity}

    def __str__(self):
        return f"{self.cart.user.phone}[{self.food.name}({self.quantity})]"


class Category(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

    def to_json(self,user):
        this_c = {}
        this_c['id'] = self.id
        this_c['title'] = self.name
        this_c['foods'] = [f.to_json(user) for f in self.food_set.all()]
        return this_c


class Food(models.Model):
    name = models.CharField(max_length=50, unique=True)
    about  = models.CharField(max_length=200)
    cal = models.FloatField()
    price = models.FloatField()
    slug = models.SlugField(unique=True)
    image  = models.ImageField(upload_to="foods/")
    category = models.ForeignKey('home.Category', on_delete=models.CASCADE)


    def __str__(self):
        return f"{self.name}"

    def to_json(self,user=None):
        data = {
            'id': self.id,
            'name': self.name,
            'about': self.about,
            'cal': self.cal,
            'price': self.price,
            'slug': self.slug,
            'url': f"/foods/{self.slug}",
            'image': self.image.url,
            'category': self.category.id,
            'liked': self in user.liked_foods.all() if user else False
        }
        return data


class Link(models.Model):
    name = models.CharField(unique=True, max_length=50)
    url = models.URLField(blank=True, null=True)
    tel = PhoneNumberField(blank=True, null=True)

    def __str__(self):
        return f"{self.name}"

    def to_json(self):
        data = {"id": self.id}
        data["name"] = self.name
        if self.url:
            data['url'] = self.url
        else:
            data['tel'] = self.tel.as_e164
        
        return data

    @classmethod
    def get_tel(cls):
        try:
            return cls.objects.get(name='tel').tel.as_e164
        except:
            return ""


class AboutUs(models.Model):
    title = models.CharField(max_length=50)
    image =  models.ImageField(upload_to="about/")
    text = models.TextField(max_length=100000)
    address = models.CharField(max_length=100, default='')
    # TODO: Use map

    def __str__(self):
        return f"{self.title}"

    def to_json(self):
        data = {
            'id': self.id,
            'title': self.title,
            'image': self.image.url,
            'text': self.text,
            'address': self.address,
        }
        return data

    @classmethod
    def get_last(cls):
        try:
            return cls.objects.last().to_json()
            
        except:
            return None


class Feedback(models.Model):
    user = models.ForeignKey('accounts.MyUser', on_delete=models.CASCADE)
    text = models.CharField(max_length=200)
    date = models.DateTimeField(auto_now=True)
    stars = models.IntegerField(default=1)
    is_read =  models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.phone.as_e164}"

    def to_json(self):
        data = {
            'id': self.id,
            'text': self.text,
            'stars': self.stars,
            'user__id': self.user.id,
            'user__name': self.user.name,
            'user__phone': self.user.phone.as_e164,
            'user__profile': self.user.profile.url if self.user.profile else '',
        }
        return data
