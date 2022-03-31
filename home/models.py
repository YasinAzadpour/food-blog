import os

import cv2
from django.conf import settings
from django.core import files
from django.db import models


class Food(models.Model):
    name = models.CharField(max_length=50, unique=True)
    about  = models.CharField(max_length=200)
    cal = models.FloatField()
    price = models.FloatField()
    slug = models.SlugField(unique=True)
    image  = models.ImageField(upload_to="foods/")
    # TODO: add category

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
        }
        return data

