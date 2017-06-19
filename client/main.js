import './main.html';
import '/imports/startup/client';

export const oneSignal=function() {
    if (Meteor.settings.public.onesignal) {
        var OneSignal = window.OneSignal || [];
        var settings = {
            'appId': Meteor.settings.public.onesignal.appId, // Get from OneSignal
            'notifyButton': {
                enable: false
            },
            'welcomeNotification': {
                title: 'All For One',
                message: 'Thanks for subscribing to our notifications!',
                url: 'https://www.allforone.io/profile',
            },
            promptOptions: {
                /* Change bold title, limited to 30 characters */
                siteName: 'All For One',
                /* Subtitle, limited to 90 characters */
                actionMessage: "We'd like to let you know when your pledges change, and what your friends are up to.",
                /* Example notification title */
                exampleNotificationTitle: 'Example notification',
                /* Example notification message */
                exampleNotificationMessage: 'This is an example notification',
                /* Text below example notification, limited to 50 characters */
                exampleNotificationCaption: 'You can unsubscribe anytime',
                /* Accept button text, limited to 15 characters */
                acceptButtonText: "ALLOW",
                /* Cancel button text, limited to 15 characters */
                cancelButtonText: "NO THANKS"
            },
            'safari_web_id': Meteor.settings.public.onesignal.webId, // Get from OneSignal
            'autoRegister': false
        };
        OneSignal.push(['init', settings]);
    }
};

Meteor.startup(function() {
    if (Meteor.isClient) {
        oneSignal();
        Meteor.absoluteUrl.defaultOptions.rootUrl = 'https://www.allforone.io'
    }
});
