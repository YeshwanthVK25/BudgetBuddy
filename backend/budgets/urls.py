from django.urls import path
from .views import BudgetListCreateView, BudgetDetailView, BudgetAlertView, BudgetSummaryView

urlpatterns = [
    path("budgets/", BudgetListCreateView.as_view(), name="budget-list-create"),
    path("budgets/<int:pk>/", BudgetDetailView.as_view(), name="budget-detail"),
    path("budgets/alerts/", BudgetAlertView.as_view(), name="budget-alerts"),
    path("budgets/summary/", BudgetSummaryView.as_view(), name="budget-summary"),
    
]