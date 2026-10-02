from django.conf import settings
from django.db import models


class NotificationTrigger(models.Model):
    name = models.CharField(max_length=100)
    code = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return self.name


class NotificationTemplate(models.Model):

    class Channel(models.TextChoices):
        WHATSAPP = "whatsapp", "WhatsApp"
        EMAIL = "email", "Email"
        WEB_PUSH = "web_push", "Web Push"

    trigger = models.ForeignKey(
        NotificationTrigger,
        on_delete=models.CASCADE,
        related_name="templates",
    )

    channel = models.CharField(
        max_length=20,
        choices=Channel.choices,
    )

    name = models.CharField(max_length=150)

    subject = models.CharField(
        max_length=255,
        blank=True,
    )

    body = models.TextField()

    is_enabled = models.BooleanField(default=True)

    variables = models.JSONField(
        default=list,
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["trigger", "channel"]
        constraints = [
            models.UniqueConstraint(
                fields=["trigger", "channel"],
                name="unique_trigger_channel_template",
            )
        ]

    def __str__(self):
        return f"{self.trigger.name} - {self.get_channel_display()}"


class PushSubscription(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="push_subscriptions"
    )

    endpoint = models.TextField(unique=True, null=True)

    p256dh = models.TextField(null=True)
    auth = models.TextField(null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user} - Web Push"