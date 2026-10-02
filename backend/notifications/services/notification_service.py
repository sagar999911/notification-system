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

    Notification failures are isolated so that a
    failed notification does not break the main
    application action such as login/logout.
    """

    try:
        trigger = NotificationTrigger.objects.get(
            code=trigger_code,
            is_active=True,
        )
    except NotificationTrigger.DoesNotExist:
        print(
            f"[NOTIFICATION] Trigger '{trigger_code}' "
            "does not exist or is inactive."
        )
        return

    templates = NotificationTemplate.objects.filter(
        trigger=trigger,
        is_enabled=True,
    )

    for template in templates:
        try:
            message = render_template(template, user)

            if template.channel == NotificationTemplate.Channel.EMAIL:

                if not user.email:
                    print(
                        f"[EMAIL] User {user.username} "
                        "does not have an email address."
                    )
                    continue

                send_email(
                    recipient=user.email,
                    subject=(
                        message["subject"]
                        or "Notification System"
                    ),
                    body=message["body"],
                )

                print(
                    f"[EMAIL] Notification sent to {user.email}"
                )

            elif (
                template.channel
                == NotificationTemplate.Channel.WHATSAPP
            ):
                print(
                    "[WHATSAPP] Provider integration pending."
                )

            elif (
                template.channel
                == NotificationTemplate.Channel.WEB_PUSH
            ):
                subscriptions = PushSubscription.objects.filter(
                    user=user
                )

                for subscription in subscriptions:
                    send_web_push(
                        subscription,
                        message["subject"] or "Notification",
                        message["body"],
                    )

        except Exception as exc:
            print(
                f"[NOTIFICATION ERROR] "
                f"Trigger={trigger_code}, "
                f"Channel={template.channel}, "
                f"Error={exc}"
            )
