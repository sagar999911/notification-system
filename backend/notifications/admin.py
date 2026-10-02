from django.contrib import admin

from .models import (
    NotificationTemplate,
    NotificationTrigger,
    PushSubscription,
)


@admin.register(NotificationTrigger)
class NotificationTriggerAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "code",
        "is_active",
        "created_at",
    )

    list_filter = ("is_active",)
    search_fields = ("name", "code")


@admin.register(NotificationTemplate)
class NotificationTemplateAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "trigger",
        "channel",
        "is_enabled",
        "updated_at",
    )

    list_filter = (
        "channel",
        "is_enabled",
    )

    search_fields = (
        "name",
        "trigger__name",
    )


@admin.register(PushSubscription)
class PushSubscriptionAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "endpoint",
        "created_at",
    )

    search_fields = (
        "user__username",
        "endpoint",
    )