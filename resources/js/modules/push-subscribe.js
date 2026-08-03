function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; i++) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
}

function csrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.content;
}

async function subscribe(publicKey) {
    const registration = await navigator.serviceWorker.ready;

    const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    await fetch('/webpush/subscribe', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken(),
            Accept: 'application/json',
        },
        body: JSON.stringify(subscription.toJSON()),
    });
}

export function initPushNotifications() {
    const publicKey = document.querySelector('meta[name="vapid-public-key"]')?.content;

    if (!publicKey || !('serviceWorker' in navigator) || !('PushManager' in window)) {
        return;
    }

    navigator.serviceWorker.register('/sw.js').catch(() => {});

    // Permission was already granted in an earlier session - keep the stored
    // subscription in sync (e.g. after clearing browser data) without asking
    // again, and hide the "enable notifications" prompt either way.
    if (Notification.permission === 'granted') {
        subscribe(publicKey).catch(() => {});
    }

    if (Notification.permission !== 'default') {
        document.querySelectorAll('[data-push-prompt]').forEach((el) => el.remove());
    }

    document.addEventListener('click', async (event) => {
        const trigger = event.target.closest('[data-enable-push]');
        if (!trigger) {
            return;
        }

        trigger.disabled = true;

        try {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                trigger.disabled = false;
                return;
            }

            await subscribe(publicKey);
            trigger.closest('[data-push-prompt]')?.remove();
        } catch (e) {
            trigger.disabled = false;
        }
    });
}
