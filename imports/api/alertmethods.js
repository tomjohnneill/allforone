import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Pledges } from '/imports/api/pledges.js';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import { Threads } from '/imports/api/threads.js';
import {Suggestions} from '/imports/api/suggestions.js';

var removeMd = require('remove-markdown')

Meteor.methods({
  sendIntroFacebookMessage: function(recipientId) {
    var messageData = {
      recipient: {
        id: recipientId
      },
      message: {
        "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements":[
           {
            "title":"Hi, welcome to All For One",
            "image_url":"https://www.allforone.io/images/splash.jpg",
            "subtitle":"We\'ll send you a message when your pledges finish.",
            "default_action": {
              "type": "web_url",
              "url": "https://www.allforone.io/pages/profile",
              "messenger_extensions": true,
              "webview_height_ratio": "tall",
              "fallback_url": "https://www.allforone.io/pages/profile/"
            },
            "buttons":[
              {
                "type":"web_url",
                "url":"https://www.allforone.io/pages/profile",
                "title":"View Your Profile"
              }
            ]
          }
        ]
      }
    }
      }
    };
    callSendAPI(messageData);
  }
})

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

Meteor.methods({
  sendSuggestionTemplate: function(recipientId, title, subtitle, picture, url, buttonTitle, sendMeWhat) {
    var messageData = {
      recipient: {
        id: recipientId
      },
      message: {
        "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements":[
           {
            "title":title,
            "image_url": picture,
            "subtitle": subtitle,
            "default_action": {
              "type": "web_url",
              "url": url,
              "messenger_extensions": true,
              "webview_height_ratio": "tall",
              "fallback_url": url
            },
            "buttons":[
              {
                "type":"web_url",
                "url":url,
                "title": buttonTitle
              },
              {
                "type":"postback",
                "title":"Another",
                "payload": sendMeWhat
              }
            ]
          }
        ]
      }
    }
      }
    };
    callSendAPI(messageData);
  }
})

Meteor.methods({
  sendPledgeFinishedMessage: function(recipientId, title, subtitle, picture, url) {
    var messageData = {
      recipient: {
        id: recipientId
      },
      message: {
        "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements":[
           {
            "title":title,
            "image_url": picture,
            "subtitle": subtitle,
            "default_action": {
              "type": "web_url",
              "url": url,
              "messenger_extensions": true,
              "webview_height_ratio": "tall",
              "fallback_url": url
            },
            "buttons":[
              {
                "type":"web_url",
                "url": url,
                "title": 'View Pledge'
              },
              {
                "type":"element_share"
              }
            ]
          }
        ]
      }
    }
      }
    };
    callSendAPI(messageData);
  }
})

Meteor.methods({
  sendButtonMessage: function(recipientId, text, title, payload) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      "attachment":{
        "type":"template",
          "payload":{
            "template_type":"button",
              "text": text,
              "buttons":[
              {
                  "type":"postback",
                  "title": title,
                  "payload": payload
              }
            ]
        }
      }
    }
  };

  callSendAPI(messageData)
  }
})

Meteor.methods({
  sendFirstQuestion: function(recipientId) {
    var messageData = {
      recipient: {
        id: recipientId
      },
      message: {
        "attachment":{
          "type":"template",
            "payload":{
              "template_type":"button",
                "text": "Do you want to find something you can do to help? Or do you have a suggestion for other people?",
                "buttons":[
                {
                    "type":"postback",
                    "title": "Find something",
                    "payload": "FIND_SOMETHING"
                },
                {
                    "type":"postback",
                    "title": "Suggest someting",
                    "payload": "SUGGEST_SOMETHING"
                }
              ]
          }
        }
      }
    };
    callSendAPI(messageData)
  }
})

Meteor.methods({
  sendChoicesButton: function(recipientId) {
    var messageData = {
      recipient: {
        id: recipientId
      },
      message: {
        "attachment":{
          "type":"template",
            "payload":{
              "template_type":"button",
                "text": "How do you want to make a difference?",
                "buttons":[
                {
                    "type":"postback",
                    "title": "Go to an Event",
                    "payload": "I_WANT_EVENTS"
                },
                {
                    "type":"postback",
                    "title": "Donate to a project",
                    "payload": "I_WANT_PROJECTS"
                },
                {
                    "type":"postback",
                    "title": "Join a pledge",
                    "payload": "I_WANT_PLEDGES"
                }
              ]
          }
        }
      }
    };

    callSendAPI(messageData)
  }
})

Meteor.methods({
sendStructuredMessage: function(recipientId, json, url, picture) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      json
    }
  };

  callSendAPI(messageData);
}
})

Meteor.methods({
  findAPledge: function(senderId) {
    var user = Meteor.users.findOne({userMessengerId: senderId})
    if (user) {
      var pledge = Pledges.findOne({pledgedUsers: {$ne: user._id}, seenBy: {$ne: senderId}, title: {$ne : 'Untitled Pledge'}})
      if (pledge) {
        Meteor.call("sendSuggestionTemplate", senderId,
        pledge.title, pledge.pledgedUsers.length + " out of " + pledge.target + " people have agreed to do this",
        pledge.coverPhoto ? pledge.coverPhoto : 'https://www.allforone.io/images/splash.jpg',
        'https://www.allforone.io/pages/pledges/' + pledge.slug + '/' + pledge._id,
        'View Pledge', "I_WANT_PLEDGES", function(err, result) {
          if (err) {
            console.log(err)
          } else {
            Pledges.update({_id: pledge._id}, {$addToSet: {seenBy: senderId}})
          }
        })
      } else {
        return (false)
      }
    } else {
      var pledge = Pledges.findOne({title: {$ne: 'Untitled Pledge'}, seenBy: {$ne: senderId}})
      if (pledge) {
        Meteor.call("sendSuggestionTemplate", senderId,
        pledge.title, pledge.pledgedUsers.length + " out of " + pledge.target + " people have agreed to do this",
        pledge.coverPhoto ? pledge.coverPhoto : 'https://www.allforone.io/images/splash.jpg',
        'https://www.allforone.io/pages/pledges/' + pledge.slug + '/' + pledge._id,
        'View Pledge', "I_WANT_PLEDGES", function(err, result) {
          if (err) {
            console.log(err)
          } else {
            Pledges.update({_id: pledge._id}, {$addToSet: {seenBy: senderId}})
          }
        })
      } else {
        return (false)
      }
    }
  }
})

Meteor.methods({
  findAProject: function(senderId) {
    var user = Meteor.users.findOne({userMessengerId: senderId})
    if (user) {
      var project = Suggestions.findOne({seenBy: {$ne: senderId}, source: 'Experiment'})
      if (project) {
        Meteor.call("sendSuggestionTemplate", senderId,
        project.title, project.description,
        project.image ? project.image : 'https://www.allforone.io/images/splash.jpg',
        project.url,
        'View Project', "I_WANT_PROJECTS", function(err, result) {
          if (err) {
            console.log(err)
          } else {
            Suggestions.update({_id: project._id}, {$addToSet: {seenBy: senderId}})
          }
        })
      } else {
        return (false)
      }
    } else {
      var project = Suggestions.findOne({seenBy: {$ne: senderId}, source: 'Experiment'})
      if (project) {
        Meteor.call("sendSuggestionTemplate", senderId,
        project.title, project.description,
        project.image ? project.image : 'https://www.allforone.io/images/splash.jpg',
        project.url,
        'View Project', "I_WANT_PROJECTS", function(err, result) {
          if (err) {
            console.log(err)
          } else {
            Suggestions.update({_id: project._id}, {$addToSet: {seenBy: senderId}})
          }
        })
      } else {
        return (false)
      }
    }
  }
})

Meteor.methods({
  findAnEvent: function(senderId) {
    var user = Meteor.users.findOne({userMessengerId: senderId})
    if (user) {
      var event = Suggestions.findOne({seenBy: {$ne: senderId}, source: 'Eventbrite', interest: 'Climate Change'
            , start: {$gte: new Date()}})
      if (event) {
        Meteor.call("sendSuggestionTemplate", senderId,
        event.title, removeMd(event.description),
        event.image ? event.image : 'https://www.allforone.io/images/splash.jpg',
        event.url,
        'View Event', "I_WANT_EVENTS", function(err, result) {
          if (err) {
            console.log(err)
          } else {
            Suggestions.update({_id: event._id}, {$addToSet: {seenBy: senderId}})
          }
        })
      } else {
        return (false)
      }
    } else {
      var event = Suggestions.findOne({seenBy: {$ne: senderId}, source: 'Eventbrite', interest: 'Climate Change'
            , start: {$gte: new Date()}})
      if (event) {
        Meteor.call("sendSuggestionTemplate", senderId,
        event.title, removeMd(event.description),
        event.image ? event.image : 'https://www.allforone.io/images/splash.jpg',
        event.url,
        'View Event', "I_WANT_EVENTS", function(err, result) {
          if (err) {
            console.log(err)
          } else {
            Suggestions.update({_id: event._id}, {$addToSet: {seenBy: senderId}})
          }
        })
      } else {
        return (false)
      }
    }
  }
})

export function callSendAPI(messageData) {
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
  findAppId: function(senderId) {
    var options = {
        url: `https://graph.facebook.com/v2.10/${senderId}/ids_for_apps`,
        qs: { access_token: 'EAAbWYZCz3y50BADfOyHdLTYdgqpZCVYZAslhisDAoegVSR2ufVFreyZA4wkbZA2XseiVZC9OVlFJIiHaYe2AZADJggKsexQpLr1nEjFY8jG91mbHpPA1zbFdUeTtXKD2HxXZCUz1qeGZB1Q8dflj0yZCYfBDYsns76WZC94fUUIZBkktZBwZDZD' },
        method: 'GET'
      };
    try {
      var res = request.sync(options);
      if (res.response.statusCode == 200) {
        var apps = JSON.parse(res.body)
        var appId = apps.data[0].id


        if (appId) {
          console.log("Successfully got appId %s",
            appId);
          Meteor.users.update({'services.facebook.id': appId}, {$set: {userMessengerId: senderId}})
        } else {

        }
      }
    } catch(error) {
        console.error("Failed finding APP Id", res.response.statusCode, res.response.statusMessage, res.body.error)
      }
    }
})



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


      HTTP.call('POST', 'https://onesignal.com/api/v1/notifications', options, function(error, result) {
    // Process t1he return for any ids that were not recognised to remove them from our database
          if (result && result.data && result.data.errors && result.data.errors.invalid_player_ids) {
            
              result.data.errors.invalid_player_ids.forEach(playerId => {
                  Meteor.users.update({oneSignalUserId: playerId}, {$pull: {oneSignalUserId: playerId}});
              });
          }
      });

    }
    })
