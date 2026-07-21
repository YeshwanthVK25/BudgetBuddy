from django.db import models
from django.contrib.auth.models import User

class Income(models.Model):
    SOURCE_CHOICES = [
        ('SALARY', 'Salary'),
        ('POCKET_MONEY', 'Pocket Money'),
        ('SCHOLARSHIP', 'Scholarship'),
        ('FREELANCING', 'Freelancing'),
        ('BUSINESS', 'Business'),
        ('OTHER', 'Other'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="incomes")
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='OTHER')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()

    def __str__(self):
        return self.source