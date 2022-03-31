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

    def __str__(self):
        return f"{self.user.phone}({'delivered' if self.delivered else 'not-delivered'})"


class Category(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

    def to_json(self):
        this_c = {}
        this_c['id'] = self.id
        this_c['title'] = self.name
        this_c['foods'] = [f.to_json() for f in self.food_set.all()]
        return this_c


class Food(models.Model):
    name = models.CharField(max_length=50, unique=True)
    about  = models.CharField(max_length=200)
    cal = models.FloatField()
    price = models.FloatField()
    slug = models.SlugField(unique=True)
    image  = models.ImageField(upload_to="foods/")
    category = models.ForeignKey(Category, on_delete=models.CASCADE)


    def __str__(self):
        return f"{self.name}"
    
    def crop_image(self, img, ColorConversionCode=cv2.COLOR_BGR2RGB):
        '''
        output-size : 1500*500
        output-path : foods/(self.id)/(self.id)-image.png
        '''
        try:
            imageY, imageX = img.shape[0], img.shape[1]

            width = imageX
            height = int(width/3)
            x = 0
            y = int((imageY/2)-(height/2))

            img = img[y:y+height, x:x+width]
            img = cv2.cvtColor(img, ColorConversionCode)
            img = cv2.resize(img, settings.FOOD_IMAGE_SIZE)

            path = f'{settings.FOOD_DATA_PATH}/{self.pk}/'
            if not os.path.exists(path):
                os.mkdir(path)
            path += f'{self.pk}-image.png'

            self.image.delete()
            cv2.imwrite(path, img)

            self.image = files.File(open(path, 'rb')).name.replace('web/media/', '')

            self.save()
            return True

        except:
            return False

    def to_json(self):
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