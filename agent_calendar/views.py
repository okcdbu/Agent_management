from django.shortcuts import render
from .models import Dayoff
from accounts.models import User
from django.core import serializers
from django.http import HttpResponse
import json


# Create your views here.


def index(request):
    return render(request, 'agent_calendar/index.html')


def dayoff(request):
    if request.method == 'GET':
        data = Dayoff.objects.all()
        data_json = serializers.serialize('json', data, use_natural_foreign_keys=True)
        return HttpResponse(data_json, content_type="text/json-comment-filtered; charset=utf-8")
    elif request.method == 'POST':
        newdata = json.loads(request.body)
        username = User.objects.get_by_natural_key(newdata['username'])
        if 'id' in newdata:
            dayoff = Dayoff.objects.update(id=newdata['id'],
                                           type=newdata['type'],
                                           content=newdata['content'],
                                           daytype=newdata['daytype'],
                                           date=newdata['date'],
                                           username=username)
        else:
            dayoff = Dayoff(type=newdata['type'],
                            content=newdata['content'],
                            daytype=newdata['daytype'],
                            date=newdata['date'],
                            username=username)
        dayoff.save()
        return HttpResponse(status=200)
    else:
        deldata = json.loads(request.body)
        Dayoff.objects.filter(id=deldata['id']).delete()
        return HttpResponse(status=200)