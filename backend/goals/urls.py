from django.urls import path
from .views import GoalListCreateView, GoalDetailView

urlpatterns = [
    path("goals/", GoalListCreateView.as_view(), name="goal-list-create"),
    path("goals/<int:pk>/", GoalDetailView.as_view(), name="goal-detail"),
]