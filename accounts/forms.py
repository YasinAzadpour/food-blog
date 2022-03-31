from django.contrib.auth import get_user_model
from django.contrib.auth.forms import UserChangeForm, UserCreationForm


User = get_user_model()


class SignUpForm(UserCreationForm):
    class Meta:
        model = User
        fields = ("phone",)


class UpdateUser(UserChangeForm):
    class Meta:
        model = User
        fields = ('name', 'phone', 'email', 'profile', 'address')
