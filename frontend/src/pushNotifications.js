export async function subscribeToPush() {
    const registration = await navigator.serviceWorker.ready;

    let subscription =
        await registration.pushManager.getSubscription();

    if (!subscription) {
        const permission = await Notification.requestPermission();

        if (permission !== "granted") {
            throw new Error(
                "Notification permission was not granted."
            );
        }

        subscription =
            await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey:
                    urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
            });
    }

    console.log("Push subscription created:", subscription);

    return subscription;
}