from django.db import models
from django.contrib.auth.models import User

class Budgets(models.Model):
    CATEGORY_CHOICES = [
        ('FOOD', 'Food'),
        ('TRAVEL', 'Travel'),
        ('SHOPPING', 'Shopping'),
        ('EDUCATION', 'Education'),
        ('ENTERTAINMENT', 'Entertainment'),
        ('HEALTHCARE', 'Healthcare'),
        ('BILLS', 'Bills'),
        ('MISCELLANEOUS', 'Miscellaneous'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="budgets")
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    budget_amount = models.DecimalField(max_digits=10, decimal_places=2)
    month = models.IntegerField()  # 1-12
    year = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'category', 'month', 'year')  # Task 5: duplicate prevention

    def __str__(self):
        return f"{self.category} - {self.month}/{self.year}"