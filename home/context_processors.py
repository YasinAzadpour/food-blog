from django.middleware import csrf


def token(request):
    return {'csrfmiddlewaretoken': csrf.get_token(request)}
