from rest_framework import serializers
from .models import Budgets

class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budgets
        fields = ['id', 'category', 'budget_amount', 'month', 'year', 'created_at', 'updated_at']