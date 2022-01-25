from django.db import models
from accounts.models import User


class Dayoff(models.Model):
    type = models.CharField(max_length=30)
    content = models.TextField()
    daytype = models.CharField(max_length=20)
    date = models.DateField(null=True)
    username = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user', db_column='username')
    cancelled = models.BooleanField(default=False)


class Roulette(models.Model):
    name = models.TextField(null=False)
    date = models.DateField(auto_now_add=True)
    winner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='winner', db_column='winner')

