from django.shortcuts import render, redirect
from django.contrib import auth, messages
from accounts.models import User


# Create your views here.

# 회원 가입
def signup(request):
    # signup 으로 POST 요청이 왔을 때, 새로운 유저를 만드는 절차를 밟는다.
    if request.method == 'POST':
        # password와 confirm에 입력된 값이 같다면
        if request.POST['password'] == request.POST['re-password']:
            # user 객체를 새로 생성
            username = request.POST['fullname']
            password = request.POST['password']
            email = request.POST['email']
            callup_date = request.POST['callupdate']
            discharge_date = request.POST['dischargedate']
            if User.objects.all().filter(username=username).exists():
                messages.error(request, '이미 존재하는 사용자입니다.')
                return render(request, 'accounts/signup.html')
            else:
                user = User.objects.create_user(username=username, password=password, email=email,
                                                callup_date=callup_date, discharge_date=discharge_date)
                auth.login(request, user)
                return redirect('/')
        else:
            return redirect('/')
    # signup으로 GET 요청이 왔을 때, 회원가입 화면을 띄워준다.
    return render(request, 'accounts/signup.html')


# 로그인
def login(request):
    # login으로 POST 요청이 들어왔을 때, 로그인 절차를 밟는다.
    if request.method == 'POST':
        # login.html에서 넘어온 username과 password를 각 변수에 저장한다.
        username = request.POST['username']
        password = request.POST['password']

        # 해당 username과 password와 일치하는 user 객체를 가져온다.
        user = auth.authenticate(request, username=username, password=password)

        # 해당 user 객체가 존재한다면
        if user is not None:
            # 로그인 한다
            auth.login(request, user)
            return redirect('/')
        # 존재하지 않는다면
        else:
            messages.error(request, '사용자 정보가 정확하지 않습니다.')
            # 딕셔너리에 에러메세지를 전달하고 다시 login.html 화면으로 돌아간다.
            return render(request, 'accounts/login.html')
    # login으로 GET 요청이 들어왔을때, 로그인 화면을 띄워준다.
    else:
        return render(request, 'accounts/login.html')


# 로그 아웃
def logout(request):
    # logout으로 POST 요청이 들어왔을 때, 로그아웃 절차를 밟는다.
    if request.method == 'POST':
        auth.logout(request)
        return redirect('/')

    # logout으로 GET 요청이 들어왔을 때, 로그인 화면을 띄워준다.
    return render(request, 'accounts/login.html')


# 개인정보제공
def privacy_policy(request):
    return render(request, 'accounts/PrivacyPolicy.html')
