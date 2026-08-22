from django.db.models import Sum
from expenses.models import Expense
from notifications.utils import create_notification


def calculate_budget_utilization(budget):
    total_expense = Expense.objects.filter(
        user=budget.user,
        category=budget.category,
        date__month=budget.month,
        date__year=budget.year
    ).aggregate(total=Sum('amount'))['total'] or 0

    if budget.budget_amount == 0:
        return total_expense, 0

    utilization = (total_expense / budget.budget_amount) * 100

    return total_expense, round(utilization, 2)


def get_alert_level_and_message(budget, utilization):

    if utilization > 100:
        return (
            "exceeded",
            f"Your {budget.category} budget has been exceeded. "
            f"You have used {utilization:.0f}% of your budget."
        )

    elif utilization >= 100:
        return (
            "reached",
            f"Our {budget.category} budget has been reached. "
            f"You have used 100% of your budget."
        )

    elif utilization >= 90:
        return (
            "high_warning",
            f"High Alert: You have used {utilization:.0f}% "
            f"of your monthly {budget.category} budget."
        )

    elif utilization >= 80:
        return (
            "warning",
            f"Warning: You have used {utilization:.0f}% "
            f"of your monthly {budget.category} budget."
        )

    return None, None

def check_and_send_budget_alert(budget):
    total_expense, utilization = calculate_budget_utilization(budget)

    alert_level, message = get_alert_level_and_message(
        budget,
        utilization
    )

    if alert_level and alert_level != budget.last_alert_level:

        if alert_level == "exceeded":
            priority = "high"
            notification_type = "alert"
            title = "Budget Exceeded"

        elif alert_level == "reached":
            priority = "high"
            notification_type = "alert"
            title = "Budget Reached"

        elif alert_level == "high_warning":
            priority = "high"
            notification_type = "warning"
            title = "High Budget Alert"

        else:
            priority = "medium"
            notification_type = "warning"
            title = "Budget Warning"

        create_notification(
            user=budget.user,
            title=title,
            message=message,
            notification_type=notification_type,
            priority=priority,
        )

        budget.last_alert_level = alert_level
        budget.save(update_fields=["last_alert_level"])

    elif not alert_level and budget.last_alert_level:

        budget.last_alert_level = None
        budget.save(update_fields=["last_alert_level"])

    return total_expense, utilization, alert_level, message