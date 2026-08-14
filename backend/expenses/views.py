from rest_framework import generics, permissions
from .models import Expense
from .serializers import ExpenseSerializer
from budgets.models import Budgets
from budgets.utils import check_and_send_budget_alert
from notifications.utils import create_notification


def trigger_budget_check(expense):
    """Find the matching budget for this expense's category/month/year and check alerts."""
    try:
        budget = Budgets.objects.get(
            user=expense.user,
            category=expense.category,
            month=expense.date.month,
            year=expense.date.year,
        )
        check_and_send_budget_alert(budget)
    except Budgets.DoesNotExist:
        pass  # no budget set for this category/month, nothing to check


class ExpenseListCreateView(generics.ListCreateAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Expense.objects.filter(user=self.request.user)

        # Task 3: filter by category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category.upper())

        # Task 4: sorting
        sort = self.request.query_params.get('sort')
        if sort == 'latest':
            queryset = queryset.order_by('-date')
        elif sort == 'oldest':
            queryset = queryset.order_by('date')
        elif sort == 'highest':
            queryset = queryset.order_by('-amount')
        elif sort == 'lowest':
            queryset = queryset.order_by('amount')
        else:
            queryset = queryset.order_by('-date')  # default

        return queryset
    
    def perform_create(self, serializer):
        expense = serializer.save(user=self.request.user)
        create_notification(
                user=self.request.user,
                title="Expense Added",
                message=f"You added an expense of ₹{expense.amount} under {expense.category}.",
                notification_type="info",
                priority="low",
            )
        
        trigger_budget_check(expense)


class ExpenseDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        expense = serializer.save()
        trigger_budget_check(expense)


from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum


class TotalExpenseView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        queryset = Expense.objects.filter(user=request.user)

        category = request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category.upper())

        total = queryset.aggregate(total=Sum('amount'))['total'] or 0
        return Response({"total_expenses": total})