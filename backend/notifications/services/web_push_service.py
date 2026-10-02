import json
from django.conf import settings
from pywebpush import webpush, WebPushException


def send_web_push(subscription, title, body):
    subscription_info = {
        "endpoint": subscription.endpoint,
        "keys": {
            "p256dh": subscription.p256dh,
            "auth": subscription.auth,
        },
    }

    payload = json.dumps({
        "title": title,
        "body": body,
    })

    try:
        webpush(
            subscription_info=subscription_info,
            data=payload,
            vapid_private_key=str(
                settings.BASE_DIR / "private_key.pem"
            ),
            vapid_claims={
                "sub": settings.VAPID_EMAIL,
            },
            headers={
                "X-WNS-Type": "wns/toast",
                "TTL": "600",
                "Content-Type": "text/xml",
            },
        )

        return True

    except WebPushException as exc:
        print("Web Push failed:", exc)
        return False