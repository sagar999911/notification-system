self.addEventListener("push", (event) => {
    let data = {
        title: "Notification",
        body: "You have a new notification.",
    };

    if (event.data) {
        try {
            data = event.data.json();
        } catch (error) {
            console.error("Push data is not valid JSON:", error);
        }
    }

    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: "/vite.svg",
        })
    );
});