"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
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
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from django.http import HttpResponse

def home(request):
    return HttpResponse("""
    <!DOCTYPE html>
    <html>
    <head>
        <title>BudgetBuddy API</title>
        <style>
            body{
                margin:0;
                font-family:Arial, sans-serif;
                background:linear-gradient(135deg,#4F46E5,#06B6D4);
                display:flex;
                justify-content:center;
                align-items:center;
                height:100vh;
                color:white;
            }
            .card{
                background:rgba(255,255,255,0.12);
                padding:40px;
                border-radius:15px;
                text-align:center;
                box-shadow:0 8px 20px rgba(0,0,0,0.3);
            }
            h1{
                margin-bottom:10px;
                font-size:42px;
            }
            p{
                font-size:20px;
            }
            .status{
                color:#7CFC00;
                font-weight:bold;
            }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>💰 BudgetBuddy API</h1>
            <p>Welcome to the BudgetBuddy Backend</p>
            <p class="status">🟢 Server is Running Successfully</p>
            <hr>
            <p>Built with Django REST Framework</p>
        </div>
    </body>
    </html>
    """)

urlpatterns = [
    path('admin/', admin.site.urls),

    # Register API
    path('api/', include('users.urls')),
    path("api/", include("expenses.urls")),
    path("api/", include("income.urls")),
    path("api/", include("budgets.urls")),
    path("", home, name="home"),
    path("api/", include("goals.urls")),
    path("api/", include("summary.urls")),

    # Login API (JWT)
    path('api/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),

    # Refresh Token API
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns += [
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]