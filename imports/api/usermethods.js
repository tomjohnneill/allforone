import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Pledges } from '/imports/api/pledges.js';
import { Threads } from '/imports/api/threads.js';
import { Accounts } from 'meteor/accounts-base';
import { HTTP } from 'meteor/http';
import { request } from "meteor/froatsnook:request";

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish("userData", function () {
    return Meteor.users.find({_id: this.userId})
  });

  Meteor.publish("userCount", function() {
    return Meteor.users.find().count()
  })

  Meteor.publish("userFriends", function() {
    return Meteor.users.find({}, {
      fields: {'services.facebook.id' : 1}
    })
  })

  Meteor.publish("userScores", function() {
    return Meteor.users.find({}, {
      fields: {_id: 1, 'profile': 1, 'email.address': 1, score:1, 'services.facebook.id' : 1
    , visits: 1}
    })
  })


  process.env.MAIL_URL=Meteor.settings.public.MAIL_URL;
}


Accounts.onCreateUser(function(options, user) {
    if (options.profile) {
        options.profile.picture = "https://graph.facebook.com/" + user.services.facebook.id + "/picture/?type=large";
        user.profile = options.profile;
        user.justAddedPledge = true
    }
    return user;
});

Accounts.onLogin(function(user){
  Meteor.call('addVisit')
});

Meteor.methods({
  addVisit: function() {
    this.unblock()
    if (this.userId)
    Meteor.users.update({_id: this.userId}, {$push: {
      visits: new Date()
    }})
  }
})

Meteor.methods({
  updateMessengerId: function(userMessengerId, userId) {
    console.log('updating messenger ID')
    console.log(userMessengerId)
    console.log(userId)
    Meteor.users.update({_id: userId},{$set :{
      userMessengerId: userMessengerId
    }})
  }
})

Meteor.methods({
  findFriends: function() {
    this.unblock()
    if (this.userId)
    var user = Meteor.users.findOne({_id: this.userId})
    var accessToken = user.services.facebook.accessToken
    var result = HTTP.call("GET", "https://graph.facebook.com/v2.9/" + user.services.facebook.id ,
              {params: {"fields":"friends.limit(100){email,first_name,last_name,picture}", "access_token":accessToken, "limit":100}}
  )
  var content = undefined
  if (result === undefined) {
    content = undefined
    Meteor.users.update({
      _id: this.userId}, {$set: {
        friends: {}
      }
    }
    )
  } else {
  content = result.data
  console.log(content)
  Meteor.users.update({
    _id: this.userId}, {$set: {
      friends: content.friends.data
    }}
  )
}
  return content;
  }
})



Meteor.methods({
  updateLatestVisit: function() {
    this.unblock()
    Meteor.users.update({_id: this.userId}, {$push: {
      latestVisit: {date: new Date()}
    }})
  }
})

Meteor.methods({
  sendFBMessage: function(id) {
    this.unblock()
    var user = Meteor.users.findOne({_id: id})
    console.log(user.services.facebook.id)
    var accessToken = user.services.facebook.accessToken
    var result = HTTP.call("POST", "https://graph.facebook.com/v2.9/me/messages?access_token="
                  + 'EAALEiH43qngBAH2K26xrptfQyeEFSFdpO8LCpynq4ePZAfdEZARkDaZCLtgg9PuqqQZBuBW2bHG3qJIQYmNifICgSEhTDPu9hQ7ujmUU5XIMPodhzH5cJKzOZBKBlxe5wTEXgxRZCZBLEGchZCnAPZBeZAyQpBrWr4FJAUtDj3hasT2gZDZD',
                            {
                              headers: {
                              "Content-Type": "application/json"
                            },
                            params: {
                              "recipient" : {
                                "id": user.userMessengerId
                              },
                              "message" : {
                                "text": message
                              }
                            }
                          }
    )
  }
})




Meteor.methods({
  countUsers : function(_id) {
    console.log(_id)
    console.log('count users called')
    console.log(Pledges.findOne({_id: _id}).pledgedUsers)
    let userCount = Pledges.findOne({_id: _id}).pledgedUsers.length
    return userCount
  }
})

Meteor.methods({
  registerUserToNotification: function(id) {
    if (this.userId)
    Meteor.users.update({_id: this.userId}, {
      $set: {
        OneSignalUserId: id
      }
    })
  }
})

Meteor.methods({
  recalculateScore : function(_id) {
    this.unblock()
    var user = Meteor.users.findOne({_id: _id})
    var friendCount = 0
    if (user.friends !== undefined) {
      friendCount = user.friends.length * 5
    }
    var pledgeCount = user.committedPledges.length
    console.log('Friend count = ' + friendCount + '  Pledge Count = ' + pledgeCount)
    var pledgeTotalValue = 0
    for (var pledge in user.committedPledges) {
      let pledgeId = user.committedPledges[pledge]._id
      if (pledgeId !== undefined) {
        let pledgeDocument = Pledges.findOne({_id: user.committedPledges[pledge]._id})
          if (pledgeDocument !== undefined && pledgeDocument.pledgeCount !== undefined) {
            console.log(pledgeDocument.pledgeCount)
            pledgeTotalValue = pledgeTotalValue + pledgeDocument.pledgeCount
      }
  }
    }
    var threadCommentTotal = 0
    var threads = Threads.find({}).fetch()
    for  (var each in threads) {
      console.log(each)
      if (threads[each].creatorId === user._id && threads[each].comments !== undefined) {
        threadCommentTotal = threadCommentTotal + threads[each].comments.length
      }
    }

    var score = friendCount + pledgeCount + pledgeTotalValue/2 + threadCommentTotal + 5
    var scoreObject = {total: score, friend: friendCount
      , pledge: pledgeCount, pledgeImpact: pledgeTotalValue/2, thread: threadCommentTotal, signUp: 5}
    console.log(scoreObject)
    Meteor.users.update({
      _id: _id}, {$set: {
        score: scoreObject
      }}
    )
  }
})

Meteor.methods({
  triggerSocialScoreCalculate : function() {
    this.unblock()
    let user = Meteor.users.findOne({_id: this.userId})
    var accessToken = user.services.facebook.accessToken
    var result = HTTP.call("GET", "https://graph.facebook.com/v2.9/" + user.services.facebook.id ,
              {params: {"fields":"friends{email,first_name,last_name,picture}", "access_token":accessToken}})


    for (var friend in result.data.friends.data) {
      Meteor.call('recalculateScore', Meteor.users.findOne({'emails.address': result.data.friends.data[friend].email})._id)
    }
  }
})
