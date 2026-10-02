from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import NotificationTemplate, NotificationTrigger
from .serializers import (
    NotificationTemplateSerializer,
    NotificationTriggerSerializer,
)
from .services.notification_service import render_template
from .services.email_service import send_email
from .services.web_push_service import send_web_push


class AdminNotificationListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        triggers = NotificationTrigger.objects.prefetch_related(
            "templates"
        ).all()

        serializer = NotificationTriggerSerializer(
            triggers,
            many=True
        )

        return Response(serializer.data)


class AdminNotificationTemplateCreateView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        serializer = NotificationTemplateSerializer(
            data=request.data
        )

        if serializer.is_valid():
            template = serializer.save()

            return Response(
                NotificationTemplateSerializer(template).data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class AdminNotificationTemplateDetailView(APIView):
    permission_classes = [IsAdminUser]

    def put(self, request, pk):
        template = get_object_or_404(
            NotificationTemplate,
            pk=pk
        )

        serializer = NotificationTemplateSerializer(
            template,
            data=request.data
        )

        if serializer.is_valid():
            template = serializer.save()

            return Response(
                NotificationTemplateSerializer(template).data
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class AdminNotificationTemplateToggleView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        template = get_object_or_404(
            NotificationTemplate,
            pk=pk
        )

        template.is_enabled = not template.is_enabled
        template.save(update_fields=["is_enabled", "updated_at"])

        return Response({
            "message": "Template status updated.",
            "is_enabled": template.is_enabled,
        })


class AdminNotificationTemplateTestView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        template = get_object_or_404(
            NotificationTemplate,
            pk=pk
        )

        # Render variables using the logged-in admin user
        message = render_template(
            template,
            request.user
        )

        # -----------------------------------------
        # EMAIL
        # -----------------------------------------

        if template.channel == NotificationTemplate.Channel.EMAIL:

            if not request.user.email:
                return Response(
                    {
                        "error": (
                            "Admin user does not have "
                            "an email address."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            send_email(
                recipient=request.user.email,
                subject=(
                    message["subject"]
                    or "Notification System Test"
                ),
                body=message["body"],
            )

            return Response({
                "message": (
                    "Test Email sent successfully to "
                    f"{request.user.email}."
                ),
                "channel": "email",
            })


        # -----------------------------------------
        # WEB PUSH
        # -----------------------------------------

        elif (
            template.channel
            == NotificationTemplate.Channel.WEB_PUSH
        ):

            from .models import PushSubscription

            subscriptions = PushSubscription.objects.filter(
                user=request.user
            )

            if not subscriptions.exists():
                return Response(
                    {
                        "error": (
                            "No Web Push subscription found. "
                            "Click 'Enable Web Notifications' first."
                        )
                    },
                    status=status.HTTP_404_NOT_FOUND
                )

            sent = 0

            for subscription in subscriptions:

                success = send_web_push(
                    subscription,
                    message["subject"]
                    or "Notification System",
                    message["body"],
                )

                if success:
                    sent += 1

            if sent == 0:
                return Response(
                    {
                        "error":
                            "Web Push could not be delivered."
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            return Response({
                "message":
                    "Test Web Push sent successfully.",
                "channel":
                    "web_push",
                "sent":
                    sent,
            })


        # -----------------------------------------
        # WHATSAPP
        # -----------------------------------------

        elif (
            template.channel
            == NotificationTemplate.Channel.WHATSAPP
        ):

            print(
                "[WHATSAPP TEST]",
                message["body"]
            )

            return Response({
                "message": (
                    "WhatsApp test processed. "
                    "Meta WhatsApp Cloud API is not "
                    "configured because sandbox onboarding "
                    "was unavailable."
                ),
                "channel": "whatsapp",
                "status": "provider_not_configured",
            })


        return Response(
            {
                "error": "Unsupported notification channel."
            },
            status=status.HTTP_400_BAD_REQUEST
        )