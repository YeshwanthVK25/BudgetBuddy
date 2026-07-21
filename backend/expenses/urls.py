from django.urls import path
from .views import ExpenseListCreateView, ExpenseDetailView, TotalExpenseView

urlpatterns = [
    path("expenses/", ExpenseListCreateView.as_view(), name="expense-list-create"),
    path("expenses/<int:pk>/", ExpenseDetailView.as_view(), name="expense-detail"),
    path("expenses/total/", TotalExpenseView.as_view(), name="expense-total"),
]