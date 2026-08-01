from django.db.models import Sum
from expenses.models import Expense
from notifications.utils import create_notification


def calculate_budget_utilization(budget):
    total_expense = Expense.objects.filter(
        user=budget.user,
        category=budget.category
    ).aggregate(total=Sum('amount'))['total'] or 0

    if budget.budget_amount == 0:
        return total_expense, 0

    utilization = (total_expense / budget.budget_amount) * 100
    return total_expense, round(utilization, 2)


def get_alert_level_and_message(budget, utilization):
    if utilization >= 100:
        return "exceeded", f"Budget Exceeded: Your {budget.category} Budget has been exceeded."
    elif utilization >= 90:
        return "high_warning", f"High Alert: You have used {utilization:.0f}% of your monthly {budget.category} Budget."
    elif utilization >= 80:
        return "warning", f"Warning: You have used {utilization:.0f}% of your monthly {budget.category} Budget."
    else:
        return None, None


def check_and_send_budget_alert(budget):
    total_expense, utilization = calculate_budget_utilization(budget)
    alert_level, message = get_alert_level_and_message(budget, utilization)

    if alert_level and alert_level != budget.last_alert_level:
        priority = "high" if alert_level in ["high_warning", "exceeded"] else "medium"
        create_notification(
            user=budget.user,
            title=message.split(":")[0],
            message=message,
            notification_type="warning" if alert_level != "exceeded" else "alert",
            priority=priority,
        )
        budget.last_alert_level = alert_level
        budget.save()
    elif not alert_level and budget.last_alert_level:
        budget.last_alert_level = None
        budget.save()

    return total_expense, utilization, alert_level, message