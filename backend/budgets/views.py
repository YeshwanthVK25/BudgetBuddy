from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum
from .models import Budgets
from .serializers import BudgetSerializer
from expenses.models import Expense
from notifications.utils import create_notification
from .utils import calculate_budget_utilization, get_alert_level_and_message


class BudgetListCreateView(generics.ListCreateAPIView):
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Budgets.objects.filter(user=self.request.user).order_by('-year', '-month')

    def perform_create(self, serializer):
        budget = serializer.save(user=self.request.user)
        create_notification(
            user=self.request.user,
            title="Budget Created",
            message=f"Your budget for '{budget.category}' ({budget.month}/{budget.year}) has been created.",
            notification_type='success',
        )


class BudgetDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Budgets.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        budget = serializer.save()
        create_notification(
            user=self.request.user,
            title="Budget Updated",
            message=f"Your budget for '{budget.category}' ({budget.month}/{budget.year}) has been updated.",
            notification_type='info',
        )


class BudgetAlertView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        alerts = []
        user_budgets = Budgets.objects.filter(user=request.user)

        for budget in user_budgets:
            total_expense, utilization = calculate_budget_utilization(budget)
            alert_level, message = get_alert_level_and_message(budget, utilization)

            alerts.append({
                "category": budget.category,
                "budget_amount": budget.budget_amount,
                "total_expense": total_expense,
                "utilization_percentage": utilization,
                "alert_level": alert_level,
                "alert_message": message,
            })

        return Response({"alerts": alerts})


class BudgetSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        summaries = []
        user_budgets = Budgets.objects.filter(user=request.user)

        for budget in user_budgets:
            total_expense = Expense.objects.filter(
                user=request.user,
                category=budget.category
            ).aggregate(total=Sum('amount'))['total'] or 0

            remaining = budget.budget_amount - total_expense
            overspent = total_expense - budget.budget_amount if total_expense > budget.budget_amount else 0

            summaries.append({
                "category": budget.category,
                "month": budget.month,
                "year": budget.year,
                "budget_amount": budget.budget_amount,
                "total_expense": total_expense,
                "remaining_budget": remaining if remaining > 0 else 0,
                "overspent_amount": overspent,
            })

        return Response({"summaries": summaries})