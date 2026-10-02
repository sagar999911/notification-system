import os

import requests


BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"


def send_email(
    recipient,
    subject,
    body,
):
    api_key = os.getenv("BREVO_API_KEY")
    from_email = os.getenv("BREVO_FROM_EMAIL")
    from_name = os.getenv(
        "BREVO_FROM_NAME",
        "Notification System",
    )

    if not api_key:
        raise ValueError(
            "BREVO_API_KEY is not configured."
        )

    if not from_email:
        raise ValueError(
            "BREVO_FROM_EMAIL is not configured."
        )

    payload = {
        "sender": {
            "name": from_name,
            "email": from_email,
        },
        "to": [
            {
                "email": recipient,
            }
        ],
        "subject": subject,
        "textContent": body,
    }

    headers = {
        "accept": "application/json",
        "api-key": api_key,
        "content-type": "application/json",
    }

    response = requests.post(
        BREVO_API_URL,
        json=payload,
        headers=headers,
        timeout=15,
    )

    if not response.ok:
        raise RuntimeError(
            f"Email sending failed: "
            f"{response.status_code} "
            f"{response.text}"
        )

    return response.json()