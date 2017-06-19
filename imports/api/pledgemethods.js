import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Pledges } from '/imports/api/pledges.js';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';

if (Meteor.isServer) {
  Meteor.publish("editor", function (_id) {
    return Pledges.find({_id: _id})
  });

  Meteor.publish("pledgeList", function () {
    return Pledges.find({}
    , {fields: {_id : 1, title: 1, slug : 1, creatorPicture : 1, target : 1, pledgedUsers : 1
      , pledgeCount: 1, coverPhoto: 1, creatorId: 1, duration: 1, deadline: 1}}
    )
  })

  Meteor.publish("myPledges", function() {
    return Pledges.find({pledgedUsers: this.userId}
      , {fields: {_id : 1, title: 1, slug : 1, creatorPicture : 1, target : 1, pledgedUsers : 1, pledgeCount: 1
      , duration : 1, creatorId: 1, deadline: 1, creator: 1}}
      )
  })

  Meteor.publish("myCreatedPledges", function() {
    return Pledges.find({creatorId: this.userId})
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
    console.log(downloadUrl)
    this.unblock()
    if(this.userId)
    Pledges.update({_id: pledgeId}, {
      $set : {coverPhoto: downloadUrl}
    })
  }
});

Meteor.methods({
  savePledge( pledge ) {
    check( pledge, Object );
    if (pledge.creatorId === this.userId) {
    let pledgeId = pledge._id;
    Pledges.upsert( pledgeId, { $set: pledge } );
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
    label: "The ID of the creator of this pledge.",
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
      if (user) {
        return user.profile.picture;
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
  "what": {
    type: String,
    label: "The what of this pledge.",
    optional: true
  },
  "why": {
    type: String,
    label: "The why of this pledge.",
    optional: true
  },
  "how": {
    type: String,
    label: "The how of this pledge.",
    optional: true
  },
  "tags" : {
    type: [String],
    label: "The tags for this pledge",
    optional: true
  },
  "target": {
    type: Number,
    label: "Target number of people for this pledge.",
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
  }
});

Pledges.attachSchema(PledgeSchema)

Meteor.methods({
  'assignPledgeToUser'( _id, title) {
    console.log('Is this working?')
    this.unblock()

    if (this.userId) {
      var user = Meteor.users.findOne({_id: this.userId})
      console.log(user)
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
      pledge = Pledges.findOne({_id: _id})
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
})
