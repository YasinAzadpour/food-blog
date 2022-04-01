from django.forms import ModelForm
from .models import *


class FoodForm(ModelForm):
    class Meta:
        model = Food
        fields = '__all__'

class CategoryForm(ModelForm):
    class Meta:
        model = Category
        fields = '__all__'

class FeedbackForm(ModelForm):
    class Meta:
        model = Feedback
        fields = ('user', 'text')

