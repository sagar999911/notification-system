from django.urls import path

from .push_views import (
    PushSubscriptionView,
    TestPushNotificationView,
)

from .views import (
    AdminNotificationListView,
    AdminNotificationTemplateCreateView,
    AdminNotificationTemplateDetailView,
    AdminNotificationTemplateToggleView,
    AdminNotificationTemplateTestView,
)


urlpatterns = [

    # Web Push
    path(
        "push/subscribe/",
        PushSubscriptionView.as_view(),
        name="push-subscribe"
    ),

    path(
        "push/test/",
        TestPushNotificationView.as_view(),
        name="push-test"
    ),

    # Admin notification management
    path(
        "admin/",
        AdminNotificationListView.as_view(),
        name="admin-notifications"
    ),

    path(
        "admin/templates/",
        AdminNotificationTemplateCreateView.as_view(),
        name="admin-template-create"
    ),

    path(
        "admin/templates/<int:pk>/",
        AdminNotificationTemplateDetailView.as_view(),
        name="admin-template-detail"
    ),

    path(
        "admin/templates/<int:pk>/toggle/",
        AdminNotificationTemplateToggleView.as_view(),
        name="admin-template-toggle"
    ),

    path(
        "admin/templates/<int:pk>/test/",
        AdminNotificationTemplateTestView.as_view(),
        name="admin-template-test"
    ),
]