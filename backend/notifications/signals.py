from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail

from .models import Notification


@receiver(post_save, sender=Notification)
def send_notification_email(sender, instance, created, **kwargs):

    # Only send email when a NEW notification is created
    if not created:
        return

    # Check whether the user has an email
    if not instance.user.email:
        return

    subject = f"BudgetBuddy - {instance.title}"

    message = f"""
Hello {instance.user.username},

You have a new notification from BudgetBuddy.

{instance.title}

{instance.message}

Priority: {instance.get_priority_display()}
Type: {instance.get_notification_type_display()}

Please open BudgetBuddy to view more details.

Thank you,
BudgetBuddy Team
"""

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=None,
            recipient_list=[instance.user.email],
            fail_silently=False,
        )

        print(
            f"Email notification sent to {instance.user.email}"
        )

    except Exception as e:
        print(
            f"Failed to send email to {instance.user.email}: {e}"
        )