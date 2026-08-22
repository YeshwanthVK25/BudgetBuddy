from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import SavingsGoal
from .serializers import SavingsGoalSerializer
from notifications.utils import create_notification


class SavingsGoalListCreateView(generics.ListCreateAPIView):
    serializer_class = SavingsGoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SavingsGoal.objects.filter(
            user=self.request.user
        )

    def perform_create(self, serializer):
        goal = serializer.save(user=self.request.user)

        create_notification(
            user=self.request.user,
            title="Savings Goal Created",
            message=f"Your goal '{goal.title}' has been created.",
            notification_type="success",
            priority="medium",
        )


class SavingsGoalDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SavingsGoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SavingsGoal.objects.filter(
            user=self.request.user
        )

    def perform_update(self, serializer):
        goal = serializer.save()

        if (
            goal.saved_amount >= goal.target_amount
            and not goal.completed_notification_sent
        ):
            create_notification(
                user=self.request.user,
                title="Savings Goal Completed",
                message=f"Congratulations! You've reached your goal '{goal.title}'.",
                notification_type="success",
                priority="high",
            )

            goal.completed_notification_sent = True
            goal.save(update_fields=["completed_notification_sent"])


class GoalProgressView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            goal = SavingsGoal.objects.get(
                pk=pk,
                user=request.user
            )
        except SavingsGoal.DoesNotExist:
            return Response(
                {"error": "Goal not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        remaining = goal.target_amount - goal.saved_amount

        progress = (
            (goal.saved_amount / goal.target_amount) * 100
            if goal.target_amount
            else 0
        )

        data = {
            "title": goal.title,
            "target_amount": goal.target_amount,
            "saved_amount": goal.saved_amount,
            "remaining_amount": remaining,
            "progress_percentage": round(progress, 2),
            "deadline": goal.deadline,
        }

        return Response(data)