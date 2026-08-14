from django.urls import path
from .views import (
    FinancialSummaryView, CategoryWiseExpenseView,
    MonthlyExpenseTrendView, ExpenseExtremesView, DashboardView, ReportView
)

urlpatterns = [
    path('analytics/summary/', FinancialSummaryView.as_view(), name='financial-summary'),
    path('analytics/category-wise/', CategoryWiseExpenseView.as_view(), name='category-wise-expense'),
    path('analytics/monthly-trend/', MonthlyExpenseTrendView.as_view(), name='monthly-expense-trend'),
    path('analytics/extremes/', ExpenseExtremesView.as_view(), name='expense-extremes'),
    path('analytics/dashboard/', DashboardView.as_view(), name='dashboard'),
    path('analytics/report/', ReportView.as_view(), name='report'),
]