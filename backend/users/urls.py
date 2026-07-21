from django.urls import path
from .views import RegisterView, ProtectedView, ProfileView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("protected/", ProtectedView.as_view(), name="protected"),
    path("profile/", ProfileView.as_view(), name="profile"),
]