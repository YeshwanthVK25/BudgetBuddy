from django.urls import path
from .views import (
    SummaryView,
    TransactionDashboardView,
    MonthlySavingsView,
)

urlpatterns = [
    path("summary/", SummaryView.as_view(), name="summary"),
    path("dashboard/", TransactionDashboardView.as_view(), name="transaction-dashboard"),
    path(
    "monthly-savings/",
    MonthlySavingsView.as_view(),
    name="monthly-savings"),
]