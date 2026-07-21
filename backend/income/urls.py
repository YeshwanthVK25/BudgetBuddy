from django.urls import path
from .views import IncomeListCreateView, IncomeDetailView

urlpatterns = [
    path("income/", IncomeListCreateView.as_view(), name="income-list-create"),
    path("income/<int:pk>/", IncomeDetailView.as_view(), name="income-detail"),
]