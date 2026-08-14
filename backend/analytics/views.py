from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Sum
from income.models import Income
from expenses.models import Expense
from goals.models import SavingsGoal
from budgets.models import Budgets
from django.db.models.functions import TruncMonth
from notifications.models import Notification
from notifications.serializers import NotificationSerializer
from goals.serializers import SavingsGoalSerializer
from expenses.serializers import ExpenseSerializer


class FinancialSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        total_income = Income.objects.filter(user=user).aggregate(total=Sum('amount'))['total'] or 0
        total_expense = Expense.objects.filter(user=user).aggregate(total=Sum('amount'))['total'] or 0
        current_balance = total_income - total_expense

        total_savings = SavingsGoal.objects.filter(user=user).aggregate(total=Sum('saved_amount'))['total'] or 0

        total_budget = Budgets.objects.filter(user=user).aggregate(total=Sum('budget_amount'))['total'] or 0
        remaining_budget = total_budget - total_expense

        return Response({
            "total_income": total_income,
            "total_expense": total_expense,
            "current_balance": current_balance,
            "total_savings": total_savings,
            "remaining_budget": remaining_budget,
        })
    
class CategoryWiseExpenseView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        category_data = (
            Expense.objects.filter(user=user)
            .values('category')
            .annotate(total=Sum('amount'))
            .order_by('-total')
        )

        result = {item['category']: item['total'] for item in category_data}

        return Response(result)

class MonthlyExpenseTrendView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        monthly_data = (
            Expense.objects.filter(user=user)
            .annotate(month=TruncMonth('date'))
            .values('month')
            .annotate(total=Sum('amount'))
            .order_by('month')
        )

        result = {
            item['month'].strftime('%B'): item['total']
            for item in monthly_data
        }

        return Response(result)

class ExpenseExtremesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        expenses = Expense.objects.filter(user=user)

        if not expenses.exists():
            return Response({"message": "No expenses found."})

        highest = expenses.order_by('-amount').first()
        lowest = expenses.order_by('amount').first()
        latest = expenses.order_by('-date').first()
        oldest = expenses.order_by('date').first()

        def serialize(expense):
            return {
                "id": expense.id,
                "category": expense.category,
                "amount": expense.amount,
                "date": expense.date,
            }

        return Response({
            "highest_expense": serialize(highest),
            "lowest_expense": serialize(lowest),
            "latest_expense": serialize(latest),
            "oldest_expense": serialize(oldest),
        })

class DashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        # Financial Summary
        total_income = Income.objects.filter(user=user).aggregate(total=Sum('amount'))['total'] or 0
        total_expense = Expense.objects.filter(user=user).aggregate(total=Sum('amount'))['total'] or 0
        current_balance = total_income - total_expense
        total_savings = SavingsGoal.objects.filter(user=user).aggregate(total=Sum('saved_amount'))['total'] or 0
        total_budget = Budgets.objects.filter(user=user).aggregate(total=Sum('budget_amount'))['total'] or 0
        remaining_budget = total_budget - total_expense

        financial_summary = {
            "total_income": total_income,
            "total_expense": total_expense,
            "current_balance": current_balance,
            "total_savings": total_savings,
            "remaining_budget": remaining_budget,
        }

        # Category-wise
        category_data = (
            Expense.objects.filter(user=user)
            .values('category')
            .annotate(total=Sum('amount'))
            .order_by('-total')
        )
        category_wise = {item['category']: item['total'] for item in category_data}

        # Monthly Trend
        monthly_data = (
            Expense.objects.filter(user=user)
            .annotate(month=TruncMonth('date'))
            .values('month')
            .annotate(total=Sum('amount'))
            .order_by('month')
        )
        monthly_trend = {item['month'].strftime('%B'): item['total'] for item in monthly_data}

        # Recent Transactions (latest 5 expenses)
        recent_transactions = ExpenseSerializer(
            Expense.objects.filter(user=user).order_by('-date')[:5], many=True
        ).data

        # Latest Notifications (latest 5)
        latest_notifications = NotificationSerializer(
            Notification.objects.filter(user=user).order_by('-created_at')[:5], many=True
        ).data

        # Active Savings Goals
        active_savings_goals = SavingsGoalSerializer(
            SavingsGoal.objects.filter(user=user), many=True
        ).data

        return Response({
            "financial_summary": financial_summary,
            "category_wise_analysis": category_wise,
            "monthly_trend": monthly_trend,
            "recent_transactions": recent_transactions,
            "latest_notifications": latest_notifications,
            "active_savings_goals": active_savings_goals,
        })
class ReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        expenses = Expense.objects.filter(user=user)
        income = Income.objects.filter(user=user)

        if start_date:
            expenses = expenses.filter(date__gte=start_date)
            income = income.filter(date__gte=start_date)
        if end_date:
            expenses = expenses.filter(date__lte=end_date)
            income = income.filter(date__lte=end_date)

        total_income = income.aggregate(total=Sum('amount'))['total'] or 0
        total_expense = expenses.aggregate(total=Sum('amount'))['total'] or 0

        return Response({
            "start_date": start_date,
            "end_date": end_date,
            "total_income": total_income,
            "total_expense": total_expense,
            "balance": total_income - total_expense,
            "expenses": ExpenseSerializer(expenses.order_by('-date'), many=True).data,
            "income": [
                {"id": i.id, "source": i.source, "amount": i.amount, "date": i.date}
                for i in income.order_by('-date')
            ],
        })   