from notifications.models import (
    NotificationTemplate,
    NotificationTrigger,
    PushSubscription
)

from .email_service import send_email
from .whatsapp_service import send_whatsapp
from .web_push_service import send_web_push



def render_template(template, user):
    """
    Replace supported variables with user information.
    """

    body = template.body

    variables = {
        "{{user_name}}": user.get_username(),
        "{{user_email}}": user.email or "",
    }

    for variable, value in variables.items():
        body = body.replace(variable, value)

    subject = template.subject

    if subject:
        for variable, value in variables.items():
            subject = subject.replace(variable, value)

    return {
        "subject": subject,
        "body": body,
    }


def fire_trigger(trigger_code, user):
    """
    Find the trigger and send notifications
    through all enabled channels.
    """

    try:
        trigger = NotificationTrigger.objects.get(
            code=trigger_code,
            is_active=True,
        )
    except NotificationTrigger.DoesNotExist:
        print(
            f"Trigger '{trigger_code}' does not exist "
            "or is inactive."
        )
        return

    templates = NotificationTemplate.objects.filter(
        trigger=trigger,
        is_enabled=True,
    )

    for template in templates:

        message = render_template(
            template,
            user,
        )

        if template.channel == NotificationTemplate.Channel.EMAIL:

            send_email(
                recipient=user.email,
                subject=message["subject"],
                body=message["body"],
            )

        elif template.channel == NotificationTemplate.Channel.WHATSAPP:

            # We'll add user's phone number later.
            print(
                "[WHATSAPP] Provider integration pending."
            )

        elif template.channel == NotificationTemplate.Channel.WEB_PUSH:
            subscriptions = PushSubscription.objects.filter(user=user)

            for subscription in subscriptions:
                send_web_push(
                    subscription,
                    message["subject"] or "Notification",
                    message["body"],
                )