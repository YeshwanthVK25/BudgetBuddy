from django.db import models
from django.contrib.auth.models import User


class SavingsGoal(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="goals"
    )

    title = models.CharField(max_length=200)

    target_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    saved_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    deadline = models.DateField(
        null=True,
        blank=True
    )

    completed_notification_sent = models.BooleanField(
        default=False
    )

    def __str__(self):
        return self.title


class MonthlySavings(models.Model):
    goal = models.ForeignKey(
        SavingsGoal,
        on_delete=models.CASCADE,
        related_name="monthly_savings"
    )

    month = models.DateField()

    planned_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    saved_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    class Meta:
        unique_together = ("goal", "month")
        ordering = ["-month"]

    def __str__(self):
        return f"{self.goal.title} - {self.month}"