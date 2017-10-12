import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Accounts } from 'meteor/accounts-base';
import '../imports/api/usermethods.js';

if (Meteor.isServer) {

  // Global API configuration
  var Api = new Restivus({
    useDefaultAuth: true,
    prettyJson: true,
    authRequired: true,
  });


  Api.addCollection(Meteor.users, {
  excludedEndpoints: [ 'put','post','delete','patch'],
  routeOptions: {
    authRequired: true
  }
});

  Api.addRoute('webhook', {
    get: function () {

    if (this.queryParams['hub.mode'] === 'subscribe' &&
      this.queryParams['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
        console.log('Validating webhook');
        return {
          statusCode: 200,
          body: parseInt(this.queryParams['hub.challenge'])
        };
      } else if (this.bodyParams) {
        return {
          statusCode: 200
        }
      }
        else {
        console.error("Failed validation. Make sure the validation tokens match.");
        return {
          statusCode: 403,
        };
      }
    },
    post: function () {

      // Optin on site click
    if (this.bodyParams.entry[0].messaging[0].optin) {
      Meteor.call('updateMessengerId', this.bodyParams.entry[0].messaging[0].sender.id,
      this.bodyParams.entry[0].messaging[0].optin.ref
      , function(error, result) {
        if (error) {
          console.log(error)
        } else {
          console.log('update Messenger Id called')
        }
      })
      console.log('This is the sender id:' + this.bodyParams.entry[0].messaging[0].sender.id)
      var userMessengerId = this.bodyParams.entry[0].messaging[0].sender.id
      Meteor.users.update({_id: this.userId},{$set :{
        userMessengerId: userMessengerId
      }})
    }



    if (this.bodyParams.entry[0].messaging[0].message && this.bodyParams.entry[0].messaging[0].message.text) {

      if (this.bodyParams.entry[0].messaging[0].message.text === 'Send me the menu') {
        Meteor.call('sendFirstQuestion', this.bodyParams.entry[0].messaging[0].sender.id)
      } else {
        try {
          Meteor.call('checkForFBReply', this.bodyParams.entry[0].messaging[0].message.text, this.bodyParams.entry[0].messaging[0].sender.id)
        } catch (error) {
          console.log(error)
        }
      }
      /*
      Meteor.call('sendTextMessage', this.bodyParams.entry[0].messaging[0].sender.id,
      "Sorry, we're not great at replying to text messages just yet.")
      Meteor.call('sendButtonMessage',this.bodyParams.entry[0].messaging[0].sender.id,
      "Would you be interested in some suggestions?",
      "Yes please",
      "SEND_ME_SOME_SUGGESTIONS")
      */

    }
    if (this.bodyParams.entry[0].messaging[0].postback && this.bodyParams.entry[0].messaging[0].postback.payload === 'SEND_ME_SOME_SUGGESTIONS') {
      Meteor.call("sendSuggestionTemplate", this.bodyParams.entry[0].messaging[0].sender.id,
      'Swap bottles for a local pint', '38 out of 60 people have agreed to do this',
      'https://idle-photos.s3-eu-west-2.amazonaws.com/CZngbJkCmzDMoocMu/alcohol-15470_1280.jpg',
      'https://www.allforone.io/pages/pledges/swap-bottles-for-a-local-pint/CZngbJkCmzDMoocMu',
      'View Pledge', 'I_WANT_PLEDGES')
    }
    if (this.bodyParams.entry[0].messaging[0].postback && this.bodyParams.entry[0].messaging[0].postback.payload === 'SEND_ME_SOME_SUGGESTIONS') {
      Meteor.call('sendTextMessage', this.bodyParams.entry[0].messaging[0].sender.id,
      "Sorry, it seems we don't have any more suggestions just yet. Come back later for more.")
    }
    if (this.bodyParams.entry[0].messaging[0]) {

    }
    if (this.bodyParams.entry[0].messaging[0].postback) {
      var postback = this.bodyParams.entry[0].messaging[0].postback
      console.log(postback)
      if (postback.payload === "GET_STARTED_PAYLOAD") {
        Meteor.call('sendFirstQuestion', this.bodyParams.entry[0].messaging[0].sender.id)
      }
      if (postback.payload === "FIND_SOMETHING") {
        Meteor.call('sendChoicesButton', this.bodyParams.entry[0].messaging[0].sender.id)
      }
      if (postback.payload === "SUGGEST_SOMETHING") {
        Meteor.call('sendChoicesButton', this.bodyParams.entry[0].messaging[0].sender.id)
      }
      if (postback.payload === "I_WANT_EVENTS") {
        if (Meteor.call("findAnEvent", this.bodyParams.entry[0].messaging[0].sender.id) === false) {
          Meteor.call('sendTextMessage', this.bodyParams.entry[0].messaging[0].sender.id,
        "It seems you've seen all our events. Maybe try something else?")
        }
      }
      if (postback.payload === "I_WANT_PROJECTS") {
        if (Meteor.call("findAProject", this.bodyParams.entry[0].messaging[0].sender.id) === false) {
          Meteor.call('sendTextMessage', this.bodyParams.entry[0].messaging[0].sender.id,
        "It seems you've signed up to all the relevant projects. Maybe try something else?")
        }
      }
      if (postback.payload === "I_WANT_TASKS") {
        Meteor.call('sendTextMessage', this.bodyParams.entry[0].messaging[0].sender.id,
        "Sorry, it seems we don't have any more tasks just yet. Come back later for more.")
      }
      if (postback.payload === "I_WANT_PLEDGES") {
        if (Meteor.call("findAPledge", this.bodyParams.entry[0].messaging[0].sender.id) === false) {
          Meteor.call('sendTextMessage', this.bodyParams.entry[0].messaging[0].sender.id,
        "It seems you've signed up to all the relevant pledges. Maybe start your own?")
        }
      }
      if (postback.payload.includes(':AnSwEr:')) {
        console.log('Should be an answer to a detail: ' + postback.payload)
        Meteor.call('updateDetailFromMessenger', this.bodyParams.entry[0].messaging.sender.id, this.bodyParams.entry[0].messaging.recipient.id, postback.payload)
      }
      if (this.bodyParams.entry[0].messaging[0]) {
        Meteor.call('findAppId', this.bodyParams.entry[0].messaging[0].sender.id)
      }

    }
    if (this.bodyParams.entry[0].messaging[0].message && this.bodyParams.entry[0].messaging[0].message.quick_reply) {
      var payload = this.bodyParams.entry[0].messaging[0].message.quick_reply.payload
      if (payload.includes(':AnSwEr:')) {
        console.log('Should be an answer to a detail: ' + payload)
        Meteor.call('updateDetailFromMessenger', this.bodyParams.entry[0].messaging[0].sender.id, payload)
      }
    }
    return {
      statusCode: 200
    }
  }
})
}
