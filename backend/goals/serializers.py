from datetime import date
from rest_framework import serializers
from .models import SavingsGoal

class SavingsGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavingsGoal
        fields = ['id', 'title', 'target_amount', 'saved_amount', 'deadline', 'user']
        read_only_fields = ['user']

    def validate_target_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Target amount must be greater than zero.")
        return value

    def validate_saved_amount(self, value):
        if value < 0:
            raise serializers.ValidationError("Saved amount cannot be negative.")
        return value

    def validate_deadline(self, value):
        if self.instance is None and value and value < date.today():
            raise serializers.ValidationError("Deadline cannot be in the past.")
        return value