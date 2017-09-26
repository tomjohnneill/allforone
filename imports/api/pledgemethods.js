import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Pledges, Details, Responses, GroupCriteria } from '/imports/api/pledges.js';
import { PledgeVisits } from '/imports/api/pledges.js';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {callSendAPI} from '/imports/api/alertmethods.js';

var geoip = require('geoip-lite');
var parser = require('ua-parser-js');

Meteor.methods({

  /**
   * Log the initial visit
   * @param  {Obect} tracking - An object containing tracking variables
   * @return {Object}  The initial visit record
   */
  logVisit: function (pledgeId, tracking, type, allforone) {
    var h, r, visit, ip, geo, id, user;

    this.unblock()

    // Get the headers from the method request
    h = headers.get(this);

    // Parse the user agent from the headers
    r = parser(h['user-agent']);
    console.log(r)
    // Autodetect spiders and only log visits for real users
    if (r.device != 'spider') {

      // Get the IP address from the headers
      ip = headers.methodClientIP(this);

      // Geo IP look up for the IP Address
      geo = geoip.lookup(ip);

      // Build the visit record object
      visit = {
        referer: allforone ? 'https://www.allforone.io': h.referer,
        ipAddress: ip,
        userAgent:  {
          raw: r.string,
          browser: r.userAgent,
          device: r.device,
          os: r.os
        },
        geo: geo,
        date: new Date()
      };

      var user
      if (this.userId) {
        var thisUser = Meteor.users.findOne({_id: this.userId})
        user = {
          userId: this.userId,
          gender: thisUser.services.facebook.gender,
          locale: thisUser.services.facebook.locale,
          fbId: thisUser.services.facebook.id,
          email: thisUser.services.facebook.email,
          ageRange: thisUser.services.facebook.age_range,
          friendCount: thisUser.friends ? thisUser.friends.length : 0
        }
        Meteor.users.update({_id: this.userId}, {$set: {
          geo: geo
        }})
      } else {
        user = null
      }
      console.log(tracking)
      return PledgeVisits.insert({visit, user, pledgeId, type, tracking});



    } else {
      return 'Spider Detected'
    }
  },

  logSignUpClick: function(visitId) {
    PledgeVisits.update({_id: visitId}, {$set: {
      signUpClick: new Date()
    }})
  }

});

Meteor.methods({
  flipReturning: function() {
    dateList = PledgeVisits.find({'visit.date': {$ne: undefined}},
    {fields: {'_id': 1,'visit.date' : 1, user: 1, signUpClick: 1,  'visit.referer': 1,
      'visit.geo.ll': 1, 'visit.userAgent.device.type':1, 'pledgeId': 1, 'type': 1}})

      for (var i in dateList) {
        if (dateList[i].pledgeId === 'returning') {
          var pledgeId = dateList[i].type
          var type = dateList[i].pledgeId
          PledgeVisits.update({_id: dateList[i]._id}, {$set: {
            pledgeId, type
          }})
        }
      }
  }
})

Meteor.methods({
  saveGroupCriteria: function(details, locationChoice, geojson, filters, pledgeId, name) {
    if (Roles.userIsInRole(this.userId, 'administrator', pledgeId) || Roles.userIsInRole(this.userId, 'admin')) {
      console.log(details)
      console.log(locationChoice)
      console.log(geojson)

      GroupCriteria.upsert({name: name, pledgeId: pledgeId}, {$set: {
        details: details,
        locationChoice: locationChoice,
        geojson: geojson,
        filters: filters,
        pledgeId, pledgeId
      }})
    }
  }
})

Meteor.methods({
  recalculateGroupMembers: function(groupName, pledgeId) {
    this.unblock()
    var roleName = groupName
    var criteria = GroupCriteria.findOne({name: groupName, pledgeId: pledgeId})
    var users = []
    var overallUsers
    if (criteria.geojson.features.length > 0 && criteria.filters.length) {
      Meteor.call('findMatching', criteria.geojson, criteria.locationChoice, pledgeId, (err, result) => {
        if (err) {
          console.log(err.reason)
        } else {
          for (var i in result) {
            users.push(result[i].userId)
          }
          Meteor.call('findRelevantUsers', criteria.filters, criteria.details, (err, response) => {
            if (err) {
              console.log(err.reason)
            } else {
              overallUsers = users.filter(function(n) {
                return response.indexOf(n) !== -1;
              });
              Meteor.call('addUsersToPledgeGroup', overallUsers, groupName, pledgeId)
            }
          })
        }
      })
    } else if (criteria.filters.length) {
        console.log('second option')
        Meteor.call('findRelevantUsers', criteria.filters, criteria.details, (err, response) => {
          if (err) {
            console.log(err.reason)
          } else {
            console.log(response)
            if (users.length > 0) {
              overallUsers = users.filter(function(n) {
                return response.indexOf(n) !== -1;
              });
            } else {
              overallUsers = response
            }
            console.log(overallUsers)
            console.log(roleName)
            console.log(pledgeId)
            Meteor.call('addUsersToPledgeGroup', overallUsers, roleName, pledgeId)
          }
        })
      } else {
        console.log('third option')
        Meteor.call('findMatching', criteria.geojson, criteria.locationChoice, pledgeId, (err, result) => {
          if (err) {
            console.log(err.reason)
          } else {
            for (var i in result) {
              overallUsers.push(result[i].userId)
            }
            console.log(overallUsers)
            Meteor.call('addUsersToPledgeGroup', overallUsers, groupName, pledgeId)
          }
        })
      }




    }
})



Meteor.methods({
  addUsersToPledgeGroup: function(userIds, groupName, pledgeId) {
    if (Roles.userIsInRole(this.userId, 'administrator', pledgeId) || Roles.userIsInRole(this.userId, 'admin')) {
      var roleName = groupName
      if (roleName === 'admin' || roleName === 'administrator') {
        throw new Meteor.error(405, 'Error 405: Method Not Allowed', 'This group name is not allowed')
      }
      Roles.addUsersToRoles(userIds, roleName, pledgeId)
    }
  }
})

Meteor.methods({
  saveQuestions: function(pledgeId, data) {
    if (Roles.userIsInRole(this.userId, 'administrator', pledgeId) || Roles.userIsInRole(this.userId, 'admin')) {

      var idList = []
      for (var j in data) {
        idList.push(data[j].id ? data[j].id : data[j]._id)
      }

      console.log(idList)

      Details.remove({pledgeId: pledgeId, _id: {$nin: idList}})

      for (var i in data) {
        var id = data[i].id ? data[i].id : data[i]._id
        if (id.length > 10) {
          Details.update({_id: id}, {$set:
            {pledgeId: pledgeId,
            type: data[i].type,
            question: data[i].question,
            options: data[i].options}
          }
          )
        } else {
        Details.insert({
          pledgeId: pledgeId,
          type: data[i].type,
          question: data[i].question,
          options: data[i].options
        })
      }
      }
    }
  }
})

Meteor.methods({
  updateDetail: function(response) {
    Details.update({_id: response.id}, {$pull: {
      members: {userId: this.userId}
    }})

    Details.update({
        _id: response.id
      }, {$addToSet: {
        members: {userId: this.userId, response: response.value}
      }})

    Responses.upsert({detailId: response.id, userId: this.userId}, {$set:
    {
      detailId: response.id,
      userId: this.userId,
      value: response.value
    }})
  }
})

Meteor.methods({
  runDetailInFuture: function(details) {
    var userId = this.userId
    var userMessengerId = Meteor.users.findOne({_id: this.userId}).userMessengerId
    for (var i in details) {
      Meteor.setTimeout(() => {
         Meteor.call('sendMessengerQuestionQuickReplies', details[i], userMessengerId, userId)
      }, 0.1 * 60 * 1000);
    }
  }
})

Meteor.methods({
  updateDetailFromMessenger: function(senderId, postback) {
    console.log(senderId)

    console.log(postback)
    var user = Meteor.users.findOne({userMessengerId: senderId})

    var parts = postback.split(':AnSwEr:')
    console.log(parts[0])
    console.log(parts[1])
    Details.update({
      _id: parts[0]
    }, {$pull :{
      members: {userId: user._id}
    }})

    Details.update({
        _id: parts[0]
            }, {$addToSet: {
        members: {userId: user._id, response: parts[1]}
      }})

    Responses.upsert({detailId: parts[0], userId: user._id}, {$set:
    {
      detailId: parts[0],
      userId: user._id,
      value: parts[1]
    }})
  }
})

Meteor.methods({
  sendMessengerQuestionQuickReplies: function(detail, recipientId, userId) {
    console.log(detail)
    var userResponse = Responses.findOne({userId: userId, detailId: detail._id})
    console.log("Detail ID: "+ detail._id)
    console.log("User ID: "+ userId)
    console.log(userResponse)
    if (!userResponse) {
      var quickReplies = []
      for (var i =0; i<detail.options.length; i++) {
        console.log(detail.options[i])
        quickReplies.push({
          content_type: "text",
          "title": detail.options[i],
          "payload": detail._id + ':AnSwEr:' + detail.options[i]
        })
      }

      var messageData = {
        recipient: {
          id: recipientId
        },
        message: {
          text: detail.question,
          "quick_replies":quickReplies
        }
      }
      console.log(messageData)
      callSendAPI(messageData)
    }

  }
})

Meteor.methods({
  addUserUpload: function(url, pledgeId) {
    Pledges.update({_id: pledgeId}, {$addToSet: {
      uploads: {userId: this.userId, upload: url}
    }})
  }
})

if (Meteor.isServer) {
  Meteor.publish("editor", function (_id) {
    return Pledges.find({_id: _id})
  });

  Meteor.publish("details", function (pledgeId) {
    return Details.find({pledgeId: pledgeId})
  });

  Meteor.publish("responsesByUserAndPledge", function(pledgeId) {
    return Responses.find({pledgeId: pledgeId, userId: this.userId})
  })

  Meteor.publish("random", function() {
    return Details.find({hi: "hi"})
  })

  Meteor.publish("pledgeVisits", function () {
    return PledgeVisits.find()
  });

  Meteor.publish("pledgeTrelloUrl", function() {
    return Pledges.find({}, {fields: {_id: 1, trelloBoardUrl: 1, coverPhoto: 1, title: 1}})
  })

  Meteor.publish("pledgeList", function () {
    return Pledges.find({title: {$ne: 'Untitled Pledge'}}
    , {fields: {_id : 1, title: 1, slug : 1, creatorPicture : 1, target : 1, pledgedUsers : 1
      , pledgeCount: 1, coverPhoto: 1, creatorId: 1, duration: 1, deadline: 1, approved: 1, rejected: 1}}
    )
  })

  Meteor.publish("approvedPledges", function () {
    return Pledges.find({approved: true}
    , {fields: {_id : 1, title: 1, slug : 1, creatorPicture : 1, target : 1, pledgedUsers : 1
      , pledgeCount: 1, coverPhoto: 1, creatorId: 1, duration: 1, deadline: 1, approved: 1}}
    )
  })

  Meteor.publish("myPledges", function() {
    return Pledges.find({pledgedUsers: this.userId}
      , {fields: {_id : 1, title: 1, slug : 1, creatorPicture : 1, target : 1, pledgedUsers : 1, pledgeCount: 1
      , duration : 1, creatorId: 1, deadline: 1, creator: 1}}
      )
  })

  Meteor.publish("thesePledges", function(_id) {
    return Pledges.find({pledgedUsers: _id}
      , {fields: {_id : 1, title: 1, slug : 1, creatorPicture : 1, target : 1, pledgedUsers : 1, pledgeCount: 1, coverPhoto: 1
      , duration : 1, creatorId: 1, deadline: 1, creator: 1}}
      )
  })

  Meteor.publish("pledgeTitles", function(userId) {
    return Pledges.find({creatorId: userId}, {
      fields: {title: 1}
    })
  })

  Meteor.publish("pledgeUsers", function(pledgeId) {
    var pledge = Pledges.findOne({_id: pledgeId})
    return Meteor.users.find({_id: {$in : pledge.pledgedUsers}}, {
      fields: {_id: 1, 'geo.country': 1, roles: 1, 'profile.name': 1, 'profile.picture': 1}
    })
  })

  Meteor.publish("myCreatedPledges", function() {
    return Pledges.find({creatorId: this.userId})
  })

  Meteor.publish("testDetail", function(id) {
    return Details.find({_id: id})
  })
}

Pledges.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

Meteor.methods({
  newPledge() {
    this.unblock()
    return Pledges.insert( {} );
  }
});

Meteor.methods({
  approvePledges: function(pledgeArray) {
    if (Roles.userIsInRole(this.userId, 'admin')) {
      for (var i in pledgeArray) {
        Pledges.update({_id: pledgeArray[i]}, {$set: {
          approved: true
        }})
      }
    }
  }
})

Meteor.methods({
  rejectPledges: function(pledgeArray) {

    if (Roles.userIsInRole(this.userId, 'admin')) {
      console.log(pledgeArray)
      for (var i in pledgeArray) {
        Pledges.update({_id: pledgeArray[i]}, {$set: {
          approved: false,
          rejected: true
        }})
        console.log(Pledges.findOne({_id: pledgeArray[i]}))
      }
    }
  }
})

Meteor.methods({
  findMatching: function(json, locationChoice, pledgeId) {
    if (Roles.userIsInRole(this.userId, 'administrator', pledgeId) || Roles.userIsInRole(this.userId, 'admin')) {
      var geoJSON = json.features[0].geometry

      if (locationChoice !== 'user') {
        var details = Responses.find( { 'value.location': { $geoWithin: { $geometry: geoJSON } } }, {
          fields: {userId: 1}
        } ).fetch()
        return (details)
      } else {
        var userIds = Meteor.users.find({geo: {$geoWithin : {$geometry : geoJSON}},
          committedPledges: pledgeId}).fetch()
        return (userIds)
      }
    }
  }
})

function findArray(id, value) {
  return (Responses.find({
    detailId: id,
    value: value
  }, {fields: {userId: 1}}).fetch()
  )
}

Meteor.methods({
  findRelevantUsers: function(idList, data) {
    var arrays = []
    console.log(data)
    console.log('Id list: ' + idList)
    for (var i = 0; i < idList.length; i++) {
      arrays[i] = findArray(idList[i], data[idList[i]].choice)
      console.log(arrays)

    }
    if (arrays.length > 1) {
      for (var j = 0; j<arrays.length; j++) {
        var tempArray = []
        for (var k= 0; k <arrays[j].length; k++) {
          tempArray.push(arrays[j][k].userId)
        }
        console.log(tempArray)
        arrays[j] = tempArray
        if (j > 1) {
          arrays[i].filter(function(n) {
            return arrays[i-1].indexOf(n) !== -1;
          });
        }
      }
      console.log(arrays)
    } else {
      var tempArray = []
      for (var k= 0; k <arrays[0].length; k++) {
        tempArray.push(arrays[0][k].userId)
      }
      arrays[0] = tempArray
    }
    return (
      arrays[arrays.length - 1]
    )
  }
})


Meteor.methods({
  addNameToPledgeRoles : function(name, pledgeId) {
    Pledges.update({_id: pledgeId}, {$addToSet: {
      pledgeRoles: name
    }})
  }
})

Meteor.methods({
  sendFriendPledgeSignalNotification: function(id) {
    this.unblock()
    var OneSignalId = Meteor.users.findOne({_id: id}).OneSignalUserId
    if (OneSignalId || 1===1) {
      var options = {
          headers: {
              Authorization: 'Basic ' + Meteor.settings.public.onesignal.api_key,
              'Content-Type': 'application/json; charset=utf-8'
          },
          data: {
              'app_id': Meteor.settings.public.onesignal.appId,
              'contents': {en: 'This is the content of this message'}, // My message
              'headings': {en: 'hello'}, // notification title
              'android_group': 'message',
              'include_player_ids': ["33440c3b-a520-4887-8e69-fe90bc27343a"], // Array of oneSignal user Ids (from my Meteor.users table)
              'url': 'https://www.allforone.io/pages/pledges' // where to go if user clicks on notification
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
  }
})

Meteor.methods({
  updateUserCount(id) {
    this.unblock()
    var pledge = Pledges.findOne({_id: id})
    Pledges.update({_id: id}, {
      $set :{pledgeCount: pledge.pledgedUsers.length}
    })
  }
})

Meteor.methods({
  addPictureToPledge(downloadUrl, pledgeId) {
    var pledge = Pledges.findOne({_id: pledgeId})
    if (Roles.userIsInRole(this.userId, 'administrator', pledgeId) || Roles.userIsInRole(this.userId, 'admin') || pledge.creatorId === this.userId) {
      console.log(downloadUrl)
      this.unblock()
      if(this.userId)
      Pledges.update({_id: pledgeId}, {
        $set : {coverPhoto: downloadUrl}
      })
    }
  }
});

Meteor.methods({
  savePledge( pledge ) {
    check( pledge, Object );
    if (pledge.creatorId === this.userId || Roles.userIsInRole(this.userId, 'admin') || Roles.userIsInRole(this.userId, 'administrator', pledge._id)) {
    let pledgeId = pledge._id;
    Pledges.upsert( pledgeId, { $set: pledge } );
    Meteor.users.update({_id: this.userId}, {$addToSet: {committedPledges: pledgeId}})
    Roles.addUsersToRoles(this.userId, 'administrator', pledgeId)
  } else {
    throw new Meteor.Error(500, 'Error 500: Not found', 'you did not create this pledge')
  }
  }
});

Meteor.methods({
  findPledgeSlug(_id) {
    console.log(_id)
    return Pledges.findOne({_id: _id}).slug
  }
})

Meteor.methods({

  tagUserAsJustAdded(id, title) {
  if (this.userId)
  Meteor.users.update({_id: this.userId}, {
    $set: {
    justAddedPledge: true
  }
  })
}
})

Meteor.methods({
  removeJustAddedTag() {
    if (this.userId)
    Meteor.users.update({_id: this.userId}, {
      $set: {
      justAddedPledge: false
    }
    })
  }
})

let PledgeSchema = new SimpleSchema({
  "creator": {
    type: String,
    label: "The name of the creator of this pledge.",
    autoValue() {
      if (this.isInsert) {
      let user = Meteor.users.findOne({_id:this.userId});
      if (user) {
        return user.profile.name;
      }
      }
    }
  },
  "creatorPicture": {
    type: String,
    label: "The url for the picture of the creator.",
    autoValue() {
      if (this.isInsert) {
      let user = Meteor.users.findOne({_id:this.userId});
      if (user && user.profile.picture) {
        return user.profile.picture;
      } else {
        return '/images/favicon.ico'
      }
    }
    }
  },
  "creatorId" : {
    type: String,
    label: "The ID of the creator of this pledge.",
    autoValue() {
      if (this.isInsert) {
      return this.userId
    }
    }
  },
  "updated" : {
    type: String,
    label: 'This pledge was last updated on.',
    autoValue() {
      if (this.isInsert) {
      return( new Date().toISOString())
    }
    }
  },
  "title": {
    type: String,
    label: "The title of this pledge.",
    defaultValue: "Untitled Pledge"
  },
  "slug": {
    type: String,
    label: "The slug for this post.",
    autoValue() {
      if (this.isInsert) {
      let slug = this.value,
      existingSlugCount = Pledges.find({_id: {$ne: this.docId}, slug: slug}).count(),
      existingUntitled  = Pledges.find( { slug: { $regex: /untitled-pledge/i } } ).count();

      if (slug) {
        return existingSlugCount > 0 ? `${ slug }-${ existingSlugCount + 1 }` : slug;
      } else {
        return existingUntitled > 0 ? `untitled-pledge-${ existingUntitled + 1 }` : 'untitled-pledge';
      }
      }
    }
  },
  "content": {
    type: String,
    label: "The content of this pledge.",
    optional: true
  },
  "approved": {
    type: Boolean,
    label: "Is this pledge on the front page?",
    autoValue() {
        if (this.isInsert) {
        return false
      }
    }
  },
  "rejected": {
    type: Boolean,
    label: "Has this pledge been rejected?",
    optional: true
  },
  "stripe": {
    type: Object,
    blackbox: true,
    optional: true,
    label: "Details for stripe account"
  },
  "pledgeRoles": {
    type: [String],
    label: "User group names for this pledge",
    optional: true
  },
  "uploads": {
    type: [Object],
    blackbox: true,
    optional: true,
    label: 'User photo uploads'
  },
  "description": {
    type: String,
    label: "Pledge description",
    optional: true
  },
  "facebookURL" :{
    type: String,
    label: "Facebook Page URL",
    optional: true
  },
  "twitterURL": {
    type: String,
    label: "Twitter account URL",
    optional: true
  },
  "tags" : {
    type: [String],
    label: "The tags for this pledge",
    optional: true
  },
  "seenBy": {
    type: [String],
    label: "Messenger users who have seen this pledge",
    optional: true
  },
  "target": {
    type: Number,
    label: "Target number of people for this pledge.",
    optional: true
  },
  "impact": {
    type: String,
    label: "Total impact if this pledge's target is fulfilled.",
    optional: true
  },
  "summary": {
    type: String,
    label: "Overall summary of the pledge.",
    optional: true
  },
  "trelloListId": {
    type: String,
    label: "ID of the todo list in Trello",
    optional: true
  },
  "trelloBoardUrl": {
    type: String,
    label: "Short URL of board in trello",
    optional: true
  },
  "trelloAdminSet": {
    type: Boolean,
    label: "Has an admin user been set for this pledge",
    optional: true
  },
  "deadline": {
    type: Date,
    label: "The deadline for meeting the target number of people.",
    optional: true
  },
  "pledgedUsers": {
    type: [String],
    label: "The users who have signed up to this pledge",
    autoValue() {
      if (this.isInsert) {
        return([this.userId])
      }
    }
  },
  "pledgeCount": {
    type: Number,
    label: "The number of users signed up to the pledge",
    autoValue() {
      if (this.isInsert) {
        return 1
      }
    }
  },
  "coverPhoto": {
    type: String,
    label: "The cover photo for this pledge.",
    optional: true
  },
  "duration" : {
    type: String,
    label: "The duration of the pledge",
    optional: true
  },
  "completedEmailSent" : {
    type: Boolean,
    label: "Has an email been sent when completed?",
    optional: true
  },
  "details": {
    type: Object,
    label: "Extra details needed for the pledge",
    blackbox: true,
    optional: true
  }
});

Pledges.attachSchema(PledgeSchema)

var api_key = Meteor.settings.public.MailgunAPIKey;
var domain = 'allforone.io';
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});



function htmlString(pledge) {
  var newPledges = Pledges.find({title: {$ne: 'Untitled Pledge'}}, {sort: {updated: -1}}, {limit: 3}).fetch()
  newPledges = newPledges.slice(0,3)
  return(
 `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <!--[if IE]><html xmlns="http://www.w3.org/1999/xhtml" class="ie"><![endif]-->
      <!--[if !IE]><!-->
      <html xmlns="http://www.w3.org/1999/xhtml" style="line-height: inherit; margin: 0; padding: 0;" xmlns="http://www.w3.org/1999/xhtml"><!--<![endif]--><head>&#13;
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />&#13;
          <title></title>&#13;
          <!--[if !mso]><!--><meta http-equiv="X-UA-Compatible" content="IE=edge" /><!--<![endif]-->&#13;
          <meta name="viewport" content="width=device-width" />&#13;
          &#13;
          &#13;
        <!--[if !mso]><!--><!--<![endif]--><meta name="robots" content="noindex,nofollow" />&#13;
      <meta property="og:title" content="My First Campaign" />&#13;
      </head>&#13;
      <!--[if mso]>
        <body class="mso">
      <![endif]-->&#13;
      <!--[if !mso]><!-->&#13;
        <body class="no-padding" style="-webkit-text-size-adjust: 100%; line-height: inherit; background-color: #fff; margin: 0; padding: 0;" bgcolor="#fff"><style type="text/css">
      .wrapper .footer__share-button a:hover { color: #ffffff !important; }
      .wrapper .footer__share-button a:focus { color: #ffffff !important; }
      .btn a:hover { opacity: 0.8 !important; }
      .btn a:focus { opacity: 0.8 !important; }
      .footer__share-button a:hover { opacity: 0.8 !important; }
      .footer__share-button a:focus { opacity: 0.8 !important; }
      .email-footer__links a:hover { opacity: 0.8 !important; }
      .email-footer__links a:focus { opacity: 0.8 !important; }
      .logo a:hover { color: #859bb1 !important; }
      .logo a:focus { color: #859bb1 !important; }
      &gt;</style>&#13;
      <!--<![endif]-->&#13;
          <table class="wrapper" style="border-collapse: collapse; table-layout: fixed; min-width: 600px !important; width: 100%; line-height: inherit; background-color: #fff;" cellpadding="0" cellspacing="0" role="presentation" bgcolor="#fff"><tbody style="line-height: inherit;"><tr style="line-height: inherit;"><td style="line-height: inherit;">&#13;
            <div role="banner" style="line-height: inherit;">&#13;
              <div class="preheader" style="max-width: 560px !important; min-width: 280px; width: 560px !important; line-height: inherit; transition: width 0.25s ease-in-out, max-width 0.25s ease-in-out; -fallback-width: 90% !important; margin: 0 auto;">&#13;
                <div style="border-collapse: collapse; display: table; width: 100%; line-height: inherit;">&#13;
                <!--[if (mso)|(IE)]><table align="center" class="preheader" cellpadding="0" cellspacing="0" role="presentation"><tr><td style="width: 280px" valign="top"><![endif]-->&#13;
                  <div class="snippet" style="display: table-cell; float: none !important; font-size: 12px; line-height: 19px; max-width: 280px; min-width: 140px; width: 280px !important; color: #adb3b9; font-family: sans-serif; padding: 10px 0 5px;">&#13;
                    &#13;
                  </div>&#13;
                <!--[if (mso)|(IE)]></td><td style="width: 280px" valign="top"><![endif]-->&#13;
                  <div class="webversion" style="display: table-cell; float: none !important; font-size: 12px; line-height: 19px; max-width: 280px; min-width: 139px; width: 280px !important; text-align: right; color: #adb3b9; font-family: sans-serif; padding: 10px 0 5px;" align="right">&#13;
                    <p style="margin-top: 0; margin-bottom: 0; line-height: inherit;">No Images? <webversion style="text-decoration: underline; line-height: inherit;">Click here</webversion></p>&#13;
                  </div>&#13;
                <!--[if (mso)|(IE)]></td></tr></table><![endif]-->&#13;
                </div>&#13;
              </div>&#13;
              &#13;
            </div>&#13;
            <div role="section" style="line-height: inherit;">&#13;
            <div class="layout one-col fixed-width" style="max-width: 600px !important; min-width: 320px !important; width: 320px !important; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; line-height: inherit; transition: width 0.25s ease-in-out, max-width 0.25s ease-in-out; -fallback-width: 95% !important; margin: 0 auto;">&#13;
              <div class="layout__inner" style="border-collapse: collapse; display: table; width: 100%; line-height: inherit; background-color: #fff;">&#13;
              <!--[if (mso)|(IE)]><table align="center" cellpadding="0" cellspacing="0" role="presentation"><tr class="layout-fixed-width" style="background-color: #fff;"><td style="width: 600px" class="w560"><![endif]-->&#13;
                <div class="column" style="text-align: left; color: #8e959c; font-size: 14px; line-height: 21px; font-family: sans-serif; max-width: 600px !important; min-width: 320px !important; width: 600px !important; transition: width 0.25s ease-in-out, max-width 0.25s ease-in-out; display: table-cell; float: none !important; vertical-align: top;" align="left">&#13;
              &#13;
                  <div style="margin-left: 20px; margin-right: 20px; line-height: inherit;">&#13;
            <p class="size-20" style="margin-top: 0; margin-bottom: 0; font-family: roboto,tahoma,sans-serif; font-size: 20px !important; line-height: 28px !important; text-align: center;" lang="x-size-20" align="center" xml:lang="x-size-20"><span class="font-roboto" style="line-height: inherit;">ALL FOR ONE</span></p>&#13;
          </div>&#13;
              &#13;
                </div>&#13;
              <!--[if (mso)|(IE)]></td></tr></table><![endif]-->&#13;
              </div>&#13;
            </div>&#13;
        &#13;
            <div style="line-height: 20px; font-size: 20px;"> </div>&#13;
        &#13;
            <div class="layout one-col fixed-width" style="max-width: 600px !important; min-width: 320px !important; width: 320px !important; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; line-height: inherit; transition: width 0.25s ease-in-out, max-width 0.25s ease-in-out; -fallback-width: 95% !important; margin: 0 auto;">&#13;
              <div class="layout__inner" style="border-collapse: collapse; display: table; width: 100%; line-height: inherit; background-color: #fff;">&#13;
              <!--[if (mso)|(IE)]><table align="center" cellpadding="0" cellspacing="0" role="presentation"><tr class="layout-fixed-width" style="background-color: #fff;"><td style="width: 600px" class="w560"><![endif]-->&#13;
                <div class="column" style="text-align: left; color: #8e959c; font-size: 14px; line-height: 21px; font-family: sans-serif; max-width: 600px !important; min-width: 320px !important; width: 600px !important; transition: width 0.25s ease-in-out, max-width 0.25s ease-in-out; display: table-cell; float: none !important; vertical-align: top;" align="left">&#13;
              &#13;
              <div style="font-size: 12px; font-style: normal; font-weight: normal; line-height: inherit;" align="center">&#13;
                <img class="gnd-corner-image gnd-corner-image-center gnd-corner-image-top gnd-corner-image-bottom" style="display: block; height: auto; width: 100%; max-width: 900px; line-height: inherit; border: 0;" alt="" width="600" src="`+
                pledge.coverPhoto +

                `" />&#13;
              </div>&#13;
            &#13;
                </div>&#13;
              <!--[if (mso)|(IE)]></td></tr></table><![endif]-->&#13;
              </div>&#13;
            </div>&#13;
        &#13;
            <div style="line-height: 20px; font-size: 20px;"> </div>&#13;
        &#13;
            <div class="layout one-col fixed-width" style="max-width: 600px !important; min-width: 320px !important; width: 320px !important; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; line-height: inherit; transition: width 0.25s ease-in-out, max-width 0.25s ease-in-out; -fallback-width: 95% !important; margin: 0 auto;">&#13;
              <div class="layout__inner" style="border-collapse: collapse; display: table; width: 100%; line-height: inherit; background-color: #fff;">&#13;
              <!--[if (mso)|(IE)]><table align="center" cellpadding="0" cellspacing="0" role="presentation"><tr class="layout-fixed-width" style="background-color: #fff;"><td style="width: 600px" class="w560"><![endif]-->&#13;
                <div class="column" style="text-align: left; color: #8e959c; font-size: 14px; line-height: 21px; font-family: sans-serif; max-width: 600px !important; min-width: 320px !important; width: 600px !important; transition: width 0.25s ease-in-out, max-width 0.25s ease-in-out; display: table-cell; float: none !important; vertical-align: top;" align="left">&#13;
              &#13;
                  <div style="margin-left: 20px; margin-right: 20px; line-height: inherit;">&#13;
            <p class="size-28" style="margin-top: 0; margin-bottom: 0; font-family: roboto,tahoma,sans-serif; font-size: 28px !important; line-height: 36px !important; text-align: center;" lang="x-size-28" align="center" xml:lang="x-size-28"><span class="font-roboto" style="line-height: inherit;">Congratulations!</span></p><p class="size-28" style="margin-top: 20px; margin-bottom: 20px; font-family: roboto,tahoma,sans-serif; font-size: 28px !important; line-height: 36px !important; text-align: center;" lang="x-size-28" align="center" xml:lang="x-size-28"><span class="font-roboto" style="line-height: inherit;">Your pledge has reached its target.</span></p>&#13;
          </div>&#13;
              &#13;
                  <div style="margin-left: 20px; margin-right: 20px; line-height: inherit;">&#13;
            <div style="line-height: 20px; font-size: 1px;"> </div>&#13;
          </div>&#13;
              &#13;
                </div>&#13;
              <!--[if (mso)|(IE)]></td></tr></table><![endif]-->&#13;
              </div>&#13;
            </div>&#13;
        &#13;
            <div style="line-height: 20px; font-size: 20px;"> </div>&#13;
        &#13;
            <div class="layout one-col fixed-width" style="max-width: 600px !important; min-width: 320px !important; width: 320px !important; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; line-height: inherit; transition: width 0.25s ease-in-out, max-width 0.25s ease-in-out; -fallback-width: 95% !important; margin: 0 auto;">&#13;
              <div class="layout__inner" style="border-collapse: collapse; display: table; width: 100%; line-height: inherit; background-color: #fff;">&#13;
              <!--[if (mso)|(IE)]><table align="center" cellpadding="0" cellspacing="0" role="presentation"><tr class="layout-fixed-width" style="background-color: #fff;"><td style="width: 600px" class="w560"><![endif]-->&#13;
                <div class="column" style="text-align: left; color: #8e959c; font-size: 14px; line-height: 21px; font-family: sans-serif; max-width: 600px !important; min-width: 320px !important; width: 600px !important; transition: width 0.25s ease-in-out, max-width 0.25s ease-in-out; display: table-cell; float: none !important; vertical-align: top;" align="left">&#13;
              &#13;
                  <div style="margin-left: 20px; margin-right: 20px; line-height: inherit;">&#13;
            <p style="margin-top: 0; margin-bottom: 0; font-family: roboto,tahoma,sans-serif; line-height: inherit;"><span class="font-roboto" style="line-height: inherit;">Perhaps you could share your pledge?</span></p>&#13;
          </div>&#13;
              &#13;
                </div>&#13;
              <!--[if (mso)|(IE)]></td></tr></table><![endif]-->&#13;
              </div>&#13;
            </div>&#13;
        &#13;
            <div style="line-height: 20px; font-size: 20px;"> </div>&#13;
        &#13;
            <div class="layout one-col fixed-width" style="max-width: 600px !important; min-width: 320px !important; width: 320px !important; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; line-height: inherit; transition: width 0.25s ease-in-out, max-width 0.25s ease-in-out; -fallback-width: 95% !important; margin: 0 auto;">&#13;
              <div class="layout__inner" style="border-collapse: collapse; display: table; width: 100%; line-height: inherit; background-color: #fff;">&#13;
              <!--[if (mso)|(IE)]><table align="center" cellpadding="0" cellspacing="0" role="presentation"><tr class="layout-fixed-width" style="background-color: #fff;"><td style="width: 600px" class="w560"><![endif]-->&#13;
                <div class="column" style="text-align: left; color: #8e959c; font-size: 14px; line-height: 21px; font-family: sans-serif; max-width: 600px !important; min-width: 320px !important; width: 600px !important; transition: width 0.25s ease-in-out, max-width 0.25s ease-in-out; display: table-cell; float: none !important; vertical-align: top;" align="left">&#13;
              &#13;
                  <div style="margin-left: 20px; margin-right: 20px; line-height: inherit;">&#13;
            <div class="btn btn--flat btn--medium" style="margin-bottom: 20px; text-align: center; line-height: inherit;" align="center">&#13;
              <a style="border-radius: 4px; display: inline-block; font-size: 12px; font-weight: bold; line-height: 22px; text-align: center; text-decoration: none !important; transition: opacity 0.1s ease-in; color: #ffffff !important; font-family: Avenir, sans-serif; background-color: #FF9800; padding: 10px 20px;"
              href="https://www.allforone.io/pages/pledges/` +
              pledge.slug + '/' + pledge._id +
              `">Go to pledge</a>&#13;
            <!--[if mso]><p style="line-height:0;margin:0;">&nbsp;</p><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="http://www.example.com" style="width:114px" arcsize="10%" fillcolor="#FF9800" stroke="f"><v:textbox style="mso-fit-shape-to-text:t" inset="0px,9px,0px,9px"><center style="font-size:12px;line-height:22px;color:#FFFFFF;font-family:Avenir,sans-serif;font-weight:bold;mso-line-height-rule:exactly;mso-text-raise:4px">Go to pledge</center></v:textbox></v:roundrect><![endif]--></div>&#13;
          </div>&#13;
              &#13;
                  <div style="margin-left: 20px; margin-right: 20px; line-height: inherit;">&#13;
            <div style="line-height: 20px; font-size: 1px;"> </div>&#13;
          </div>&#13;
              &#13;
                </div>&#13;
              <!--[if (mso)|(IE)]></td></tr></table><![endif]-->&#13;
              </div>&#13;
            </div>&#13;
        &#13;
            <div style="line-height: 20px; font-size: 20px;"> </div>&#13;
        &#13;
            <div class="layout one-col fixed-width" style="max-width: 600px !important; min-width: 320px !important; width: 320px !important; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; line-height: inherit; transition: width 0.25s ease-in-out, max-width 0.25s ease-in-out; -fallback-width: 95% !important; margin: 0 auto;">&#13;
              <div class="layout__inner" style="border-collapse: collapse; display: table; width: 100%; line-height: inherit; background-color: #fff;">&#13;
              <!--[if (mso)|(IE)]><table align="center" cellpadding="0" cellspacing="0" role="presentation"><tr class="layout-fixed-width" style="background-color: #fff;"><td style="width: 600px" class="w560"><![endif]-->&#13;
                <div class="column" style="text-align: left; color: #8e959c; font-size: 14px; line-height: 21px; font-family: sans-serif; max-width: 600px !important; min-width: 320px !important; width: 600px !important; transition: width 0.25s ease-in-out, max-width 0.25s ease-in-out; display: table-cell; float: none !important; vertical-align: top;" align="left">&#13;
              &#13;
                  <div style="margin-left: 20px; margin-right: 20px; line-height: inherit;">&#13;
            <p style="margin-top: 0; margin-bottom: 0; line-height: inherit;">Maybe you want to check out some other new pledges?</p>&#13;
          </div>&#13;
              &#13;
                </div>&#13;
              <!--[if (mso)|(IE)]></td></tr></table><![endif]-->&#13;
              </div>&#13;
            </div>&#13;
        &#13;
            <div style="line-height: 20px; font-size: 20px;"> </div>&#13;
        &#13;
        <div class="layout fixed-width" style="max-width: 600px !important; min-width: 320px !important; width: 320px !important; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; line-height: inherit; transition: width 0.25s ease-in-out, max-width 0.25s ease-in-out; -fallback-width: 95% !important; margin: 0 auto;">&#13;
          <div class="layout__inner" style="border-collapse: collapse; display: table; width: 100%; line-height: inherit; background-color: #fff;">&#13;
          <!--[if (mso)|(IE)]><table align="center" cellpadding="0" cellspacing="0" role="presentation"><tr class="layout-fixed-width" style="background-color: #fff;"><td style="width: 200px" valign="top" class="w160"><![endif]-->&#13;
            <div class="column narrow" style="text-align: left; color: #8e959c; font-size: 14px; line-height: 21px; font-family: sans-serif; float: none !important; max-width: 200px !important; min-width: 320px !important; width: 200px !important; transition: width 0.25s ease-in-out, max-width 0.25s ease-in-out; display: table-cell; vertical-align: top;" align="left">&#13;
            &#13;
              <div style="margin-left: 20px; margin-right: 20px; line-height: inherit;">&#13;
          <div style="font-size: 12px; font-style: normal; font-weight: normal; line-height: inherit;" align="center">&#13;
            <img style="display: block; height: auto; width: 100%; max-width: 480px; line-height: inherit; border: 0;" alt="" width="160" src="` +
            newPledges[0].coverPhoto +
            `" />&#13;
          </div>&#13;
        </div>&#13;
            &#13;
            </div>&#13;
          <!--[if (mso)|(IE)]></td><td style="width: 400px" valign="top" class="w360"><![endif]-->&#13;
            <div class="column wide" style="text-align: left; color: #8e959c; font-size: 14px; line-height: 21px; font-family: sans-serif; float: none !important; max-width: 400px !important; min-width: 320px !important; width: 400px !important; transition: width 0.25s ease-in-out, max-width 0.25s ease-in-out; display: table-cell; vertical-align: top;" align="left">&#13;
            &#13;
              <div style="margin-left: 20px; margin-right: 20px; line-height: inherit;">&#13;
        <p style="margin-top: 0; margin-bottom: 0; font-family: roboto,tahoma,sans-serif; line-height: inherit;"><span class="font-roboto" style="line-height: inherit;"><strong style="line-height: inherit;">`
        + newPledges[0].title +
        `</strong></span></p><p style="margin-top: 20px; margin-bottom: 0; font-family: roboto,tahoma,sans-serif; line-height: inherit;"><span class="font-roboto" style="line-height: inherit;">Duration: ` +
        newPledges[0].duration +
        `</span></p>&#13;
      </div>&#13;
            &#13;
          <!--[if (mso)|(IE)]></td></tr></table><![endif]-->&#13;
          </div>&#13;
        </div>&#13;
    </div>&#13;

        <div style="line-height: 20px; font-size: 20px;"> </div>&#13;
    &#13;

        <div class="layout fixed-width" style="max-width: 600px !important; min-width: 320px !important; width: 320px !important; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; line-height: inherit; transition: width 0.25s ease-in-out, max-width 0.25s ease-in-out; -fallback-width: 95% !important; margin: 0 auto;">&#13;
          <div class="layout__inner" style="border-collapse: collapse; display: table; width: 100%; line-height: inherit; background-color: #fff;">&#13;
          <!--[if (mso)|(IE)]><table align="center" cellpadding="0" cellspacing="0" role="presentation"><tr class="layout-fixed-width" style="background-color: #fff;"><td style="width: 200px" valign="top" class="w160"><![endif]-->&#13;
            <div class="column narrow" style="text-align: left; color: #8e959c; font-size: 14px; line-height: 21px; font-family: sans-serif; float: none !important; max-width: 200px !important; min-width: 320px !important; width: 200px !important; transition: width 0.25s ease-in-out, max-width 0.25s ease-in-out; display: table-cell; vertical-align: top;" align="left">&#13;
            &#13;
              <div style="margin-left: 20px; margin-right: 20px; line-height: inherit;">&#13;
          <div style="font-size: 12px; font-style: normal; font-weight: normal; line-height: inherit;" align="center">&#13;
            <img style="display: block; height: auto; width: 100%; max-width: 480px; line-height: inherit; border: 0;" alt="" width="160" src="`
            + newPledges[1].coverPhoto +
            `" />&#13;
          </div>&#13;
        </div>&#13;
            &#13;
            </div>&#13;
          <!--[if (mso)|(IE)]></td><td style="width: 400px" valign="top" class="w360"><![endif]-->&#13;
            <div class="column wide" style="text-align: left; color: #8e959c; font-size: 14px; line-height: 21px; font-family: sans-serif; float: none !important; max-width: 400px !important; min-width: 320px !important; width: 400px !important; transition: width 0.25s ease-in-out, max-width 0.25s ease-in-out; display: table-cell; vertical-align: top;" align="left">&#13;
            &#13;
              <div style="margin-left: 20px; margin-right: 20px; line-height: inherit;">&#13;
        <p style="margin-top: 0; margin-bottom: 0; font-family: roboto,tahoma,sans-serif; line-height: inherit;"><span class="font-roboto" style="line-height: inherit;"><strong style="line-height: inherit;">`
        + newPledges[1].title +
        `</strong></span></p><p style="margin-top: 20px; margin-bottom: 0; font-family: roboto,tahoma,sans-serif; line-height: inherit;"><span class="font-roboto" style="line-height: inherit;">Duration: ` +
        newPledges[1].duration +
        `</span></p>&#13;
      </div>&#13;
            &#13;
          <!--[if (mso)|(IE)]></td></tr></table><![endif]-->&#13;
          </div>&#13;
        </div>&#13;
    </div>&#13;

    <div style="line-height: 20px; font-size: 20px;"> </div>&#13;
&#13;

        <div class="layout fixed-width" style="max-width: 600px !important; min-width: 320px !important; width: 320px !important; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; line-height: inherit; transition: width 0.25s ease-in-out, max-width 0.25s ease-in-out; -fallback-width: 95% !important; margin: 0 auto;">&#13;
          <div class="layout__inner" style="border-collapse: collapse; display: table; width: 100%; line-height: inherit; background-color: #fff;">&#13;
          <!--[if (mso)|(IE)]><table align="center" cellpadding="0" cellspacing="0" role="presentation"><tr class="layout-fixed-width" style="background-color: #fff;"><td style="width: 200px" valign="top" class="w160"><![endif]-->&#13;
            <div class="column narrow" style="text-align: left; color: #8e959c; font-size: 14px; line-height: 21px; font-family: sans-serif; float: none !important; max-width: 200px !important; min-width: 320px !important; width: 200px !important; transition: width 0.25s ease-in-out, max-width 0.25s ease-in-out; display: table-cell; vertical-align: top;" align="left">&#13;
            &#13;
              <div style="margin-left: 20px; margin-right: 20px; line-height: inherit;">&#13;
          <div style="font-size: 12px; font-style: normal; font-weight: normal; line-height: inherit;" align="center">&#13;
            <img style="display: block; height: auto; width: 100%; max-width: 480px; line-height: inherit; border: 0;" alt="" width="160" src="` +
            newPledges[2].coverPhoto +
            `" />&#13;
          </div>&#13;
        </div>&#13;
            &#13;
            </div>&#13;
          <!--[if (mso)|(IE)]></td><td style="width: 400px" valign="top" class="w360"><![endif]-->&#13;
            <div class="column wide" style="text-align: left; color: #8e959c; font-size: 14px; line-height: 21px; font-family: sans-serif; float: none !important; max-width: 400px !important; min-width: 320px !important; width: 400px !important; transition: width 0.25s ease-in-out, max-width 0.25s ease-in-out; display: table-cell; vertical-align: top;" align="left">&#13;
            &#13;
              <div style="margin-left: 20px; margin-right: 20px; line-height: inherit;">&#13;
        <p style="margin-top: 0; margin-bottom: 0; font-family: roboto,tahoma,sans-serif; line-height: inherit;"><span class="font-roboto" style="line-height: inherit;"><strong style="line-height: inherit;">`
        + newPledges[2].title +
        `</strong></span></p><p style="margin-top: 20px; margin-bottom: 0; font-family: roboto,tahoma,sans-serif; line-height: inherit;"><span class="font-roboto" style="line-height: inherit;">Duration: ` +
        newPledges[2].duration +
        `</span></p>&#13;
        </div>&#13;
            &#13;
          <!--[if (mso)|(IE)]></td></tr></table><![endif]-->&#13;
          </div>&#13;
        </div>&#13;
        </div>&#13;

            <div style="line-height: 20px; font-size: 20px;"> </div>&#13;
        &#13;
            &#13;
            <div role="contentinfo" style="line-height: inherit;">&#13;
              <div class="layout email-footer" style="max-width: 600px !important; min-width: 320px !important; width: 320px !important; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; line-height: inherit; transition: width 0.25s ease-in-out, max-width 0.25s ease-in-out; -fallback-width: 95% !important; margin: 0 auto;">&#13;
                <div class="layout__inner" style="border-collapse: collapse; display: table; width: 100%; line-height: inherit;">&#13;
                <!--[if (mso)|(IE)]><table align="center" cellpadding="0" cellspacing="0" role="presentation"><tr class="layout-email-footer"><td style="width: 400px;" valign="top" class="w360"><![endif]-->&#13;
                  <div class="column wide" style="text-align: left; font-size: 12px; line-height: 19px; color: #adb3b9; font-family: sans-serif; float: none !important; max-width: 400px !important; min-width: 320px !important; width: 400px !important; transition: width 0.25s ease-in-out, max-width 0.25s ease-in-out; display: table-cell; vertical-align: top;" align="left">&#13;
                    <div style="line-height: inherit; margin: 10px 20px;">&#13;
                      &#13;
                      <div style="font-size: 12px; line-height: 19px;">&#13;
                        <div style="line-height: inherit;">All For One</div>&#13;
                      </div>&#13;
                      <div style="font-size: 12px; line-height: 19px; margin-top: 18px;">&#13;
                        <div style="line-height: inherit;">You are receiving this because you subscribed to a pledge on All For One</div>&#13;
                      </div>&#13;
                      <!--[if mso]>&nbsp;<![endif]-->&#13;
                    </div>&#13;
                  </div>&#13;
                <!--[if (mso)|(IE)]></td><td style="width: 200px;" valign="top" class="w160"><![endif]-->&#13;
                  <div class="column narrow" style="text-align: left; font-size: 12px; line-height: 19px; color: #adb3b9; font-family: sans-serif; float: none !important; max-width: 200px !important; min-width: 320px !important; width: 200px !important; transition: width 0.25s ease-in-out, max-width 0.25s ease-in-out; display: table-cell; vertical-align: top;" align="left">&#13;
                    <div style="line-height: inherit; margin: 10px 20px;">&#13;
                      &#13;
                    </div>&#13;
                  </div>&#13;
                <!--[if (mso)|(IE)]></td></tr></table><![endif]-->&#13;
                </div>&#13;
              </div>&#13;
              <div class="layout one-col email-footer" style="max-width: 600px !important; min-width: 320px !important; width: 320px !important; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; line-height: inherit; transition: width 0.25s ease-in-out, max-width 0.25s ease-in-out; -fallback-width: 95% !important; margin: 0 auto;">&#13;
                <div class="layout__inner" style="border-collapse: collapse; display: table; width: 100%; line-height: inherit;">&#13;
                <!--[if (mso)|(IE)]><table align="center" cellpadding="0" cellspacing="0" role="presentation"><tr class="layout-email-footer"><td style="width: 600px;" class="w560"><![endif]-->&#13;
                  <div class="column" style="text-align: left; font-size: 12px; line-height: 19px; color: #adb3b9; font-family: sans-serif; max-width: 600px !important; min-width: 320px !important; width: 600px !important; transition: width 0.25s ease-in-out, max-width 0.25s ease-in-out; display: table-cell; float: none !important; vertical-align: top;" align="left">&#13;
                    <div style="line-height: inherit; margin: 10px 20px;">&#13;
                      <div style="font-size: 12px; line-height: 19px;">&#13;
                        <span style="line-height: inherit;"><preferences style="text-decoration: underline; line-height: inherit;" lang="en" xml:lang="en">Preferences</preferences>  |  </span><unsubscribe style="text-decoration: underline; line-height: inherit;">Unsubscribe</unsubscribe>&#13;
                      </div>&#13;
                    </div>&#13;
                  </div>&#13;
                <!--[if (mso)|(IE)]></td></tr></table><![endif]-->&#13;
                </div>&#13;
              </div>&#13;
            </div>&#13;
            <div style="line-height: 40px; font-size: 40px;"> </div>&#13;
          </div></td></tr></tbody></table>&#13;
        &#13;
      </body></html>
      `
    )
  }

Meteor.methods({
  'sendPledgeFullEmail' (recipients, pledge) {
    for (var i=0;i<recipients.length;i++) {

      var data = {
          from: 'Your Friendly Reminder Service <me@allforone.io>',
          to: recipients[i],
          subject: 'Nice one',
          html: htmlString(pledge),
          text: `No Images? Click here

                ALL FOR ONE

                Congratulations!

                Your pledge has reached its target.

                Perhaps you could share your pledge?

                Go to pledge ( http://www.example.com )

                Go to pledge

                Maybe you want to check out some other new pledges?

                This pledge here

                This is what the pledge is about

                All For One

                You are receiving this because you subscribed to
                a pledge on All For One

                Preferences | Unsubscribe`
        };

    try {
      mailgun.messages().send(data, function (error, body) {
        console.log(body);
      });
    } catch(err) {
      continue;
    }

  }
  }


})

function pledgeListHTML(pledgeList) {
  var sections = ''
  console.log(pledgeList)
   for (var id in pledgeList) {
     var pledge = Pledges.findOne({_id: pledgeList[id]})
    sections = sections.concat(`
      <a href=` + 'https://www.allforone.io/pages/pledges/' + pledge.slug + `/` + pledge._id + `
      <div class="layout fixed-width" style="max-width: 600px !important; min-width: 320px !important; width: 320px !important; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; line-height: inherit; transition: width 0.25s ease-in-out, max-width 0.25s ease-in-out; -fallback-width: 95% !important; margin: 0 auto;">&#13;
        <div class="layout__inner" style="border-collapse: collapse; display: table; width: 100%; line-height: inherit; background-color: #fff;">&#13;
        <!--[if (mso)|(IE)]><table align="center" cellpadding="0" cellspacing="0" role="presentation"><tr class="layout-fixed-width" style="background-color: #fff;"><td style="width: 200px" valign="top" class="w160"><![endif]-->&#13;
          <div class="column narrow" style="text-align: left; color: #8e959c; font-size: 14px; line-height: 21px; font-family: sans-serif; float: none !important; max-width: 200px !important; min-width: 320px !important; width: 200px !important; transition: width 0.25s ease-in-out, max-width 0.25s ease-in-out; display: table-cell; vertical-align: top;" align="left">&#13;
          &#13;
            <div style="margin-left: 20px; margin-right: 20px; line-height: inherit;">&#13;
        <div style="font-size: 12px; font-style: normal; font-weight: normal; line-height: inherit;" align="center">&#13;
          <img style="display: block; height: auto; width: 100%; max-width: 480px; line-height: inherit; border: 0;" alt="" width="160" src="` +
          pledge.coverPhoto
          + `" />&#13;
        </div>&#13;
      </div>&#13;
          &#13;
          </div>&#13;
        <!--[if (mso)|(IE)]></td><td style="width: 400px" valign="top" class="w360"><![endif]-->&#13;
          <div class="column wide" style="text-align: left; color: #8e959c; font-size: 14px; line-height: 21px; font-family: sans-serif; float: none !important; max-width: 400px !important; min-width: 320px !important; width: 400px !important; transition: width 0.25s ease-in-out, max-width 0.25s ease-in-out; display: table-cell; vertical-align: top;" align="left">&#13;
          &#13;
            <div style="margin-left: 20px; margin-right: 20px; line-height: inherit;">&#13;
      <p style="margin-top: 0; margin-bottom: 0; font-family: roboto,tahoma,sans-serif; line-height: inherit;"><span class="font-roboto" style="line-height: inherit;"><strong style="line-height: inherit;">`
      + pledge.title +
      `</strong></span></p><p style="margin-top: 20px; margin-bottom: 0; font-family: roboto,tahoma,sans-serif; line-height: inherit;"><span class="font-roboto" style="line-height: inherit;">Duration: ` +
      pledge.duration +
      `</span></p><p style="margin-top: 20px; margin-bottom: 0; font-family: roboto,tahoma,sans-serif; line-height: inherit;"><span class="font-roboto" style="line-height: inherit;"><strong style="line-height: inherit;">Signups:</strong> ` +
      pledge.pledgedUsers.length + ' out of ' + pledge.target +
      `</span></p>&#13;
    </div>&#13;
          &#13;
        <!--[if (mso)|(IE)]></td></tr></table><![endif]-->&#13;
        </div>&#13;
      </div>&#13;
  </div>&#13;
  </a>
  <div style="line-height: 20px; font-size: 20px;"> </div>&#13;

      `)
  }
  console.log(sections)
  return (
    `
            <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <!--[if IE]><html xmlns="http://www.w3.org/1999/xhtml" class="ie"><![endif]-->
        <!--[if !IE]><!-->
        <html xmlns="http://www.w3.org/1999/xhtml" style="line-height: inherit; margin: 0; padding: 0;" xmlns="http://www.w3.org/1999/xhtml"><!--<![endif]--><head>&#13;
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />&#13;
            <title></title>&#13;
            <!--[if !mso]><!--><meta http-equiv="X-UA-Compatible" content="IE=edge" /><!--<![endif]-->&#13;
            <meta name="viewport" content="width=device-width" />&#13;
            &#13;
            &#13;
          <!--[if !mso]><!--><!--<![endif]--><meta name="robots" content="noindex,nofollow" />&#13;
        <meta property="og:title" content="My First Campaign" />&#13;
        </head>&#13;
        <!--[if mso]>
          <body class="mso">
        <![endif]-->&#13;
        <!--[if !mso]><!-->&#13;
          <body class="no-padding" style="-webkit-text-size-adjust: 100%; line-height: inherit; background-color: #fff; margin: 0; padding: 0;" bgcolor="#fff"><style type="text/css">
        .wrapper .footer__share-button a:hover { color: #ffffff !important; }
        .wrapper .footer__share-button a:focus { color: #ffffff !important; }
        .btn a:hover { opacity: 0.8 !important; }
        .btn a:focus { opacity: 0.8 !important; }
        .footer__share-button a:hover { opacity: 0.8 !important; }
        .footer__share-button a:focus { opacity: 0.8 !important; }
        .email-footer__links a:hover { opacity: 0.8 !important; }
        .email-footer__links a:focus { opacity: 0.8 !important; }
        .logo a:hover { color: #859bb1 !important; }
        .logo a:focus { color: #859bb1 !important; }
        &gt;</style>&#13;
        <!--<![endif]-->&#13;
            <table class="wrapper" style="border-collapse: collapse; table-layout: fixed; min-width: 600px !important; width: 100%; line-height: inherit; background-color: #fff;" cellpadding="0" cellspacing="0" role="presentation" bgcolor="#fff"><tbody style="line-height: inherit;"><tr style="line-height: inherit;"><td style="line-height: inherit;">&#13;
              <div role="banner" style="line-height: inherit;">&#13;
                <div class="preheader" style="max-width: 560px !important; min-width: 280px; width: 560px !important; line-height: inherit; transition: width 0.25s ease-in-out, max-width 0.25s ease-in-out; -fallback-width: 90% !important; margin: 0 auto;">&#13;
                  <div style="border-collapse: collapse; display: table; width: 100%; line-height: inherit;">&#13;
                  <!--[if (mso)|(IE)]><table align="center" class="preheader" cellpadding="0" cellspacing="0" role="presentation"><tr><td style="width: 280px" valign="top"><![endif]-->&#13;
                    <div class="snippet" style="display: table-cell; float: none !important; font-size: 12px; line-height: 19px; max-width: 280px; min-width: 140px; width: 280px !important; color: #adb3b9; font-family: sans-serif; padding: 10px 0 5px;">&#13;
                      &#13;
                    </div>&#13;
                  <!--[if (mso)|(IE)]></td><td style="width: 280px" valign="top"><![endif]-->&#13;
                    <div class="webversion" style="display: table-cell; float: none !important; font-size: 12px; line-height: 19px; max-width: 280px; min-width: 139px; width: 280px !important; text-align: right; color: #adb3b9; font-family: sans-serif; padding: 10px 0 5px;" align="right">&#13;
                      <p style="margin-top: 0; margin-bottom: 0; line-height: inherit;">No Images? <webversion style="text-decoration: underline; line-height: inherit;">Click here</webversion></p>&#13;
                    </div>&#13;
                  <!--[if (mso)|(IE)]></td></tr></table><![endif]-->&#13;
                  </div>&#13;
                </div>&#13;
                &#13;
              </div>&#13;
              <div role="section" style="line-height: inherit;">&#13;
              <div class="layout one-col fixed-width" style="max-width: 600px !important; min-width: 320px !important; width: 320px !important; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; line-height: inherit; transition: width 0.25s ease-in-out, max-width 0.25s ease-in-out; -fallback-width: 95% !important; margin: 0 auto;">&#13;
                <div class="layout__inner" style="border-collapse: collapse; display: table; width: 100%; line-height: inherit; background-color: #fff;">&#13;
                <!--[if (mso)|(IE)]><table align="center" cellpadding="0" cellspacing="0" role="presentation"><tr class="layout-fixed-width" style="background-color: #fff;"><td style="width: 600px" class="w560"><![endif]-->&#13;
                  <div class="column" style="text-align: left; color: #8e959c; font-size: 14px; line-height: 21px; font-family: sans-serif; max-width: 600px !important; min-width: 320px !important; width: 600px !important; transition: width 0.25s ease-in-out, max-width 0.25s ease-in-out; display: table-cell; float: none !important; vertical-align: top;" align="left">&#13;
                &#13;
                    <div style="margin-left: 20px; margin-right: 20px; line-height: inherit;">&#13;
              <p class="size-20" style="margin-top: 0; margin-bottom: 0; font-family: roboto,tahoma,sans-serif; font-size: 20px !important; line-height: 28px !important; text-align: center;" lang="x-size-20" align="center" xml:lang="x-size-20"><span class="font-roboto" style="line-height: inherit;">ALL FOR ONE</span></p>&#13;
            </div>&#13;
                &#13;
                  </div>&#13;
                <!--[if (mso)|(IE)]></td></tr></table><![endif]-->&#13;
                </div>&#13;
              </div>&#13;
          &#13;
              <div style="line-height: 20px; font-size: 20px;"> </div>&#13;
          &#13;
              <div class="layout one-col fixed-width" style="max-width: 600px !important; min-width: 320px !important; width: 320px !important; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; line-height: inherit; transition: width 0.25s ease-in-out, max-width 0.25s ease-in-out; -fallback-width: 95% !important; margin: 0 auto;">&#13;
                <div class="layout__inner" style="border-collapse: collapse; display: table; width: 100%; line-height: inherit; background-color: #fff;">&#13;
                <!--[if (mso)|(IE)]><table align="center" cellpadding="0" cellspacing="0" role="presentation"><tr class="layout-fixed-width" style="background-color: #fff;"><td style="width: 600px" class="w560"><![endif]-->&#13;
                  <div class="column" style="text-align: left; color: #8e959c; font-size: 14px; line-height: 21px; font-family: sans-serif; max-width: 600px !important; min-width: 320px !important; width: 600px !important; transition: width 0.25s ease-in-out, max-width 0.25s ease-in-out; display: table-cell; float: none !important; vertical-align: top;" align="left">&#13;
                &#13;
                    <div style="margin-left: 20px; margin-right: 20px; line-height: inherit;">&#13;
              <p class="size-28" style="margin-top: 0; margin-bottom: 20px; font-family: roboto,tahoma,sans-serif; font-size: 28px !important; line-height: 36px !important; text-align: center;" lang="x-size-28" align="center" xml:lang="x-size-28"><span class="font-roboto" style="line-height: inherit;">We've got some new pledges for you</span></p>&#13;
            </div>&#13;
                &#13;
                    <div style="margin-left: 20px; margin-right: 20px; line-height: inherit;">&#13;
              <div style="line-height: 8px; font-size: 1px;"> </div>&#13;
            </div>&#13;
                &#13;
                  </div>&#13;
                <!--[if (mso)|(IE)]></td></tr></table><![endif]-->&#13;
                </div>&#13;
              </div>&#13;
          &#13;
              <div style="line-height: 20px; font-size: 20px;"> </div>&#13;
          &#13;

          ` + sections +
      `
          &#13;
              &#13;
              <div role="contentinfo" style="line-height: inherit;">&#13;
                <div class="layout email-footer" style="max-width: 600px !important; min-width: 320px !important; width: 320px !important; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; line-height: inherit; transition: width 0.25s ease-in-out, max-width 0.25s ease-in-out; -fallback-width: 95% !important; margin: 0 auto;">&#13;
                  <div class="layout__inner" style="border-collapse: collapse; display: table; width: 100%; line-height: inherit;">&#13;
                  <!--[if (mso)|(IE)]><table align="center" cellpadding="0" cellspacing="0" role="presentation"><tr class="layout-email-footer"><td style="width: 400px;" valign="top" class="w360"><![endif]-->&#13;
                    <div class="column wide" style="text-align: left; font-size: 12px; line-height: 19px; color: #adb3b9; font-family: sans-serif; float: none !important; max-width: 400px !important; min-width: 320px !important; width: 400px !important; transition: width 0.25s ease-in-out, max-width 0.25s ease-in-out; display: table-cell; vertical-align: top;" align="left">&#13;
                      <div style="line-height: inherit; margin: 10px 20px;">&#13;
                        &#13;
                        <div style="font-size: 12px; line-height: 19px;">&#13;
                          <div style="line-height: inherit;">All For One</div>&#13;
                        </div>&#13;
                        <div style="font-size: 12px; line-height: 19px; margin-top: 18px;">&#13;
                          <div style="line-height: inherit;">You're receiving this because you subscribed to a pledge on All For One</div>&#13;
                        </div>&#13;
                        <!--[if mso]>&nbsp;<![endif]-->&#13;
                      </div>&#13;
                    </div>&#13;
                  <!--[if (mso)|(IE)]></td><td style="width: 200px;" valign="top" class="w160"><![endif]-->&#13;
                    <div class="column narrow" style="text-align: left; font-size: 12px; line-height: 19px; color: #adb3b9; font-family: sans-serif; float: none !important; max-width: 200px !important; min-width: 320px !important; width: 200px !important; transition: width 0.25s ease-in-out, max-width 0.25s ease-in-out; display: table-cell; vertical-align: top;" align="left">&#13;
                      <div style="line-height: inherit; margin: 10px 20px;">&#13;
                        &#13;
                      </div>&#13;
                    </div>&#13;
                  <!--[if (mso)|(IE)]></td></tr></table><![endif]-->&#13;
                  </div>&#13;
                </div>&#13;
                <div class="layout one-col email-footer" style="max-width: 600px !important; min-width: 320px !important; width: 320px !important; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; line-height: inherit; transition: width 0.25s ease-in-out, max-width 0.25s ease-in-out; -fallback-width: 95% !important; margin: 0 auto;">&#13;
                  <div class="layout__inner" style="border-collapse: collapse; display: table; width: 100%; line-height: inherit;">&#13;
                  <!--[if (mso)|(IE)]><table align="center" cellpadding="0" cellspacing="0" role="presentation"><tr class="layout-email-footer"><td style="width: 600px;" class="w560"><![endif]-->&#13;
                    <div class="column" style="text-align: left; font-size: 12px; line-height: 19px; color: #adb3b9; font-family: sans-serif; max-width: 600px !important; min-width: 320px !important; width: 600px !important; transition: width 0.25s ease-in-out, max-width 0.25s ease-in-out; display: table-cell; float: none !important; vertical-align: top;" align="left">&#13;
                      <div style="line-height: inherit; margin: 10px 20px;">&#13;
                        <div style="font-size: 12px; line-height: 19px;">&#13;
                          <span style="line-height: inherit;"><preferences style="text-decoration: underline; line-height: inherit;" lang="en" xml:lang="en">Preferences</preferences>  |  </span><unsubscribe style="text-decoration: underline; line-height: inherit;">Unsubscribe</unsubscribe>&#13;
                        </div>&#13;
                      </div>&#13;
                    </div>&#13;
                  <!--[if (mso)|(IE)]></td></tr></table><![endif]-->&#13;
                  </div>&#13;
                </div>&#13;
              </div>&#13;
              <div style="line-height: 40px; font-size: 40px;"> </div>&#13;
            </div></td></tr></tbody></table>&#13;
          &#13;
        </body></html>
    `
  )
}

Meteor.methods({
  'sendMorePledgesEmail' (pledgeList) {
    this.unblock()
    console.log(pledgeList)
    var emailList = []
    for (var i in Meteor.users.find().fetch()) {
      var user = Meteor.users.find().fetch()[i]
        if (user.services && user.services.facebook && user.services.facebook.email) {
        emailList.push(user.services.facebook.email)
      }
    }
    emailList.push('tom@idleitems.com')
    console.log(emailList)



  for (var i=0;i<emailList.length;i++) {
    var data = {
        from: 'All For One <noreply@allforone.io>',
        to: emailList[i],
        subject: 'How else can you help the planet?',
        html: pledgeListHTML(pledgeList),
        text: `No Images? Click here

              ALL FOR ONE

              We've got some new pledges for you

              This pledge here

              This is what the pledge is about

              Signups: 1 out of 100

              This pledge here

              This is what the pledge is about

              Signups: 1 out of 100

              All For One

              You're receiving this because you subscribed to
              a pledge on All For One

              Preferences | Unsubscribe`
      };


    try {
      mailgun.messages().send(data, function (error, body) {

      });
    } catch(err) {
      continue;
    }
  }
}

})

Meteor.methods({
  'assignPledgeToUser'( _id, title) {
    console.log('Is this working?')
    this.unblock()

    if (this.userId) {
      var user = Meteor.users.findOne({_id: this.userId})
      if (Pledges.findOne({_id: _id}).pledgedUsers  &&
        !Pledges.findOne({_id: _id}).pledgedUsers.includes(user._id)) {
      Pledges.update({_id: _id}, {
        $push: {
          pledgedUsers: user._id
        }
      }, {
        $inc : {
          pledgeCount: 1
        }
      });
    }



    if (
      Meteor.users.findOne({_id: this.userId}).committedPledges === undefined ||
      (Meteor.users.findOne({_id: this.userId}).committedPledges &&
    Meteor.users.findOne({_id: this.userId}).committedPledges.filter(x => x._id === _id).length === 0)) {
      Meteor.users.update({_id: this.userId}, {
        $push: {
          committedPledges: {
            title: title,
            _id: _id
          }
        }
      })
    }




    var emailList = ''
    var pledge = Pledges.findOne({_id: _id})
    if (pledge.pledgedUsers.length >= pledge.target) {
      for (var i in pledge.pledgedUsers) {
        var user = Meteor.users.findOne({_id: pledge.pledgedUsers[i]})
        if (user.profile.email) {
          emailList = emailList.concat(user.profile.email + ', ')
        }
        else if (user.services && user.services.facebook && user.services.facebook.email) {
          emailList = emailList.concat(user.services.facebook.email + ', ')
        }
      }
      emailList = emailList.concat('tom@idleitems.com')



      console.log(emailList)
      if (!pledge.completedEmailSent) {

        for (var i in pledge.pledgedUsers) {
          var user = Meteor.users.findOne({_id: pledge.pledgedUsers[i]})
          var recipientId = user.userMessengerId
          if (recipientId) {
            Meteor.call('sendPledgeFinishedMessage', recipientId, 'Your pledge has reached its target!', pledge.title, pledge.coverPhoto ? pledge.coverPhoto : 'https://www.allforone.io/images/splash.jpg',
            'https://www.allforone.io/pages/pledges/' + pledge.slug +'/' + pledge._id)
          }
        }

        Meteor.call('sendPledgeFullEmail', emailList, pledge)
    }
      Pledges.update({_id: _id}, {$set: {
        completedEmailSent: true
      }})
    }


  }
  }


});

Meteor.methods({
  'unpledgeFromPledge' (_id, title) {
    this.unblock()

    if (this.userId) {
      var user = Meteor.users.findOne({_id: this.userId})
      Pledges.update({_id: _id}, {
        $pull: {
          pledgedUsers: user._id
        }
      }, {
        $inc: {
          pledgeCount: -1
        }
      });

      Meteor.users.update({_id: this.userId}, {
        $pull : {
          committedPledges : {
            _id: _id
          }
        }
      })
    }
  }
})

Meteor.methods({
  'deletePledge' (_id) {
    if (this.userId) {
      var pledge = Pledges.findOne({_id: _id})
      if (pledge.creatorId === this.userId || Roles.userIsInRole(this.userId, 'admin') || Roles.userIsInRole(this.userId, 'administrator', pledge._id)) {
        committedUsers = pledge.pledgedUsers
        for (var index in committedUsers) {
          let user = Meteor.users.findOne({_id: committedUsers[index]})
          Meteor.users.update({_id: committedUsers[index]}, {
            $pull : {
              "committedPledges": pledge._id
            }
          })
        }
        Pledges.remove({_id: _id})
      }
    }
  }
})
