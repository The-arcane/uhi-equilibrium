
let timeoutId = null;

self.addEventListener('install', () => {
  self.skipWaiting();
});

const scheduleReminder = (time) => {
    if (timeoutId) {
        clearTimeout(timeoutId);
    }
    
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    let notificationTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);

    if (notificationTime < now) {
        notificationTime.setDate(notificationTime.getDate() + 1);
    }

    const delay = notificationTime.getTime() - now.getTime();

    console.log(`[SW] Scheduling notification for ${notificationTime}`);

    timeoutId = setTimeout(() => {
        self.registration.showNotification('Equilibrium Daily Check-In', {
            body: 'A moment to check in with yourself.',
            requireInteraction: true,
            data: { url: '/check' }
        });
        scheduleReminder(time);
    }, delay);
};

const cancelReminder = () => {
    if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
        console.log('[SW] Reminder cancelled.');
    }
};

self.addEventListener('message', (event) => {
    const { type, time } = event.data;
    switch (type) {
        case 'SCHEDULE_REMINDER':
            scheduleReminder(time);
            break;
        case 'CANCEL_REMINDER':
            cancelReminder();
            break;
    }
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const checkInUrl = self.location.origin + '/check';
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url === checkInUrl && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(checkInUrl);
            }
        })
    );
});
