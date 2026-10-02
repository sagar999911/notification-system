# Notification System

A full-stack notification management system built with Django REST Framework and React.

The system allows an administrator to manage notification templates for different website triggers and send notifications through multiple channels:

- WhatsApp
- Email
- Web Push

The project includes a Django REST API backend and a React frontend with an admin notification management panel.

---

## Live Project

### Frontend

https://notification-system-ten-murex.vercel.app/

### Backend

https://notification-system-backend-jds2.onrender.com/

### GitHub

https://github.com/sagar999911/notification-system

---

## Features

### Authentication

- Admin login
- JWT-based authentication
- JWT refresh tokens
- Logout with refresh-token blacklisting

### Notification Triggers

The project currently supports:

1. Login
2. Logout

When a trigger occurs, the notification system checks the active templates configured for that trigger and sends notifications through the enabled channels.

### Notification Channels

The system supports three notification channels:

#### 1. Email

Transactional email notifications are integrated using Brevo API.

#### 2. Web Push

Browser-based Web Push notifications are implemented using:

- VAPID
- `pywebpush`
- Browser Push API
- Service Worker

Web Push is browser-based only.

#### 3. WhatsApp

WhatsApp notification support is included in the notification architecture.

The WhatsApp Cloud API sandbox setup was not completed because the Meta sandbox/business setup required additional configuration. The application therefore does not claim successful WhatsApp delivery.

---

## Admin Notification Panel

The admin dashboard provides a single notification management table.

Each row represents a trigger and each channel has its own template.

| Trigger | WhatsApp | Email | Web Push |
|---|---|---|---|
| Login | Template | Template | Template |
| Logout | Template | Template | Template |

From the admin panel, an administrator can:

- Create a template
- Edit a template
- Enable/disable a template
- Test a template
- Manage templates for each channel

---

## Template Variables

The notification system supports basic dynamic variables.

Currently supported variables include:

```text
{{user_name}}
{{user_email}}