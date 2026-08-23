from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Sum

from expenses.models import Expense
from income.models import Income
from budgets.models import Budgets


class SummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        total_income = Income.objects.filter(
            user=request.user
        ).aggregate(total=Sum("amount"))["total"] or 0

        total_expense = Expense.objects.filter(
            user=request.user
        ).aggregate(total=Sum("amount"))["total"] or 0

        balance = total_income - total_expense

        return Response({
            "total_income": total_income,
            "total_expense": total_expense,
            "balance": balance,
        })


class TransactionDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        total_income = Income.objects.filter(
            user=request.user
        ).aggregate(total=Sum("amount"))["total"] or 0

        total_expense = Expense.objects.filter(
            user=request.user
        ).aggregate(total=Sum("amount"))["total"] or 0

        current_balance = total_income - total_expense

        total_budget = Budgets.objects.filter(
            user=request.user
        ).aggregate(total=Sum("budget_amount"))["total"] or 0

        remaining_budget = total_budget - total_expense

        recent_expenses = Expense.objects.filter(
            user=request.user
        ).order_by("-date")[:5]

        recent_transactions = [
            {
                "type": "expense",
                "title": e.title,
                "amount": e.amount,
                "category": e.category,
                "date": e.date,
            }
            for e in recent_expenses
        ]

        return Response({
            "total_income": total_income,
            "total_expense": total_expense,
            "current_balance": current_balance,
            "total_budget": total_budget,
            "remaining_budget": remaining_budget,
            "recent_transactions": recent_transactions,
        })


class MonthlySavingsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        total_income = Income.objects.filter(
            user=request.user
        ).aggregate(total=Sum("amount"))["total"] or 0

        total_expense = Expense.objects.filter(
            user=request.user
        ).aggregate(total=Sum("amount"))["total"] or 0

        monthly_savings = total_income - total_expense

        return Response({
            "monthly_savings": monthly_savings,
            "total_income": total_income,
            "total_expense": total_expense,
        })