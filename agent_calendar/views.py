from django.shortcuts import render, get_object_or_404
from .models import *
from accounts.models import User
from django.core import serializers
from django.http import HttpResponse
from django.views import View
from datetime import date
import json


# Create your views here.


def index(request):
    result = Roulette.objects.filter(date=date.today())
    menu = Menu.objects.filter(date=date.today())
    return render(request, 'agent_calendar/index.html', context={'result': result, 'diet': menu})


def info(request):
    current_user = User.objects.filter(username=request.user.username)
    userdata = serializers.serialize('json', current_user, fields=("callup_date", "discharge_date", "username"))
    dayoff_user = Dayoff.objects.filter(username=request.user.id)
    dayoffdata = serializers.serialize('json', dayoff_user, use_natural_foreign_keys=True)
    return render(request, 'userinfo/info.html', context={'curuser': userdata, 'dayoff': dayoffdata})


def roulette(request):
    if request.method == 'GET':
        roulettetype = request.GET.get('type', '')
        users = User.objects.all().values('username')
        dayoffusers = Dayoff.objects.filter(date=date.today()).exclude(daytype='PM').values(
            'username__username')
        data = dict()
        for user in users:
            data[user['username']] = True
            for dayoffuser in dayoffusers:
                if data[user['username']] == dayoffuser['username__username']:
                    data[user] = False
        return render(request, 'agent_calendar/roulette.html', context={'users': data, 'type': roulettetype})
    else:
        newdata = json.loads(request.body)
        winner = User.objects.get_by_natural_key(newdata['winner'])
        result = Roulette(name=newdata['name'],
                          winner=winner)
        result.save()
        return HttpResponse(status=200)


class DayoffView(View):

    def get(self, request):
        data = Dayoff.objects.all()
        data_json = serializers.serialize('json', data, use_natural_foreign_keys=True)
        return HttpResponse(data_json, content_type="text/json-comment-filtered; charset=utf-8")

    def post(self, request):
        newdata = json.loads(request.body)
        username = User.objects.get_by_natural_key(newdata['username'])
        dayoff = Dayoff(type=newdata['type'],
                        content=newdata['content'],
                        daytype=newdata['daytype'],
                        date=newdata['date'],
                        username=username)
        dayoff.save()
        data_json = serializers.serialize('json', Dayoff.objects.filter(id=dayoff.id), use_natural_foreign_keys=True)
        return HttpResponse(data_json, status=200, content_type='application/json; charset=utf-8')

    def put(self, request):
        newdata = json.loads(request.body)
        dayoff = get_object_or_404(Dayoff, pk=newdata['id'])
        dayoff.type = newdata['type']
        dayoff.content = newdata['content']
        dayoff.daytype = newdata['daytype']
        dayoff.save()
        return HttpResponse(status=200)

    def delete(self, request):
        deldata = json.loads(request.body)
        dayoff = get_object_or_404(Dayoff, pk=deldata['id'])
        dayoff.delete()
        return HttpResponse(status=200)
