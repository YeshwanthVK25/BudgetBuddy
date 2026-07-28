from django.urls import path
from .views import SavingsGoalListCreateView, SavingsGoalDetailView

urlpatterns = [
    path('goals/', SavingsGoalListCreateView.as_view(), name='goal-list-create'),
    path('goals/<int:pk>/', SavingsGoalDetailView.as_view(), name='goal-detail'),
]