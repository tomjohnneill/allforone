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
        console.log(this.bodyParams)
        console.log(this.bodyParams)
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
      console.log(this.bodyParams.entry[0].messaging[0].sender.id)
      console.log(this.bodyParams.entry[0].messaging[0].optin.ref)
    if (this.bodyParams.entry[0].messaging[0]) {
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
    return {
      statusCode: 200
    }
  }
})
}
