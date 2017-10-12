import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Pledges } from '/imports/api/pledges.js';
import {Suggestions } from '/imports/api/suggestions.js';
import { Threads } from '/imports/api/threads.js';
import { Accounts } from 'meteor/accounts-base';
import { HTTP } from 'meteor/http';
import { request } from "meteor/froatsnook:request";

if (Meteor.isServer) {
  // This code only runs on the server

  Meteor.users._ensureIndex({ 'services.facebook.id': 1 }, {unique: false});

  Meteor.publish("userData", function () {
    if (this.userId) {
        return Meteor.users.find({_id: this.userId}, {fields: {visits: 0, influence: 0, potentialSuggestions: 0}})
    } else {
      this.ready();
    }

  });

  Meteor.publish("messengerIDExists", function() {
    return Meteor.users.find({_id: this.userId}, {fields: {userMessengerId: 1}})
  })

  Meteor.publish("userCount", function() {
    return Meteor.users.find().count()
  })

  Meteor.publish("userFriends", function() {
    if (this.userId) {
      var userFriends = Meteor.user().friends
      if (userFriends && userFriends.length > 0) {
        var friendList = []
        for (var i = 0; i < userFriends.length; i++) {
          friendList.append(userFriends[i].id)
        }
        return Meteor.users.find({'services.facebook.id': {$in: friendList}}, {
          fields: {'services.facebook.id' : 1}
        });
      } else {
        this.ready();
      }

    } else {
      this.ready();
    }

  })

  Meteor.publish("userScores", function() {
    if (this.userId) {
      return Meteor.users.find({}, {
        fields: {_id: 1, 'profile': 1, 'email.address': 1, score:1, 'services.facebook.id' : 1
      }, sort: {score: -1}, limit: 10}
      )
    }
    else {
      this.ready()
    }

  })

  Meteor.publish('pledgeRoles', function (){
  return Meteor.roles.find({})
})

  Meteor.publish("publicUser", function(_id) {
    return Meteor.users.find({_id: _id}, {
      fields: {_id: 1, 'profile': 1, 'email.address': 1, score:1, 'services.facebook.id' : 1, 'createdAt': 1, 'friends': 1
    }
    })
  })

  Meteor.publish('messageTypeCounts', function(pledgeId, groupName) {
    var lookupString = 'roles.' + pledgeId
    Counts.publish(this, 'oneSignalCount', Meteor.users.find({
      "committedPledges._id":  pledgeId
      , [lookupString] : groupName
      , OneSignalUserId : {$exists : true}
      }))

    Counts.publish(this, 'messengerCount', Meteor.users.find({
      "committedPledges._id":  pledgeId
      , [lookupString] : groupName
      , userMessengerId : {$exists : true}
      }))

    Counts.publish(this, 'emailCount', Meteor.users.find({
      "committedPledges._id":  pledgeId
      , [lookupString] : groupName
      , 'profile.email' : {$exists : true}
      }))

    Counts.publish(this, 'smsCount', Meteor.users.find({
      "committedPledges._id":  pledgeId
      , [lookupString] : groupName
      , 'profile.phone' : {$exists : true}
      }))

      Counts.publish(this, 'allforoneCount', Meteor.users.find({
        "committedPledges._id":  pledgeId
        , [lookupString] : groupName
        }))

  })

  Meteor.publish('everyoneMessageTypeCounts', function(pledgeId) {
    var lookupString = 'roles.' + pledgeId
    Counts.publish(this, 'allOneSignalCount', Meteor.users.find({
      "committedPledges._id":  pledgeId
      , OneSignalUserId : {$exists : true}
      }))

    Counts.publish(this, 'allMessengerCount', Meteor.users.find({
      "committedPledges._id":  pledgeId
      , userMessengerId : {$exists : true}
      }))

    Counts.publish(this, 'allEmailCount', Meteor.users.find({
      "committedPledges._id":  pledgeId
      , 'profile.email' : {$exists : true}
      }))

    Counts.publish(this, 'allSmsCount', Meteor.users.find({
      "committedPledges._id":  pledgeId
      , 'profile.phone' : {$exists : true}
      }))

      Counts.publish(this, 'allAllForOneCount', Meteor.users.find({
        "committedPledges._id":  pledgeId
        }))
  })



  process.env.MAIL_URL=Meteor.settings.public.MAIL_URL;
}




Accounts.onCreateUser(function(options, user) {
    if (options.profile) {
        options.profile.picture = "https://graph.facebook.com/" + user.services.facebook.id + "/picture/?type=large";
        user.profile = options.profile;
        user.justAddedPledge = true
    } else {
      user.profile = {name: options.name}
    }
    return user;
});

Accounts.onLogin(function(){
  Meteor.call('addVisit')

});

Meteor.methods({
  resetJustAddedPledge: function() {
    if (this.userId) {
      Meteor.users.update({_id: this.userId}, {$set: {
        justAddedPledge: false
      }})
    }
  }
})

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
  addName: function(name) {
    Meteor.users.update({_id: this.userId}, {$set: {
      'profile.name' : name
    }})
  }
})

Meteor.methods({
  changeUserRole: function(list, role) {
    if (this.userId === 'msfgNtu67nrevfX6c' || this.userId === 'p6ZQiT9b7iWKcyL9D' || this.userId === 'NQCv89bcqjjL6iAQp'  || Roles.userIsInRole(this.userId, 'admin')) {
      Roles.addUsersToRoles(list, role, Roles.GLOBAL_GROUP)
    }
  }
})

Meteor.methods({
  whosGotEmail: function(ids) {
    this.unblock()
      var emailArray = {}
      console.log(ids)
      for (var i = 0; i<ids.length; i++) {
        if (Meteor.users.findOne({_id: ids[i]._id}).profile.email) {
          emailArray[ids[i]._id] = true
        } else {
          emailArray[ids[i]._id] = false
        }
      }
      return emailArray
  }
})

Meteor.methods({
  whosGotSMS: function(ids) {
    this.unblock()
      var smsArray = {}
      console.log(ids)
      for (var i = 0; i<ids.length; i++) {
        if (Meteor.users.findOne({_id: ids[i]._id}).profile.phone) {
          smsArray[ids[i]._id] = true
        } else {
          smsArray[ids[i]._id] = false
        }
      }
      return smsArray
  }
})

Meteor.methods({
  whosGotOneSignal: function(ids) {
    this.unblock()
      var oneSignalArray = {}
      console.log(ids)
      for (var i = 0; i<ids.length; i++) {
        if (Meteor.users.findOne({_id: ids[i]._id}).oneSignalUserId) {
          oneSignalArray[ids[i]._id] = true
        } else {
          oneSignalArray[ids[i]._id] = false
        }
      }
      return oneSignalArray
  }
})

Meteor.methods({
  whosGotMessenger: function(ids) {
    this.unblock()
      var messengerArray = {}
      console.log(ids)
      for (var i = 0; i<ids.length; i++) {
        if (Meteor.users.findOne({_id: ids[i]._id}).userMessengerId) {
          messengerArray[ids[i]._id] = true
        } else {
          messengerArray[ids[i]._id] = false
        }
      }
      return messengerArray
  }
})

Meteor.methods({
  updateEmail: function(email) {
    this.unblock()
    if (this.userId) {
      Meteor.users.update({_id: this.userId}, {$set: {
        'profile.email': email
      }})
    }
  }
})

Meteor.methods({
  updatePhone: function(phoneNo) {
    this.unblock()
    if (this.userId) {
      Meteor.users.update({_id: this.userId}, {$set: {
        'profile.phone': phoneNo
      }})
    }
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

  //  Meteor.call('sendIntroFacebookMessage', userMessengerId)
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
    var pledgeCount = user.committedPledges ? user.committedPledges.length : 0
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


    var score = friendCount + pledgeCount + pledgeTotalValue/2 + threadCommentTotal + 5
    var scoreObject = {total: score, friend: friendCount
      , pledge: pledgeCount, pledgeImpact: pledgeTotalValue/2, thread: threadCommentTotal, signUp: 5}
    console.log(scoreObject)
    Meteor.users.update({
      _id: _id}, {$set: {
        score: scoreObject
      }}
    )

    var userPledges = Pledges.find({pledgedUsers: _id}).fetch()
    var pledgeFriendInfluence = 0
    var userFBID
    if (user.services && user.services.facebook && user.services.facebook.id) {
      userFBID = user.services.facebook.id
    }
    for (var i in userPledges ) {
      if (userPledges[i] && userPledges[i].pledgedUsers) {
        var signupNo = userPledges[i].pledgedUsers.indexOf(_id)
        var afterUserSignUps = userPledges[i].pledgedUsers.slice(signupNo, userPledges[i].pledgedUsers.length)
        var afterUserFriends = Meteor.users.find({_id: {$in: afterUserSignUps}, 'friends.id': userFBID}).fetch()
        pledgeFriendInfluence += afterUserFriends.length

      }
    }

    var createdPledges = Pledges.find({creatorId: _id}).fetch()
    var pledgeCreatedInfluence = 0
    for (var j in createdPledges) {
      if (createdPledges[j] && createdPledges[j].pledgedUsers) {
        var userLength = createdPledges[j].pledgedUsers.length - 1
        pledgeCreatedInfluence += userLength
      }
    }

    var userSuggestions = Suggestions.find({contributor: _id}).fetch()
    var suggestionInfluence = 0
    for (var k in userSuggestions) {
      if (userSuggestions[k] && userSuggestions[k].stars) {
        var suggestionStars = userSuggestions[k].stars.length
        suggestionInfluence += suggestionStars
      }
      if (userSuggestions[k] && userSuggestions[k].clicks) {
        var suggestionClicks = userSuggestions[k].clicks.length
        suggestionInfluence += suggestionClicks
      }
    }

    console.log(pledgeFriendInfluence)

    var totalInfluence = pledgeFriendInfluence + pledgeCreatedInfluence + suggestionInfluence
    var influence = {pledgeFriendInfluence: pledgeFriendInfluence, pledgeCreatedInfluence: pledgeCreatedInfluence,
          suggestionInfluence: suggestionInfluence, totalInfluence: totalInfluence, date: new Date()}
    console.log(influence)

    Meteor.users.update({
      _id: _id}, {$push: {
        influence: influence
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
