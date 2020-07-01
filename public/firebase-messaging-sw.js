// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/5.8.5/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/5.8.5/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
    'messagingSenderId': '32497362291'
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();


let onClickUrl;

messaging.setBackgroundMessageHandler(function(payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // Customize notification here
    var notificationTitle = payload.data.status == 'accepted' ? "Ordine Accetado" : "Ordine Rifiutato"
    var notificationOptions = {
        body: payload.data.status == 'accepted' ? "Clicca qui per generare lo scontrino." : "Clicca qui per sapere di più.",
        icon: './img/icons/android-chrome-192x192.png'
    };

    onClickUrl = `https://flavy.app${payload.data.link}`

    return self.registration.showNotification(notificationTitle,
        notificationOptions);
});

self.addEventListener('notificationclick', function(event) {

    event.notification.close();

    // This looks to see if the current is already open and
    // focuses if it is
    event.waitUntil(

        clients.matchAll({

            type: "window"

        })

        .then(function(clientList) {

            for (var i = 0; i < clientList.length; i++) {

                var client = clientList[i];

                if (client.url == '/' && 'focus' in client)

                    return client.focus();

            }

            if (clients.openWindow) {

                return clients.openWindow(onClickUrl);

            }

        })
    );


    // Do something as the result of the notification click
});