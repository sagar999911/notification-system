from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import PushSubscription
from django.conf import settings
from .services.web_push_service import send_web_push


class PushSubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        endpoint = request.data.get("endpoint")
        keys = request.data.get("keys", {})

        p256dh = keys.get("p256dh")
        auth = keys.get("auth")

        if not endpoint or not p256dh or not auth:
            return Response(
                {"error": "Invalid push subscription data."},
                status=status.HTTP_400_BAD_REQUEST
            )

        subscription, created = PushSubscription.objects.update_or_create(
            endpoint=endpoint,
            defaults={
                "user": request.user,
                "p256dh": p256dh,
                "auth": auth,
            }
        )

        return Response(
            {
                "message": "Push subscription saved successfully.",
                "created": created,
            },
            status=status.HTTP_201_CREATED
        )

class TestPushNotificationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        subscriptions = PushSubscription.objects.filter(
            user=request.user
        )

        if not subscriptions.exists():
            return Response(
                {"error": "No push subscription found."},
                status=status.HTTP_404_NOT_FOUND
            )

        sent = 0

        for subscription in subscriptions:
            success = send_web_push(
                subscription,
                "Notification System",
                "This is a test Web Push notification."
            )

            if success:
                sent += 1

        return Response({
            "message": "Web Push test completed.",
            "sent": sent,
        })