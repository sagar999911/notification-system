from rest_framework import serializers

from .models import NotificationTemplate, NotificationTrigger


class NotificationTemplateSerializer(serializers.ModelSerializer):
    trigger_name = serializers.CharField(
        source="trigger.name",
        read_only=True
    )
    channel_display = serializers.CharField(
        source="get_channel_display",
        read_only=True
    )

    class Meta:
        model = NotificationTemplate
        fields = [
            "id",
            "trigger",
            "trigger_name",
            "channel",
            "channel_display",
            "name",
            "subject",
            "body",
            "is_enabled",
            "variables",
            "created_at",
            "updated_at",
        ]


class NotificationTriggerSerializer(serializers.ModelSerializer):
    templates = NotificationTemplateSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = NotificationTrigger
        fields = [
            "id",
            "name",
            "code",
            "description",
            "is_active",
            "templates",
            "created_at",
            "updated_at",
        ]