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
    enableCors: true,
  });


  Api.addCollection(Meteor.users, {
  excludedEndpoints: [ 'put','post','delete','patch'],
  routeOptions: {
    authRequired: true
  }
});

  Api.addRoute('mailgun', {
    enableCors: true,
    post: function () {
      console.log(this.queryParams)

      console.log(this.bodyParams)

      console.log(this.bodyParams['stripped-text'])
      if (this.bodyParams['stripped-text']) {
        Meteor.call('addEmailReplyToThread',
        this.bodyParams['stripped-text'], this.bodyParams['sender']
        , this.bodyParams['recipient'], this.bodyParams['Thread-Topic'])
      }

    return {
      statusCode: 200
    }
  }
  })
}
