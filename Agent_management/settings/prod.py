from .base import *

ALLOWED_HOSTS = ['54.180.60.76', '192.168.99.100', 'wachi-agent.site']
# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'HOST': os.environ.get('DB_HOST'),
        'NAME': os.environ.get('DB_NAME'),
        'USER': os.environ.get('DB_USER'),
        'PASSWORD': os.environ.get('DB_PASS'),
        'PORT': '5432',  # 5432는 PostgreSQL의 기본포트이다
    }
}
