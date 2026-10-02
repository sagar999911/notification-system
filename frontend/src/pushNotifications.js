const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;
console.log("VAPID public key exists:", !!VAPID_PUBLIC_KEY);

function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);

    const base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const rawData = window.atob(base64);

    return Uint8Array.from(
        [...rawData].map((char) => char.charCodeAt(0))
    );
}

export async function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) {
        throw new Error("Service workers are not supported.");
    }

    console.log("Registering service worker...");

    const registration = await navigator.serviceWorker.register(
        "/service-worker.js"
    );

    console.log("Service worker registered:", registration);

    await navigator.serviceWorker.ready;

    console.log("Service worker is ready.");

    return registration;
}

export async function subscribeToPush() {
    const registration = await navigator.serviceWorker.ready;

    let subscription =
        await registration.pushManager.getSubscription();

    if (!subscription) {
        const permission = await Notification.requestPermission();

        if (permission !== "granted") {
            throw new Error("Notification permission was not granted.");
        }

        subscription =
            await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey:
                    urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
            });
    }

    return subscription;
}