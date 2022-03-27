from django.db.models.signals import post_save
from django.dispatch import receiver
import pandas as pd
from datetime import date
from .models import Menu, Menufile


@receiver(post_save, sender=Menufile)
def creat_menu(sender, instance, created, **kwargs):
    if created:
        file = pd.read_excel(instance.data.path, header=None).values.tolist()
        year = instance.created_date.year
        month = instance.created_date.month
        i = 0
        while i < len(file):
            for j in range(len(file[i])):
                if not pd.isna(file[i][j]):
                    Menu.objects.create(menu=file[i + 1][j], date=date(year, month, int(file[i][j])))
            i += 2