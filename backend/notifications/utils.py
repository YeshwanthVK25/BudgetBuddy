from .models import Notification

def create_notification(user, title, message, notification_type='info', priority='medium'):
    return Notification.objects.create(
        user=user,
        title=title,
        message=message,
        notification_type=notification_type,
        priority=priority,
    )