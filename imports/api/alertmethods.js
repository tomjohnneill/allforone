import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Pledges } from '/imports/api/pledges.js';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import { Threads } from '/imports/api/threads.js';




Meteor.methods({
sendTextMessage: function(recipientId, messageText, url, picture) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}
})

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.9/me/messages',
    qs: { access_token: 'EAAbWYZCz3y50BADfOyHdLTYdgqpZCVYZAslhisDAoegVSR2ufVFreyZA4wkbZA2XseiVZC9OVlFJIiHaYe2AZADJggKsexQpLr1nEjFY8jG91mbHpPA1zbFdUeTtXKD2HxXZCUz1qeGZB1Q8dflj0yZCYfBDYsns76WZC94fUUIZBkktZBwZDZD' },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      if (messageId) {
        console.log("Successfully sent message with id %s to recipient %s",
          messageId, recipientId);
      } else {
      console.log("Successfully called Send API for recipient %s",
        recipientId);
      }
    } else {
      console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error);
    }
  });
}


Meteor.methods({
  sendOneSignalNotification: function(recipientId, messageText, url, picture, title) {
    this.unblock()
      var options = {
          headers: {
              Authorization: 'Basic ' + Meteor.settings.public.onesignal.api_key,
              'Content-Type': 'application/json; charset=utf-8'
          },
          data: {
              'app_id': Meteor.settings.public.onesignal.appId,
              'contents': {en: messageText}, // My message
              'headings': {en: title}, // notification title
              'android_group': 'message',
              'include_player_ids': [recipientId], // Array of oneSignal user Ids (from my Meteor.users table)
              'url': url // where to go if user clicks on notification
          }
      };
      console.log(options)

      HTTP.call('POST', 'https://onesignal.com/api/v1/notifications', options, function(error, result) {
    // Process t1he return for any ids that were not recognised to remove them from our database
          if (result && result.data && result.data.errors && result.data.errors.invalid_player_ids) {
            console.log(result)
              result.data.errors.invalid_player_ids.forEach(playerId => {
                  Meteor.users.update({oneSignalUserId: playerId}, {$pull: {oneSignalUserId: playerId}});
              });
          }
      });

    }
    })
