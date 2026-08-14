from rest_framework import generics, permissions
from .models import Income
from .serializers import IncomeSerializer
from notifications.utils import create_notification

class IncomeListCreateView(generics.ListCreateAPIView):
    serializer_class = IncomeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Income.objects.filter(user=self.request.user).order_by('-date')

    def perform_create(self, serializer):
        income = serializer.save(user=self.request.user)

        create_notification(
            user=self.request.user,
            title="Income Added",
            message=f"You added income of ₹{income.amount} from {income.source}.",
            notification_type="info",
            priority="low",
        )
class IncomeDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = IncomeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Income.objects.filter(user=self.request.user)