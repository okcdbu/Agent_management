"""Agent_management URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path
from django.contrib import admin
from agent_calendar import views as main_views
from accounts import views as login_views
urlpatterns = [
    path('', main_views.index),
    path('admin/', admin.site.urls),
    path('login/', login_views.login, name='login'),
    path('signup/', login_views.signup, name='signup'),
    path('logout/', login_views.logout, name='logout'),
    path('privacy_policy/', login_views.privacy_policy, name='privacy_policy'),
    path('dayoff/', main_views.DayoffView.as_view(), name='dayoff'),
    path('roulette/', main_views.roulette, name='roulette'),
    path('info/', main_views.info, name='info'),
]
