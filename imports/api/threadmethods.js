import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Threads } from '/imports/api/threads.js';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';

if (Meteor.isServer) {
  Meteor.publish("threadEditor", function (_id) {
    return Threads.find({_id: _id})
  });

  Meteor.publish("threadList", function () {
    return Threads.find({})
  });

  Meteor.publish("pledgeThreadList", function() {
    if (this.userId) {
      var userPledgeList = Meteor.users.findOne({_id: this.userId}).committedPledges.map(function(a) {return a._id;})
      return Threads.find({pledge: {$in : userPledgeList} })
    }
  })

  Meteor.publish("threadComments", function() {
    if (this.userId) {
      return Threads.find({}, {fields: {_id: 1, comments: 1, creator: 1, creatorId:1}})
    }
  })
}

Threads.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

Meteor.methods({
  newThread(pledgeId) {
    this.unblock()
    console.log(pledgeId)
    if (pledgeId === '') {
    return Threads.insert( {} );
  } else {
    return Threads.insert({pledge: pledgeId})
  }
  }
});

Meteor.methods({
  saveThread( thread ) {
    check( thread, Object );
    if (thread.creatorId === this.userId) {
    let threadId = thread._id;

    Threads.upsert( threadId, { $set: thread } );
  } else {
    throw new Meteor.Error(500, 'Error 500: Not found', 'you did not create this thread')
  }
  }
});

Meteor.methods({
  addComment( comment, threadId ) {
    check( comment,  String );
    let user = Meteor.users.findOne({_id: this.userId})
    console.log(comment)
      var  content = comment;
      var creatorId = this.userId;
      var  creatorPicture= user.profile.picture;
      var  creator= user.profile.name

    let thread = Threads.findOne({_id: threadId})

    Threads.update( {_id: threadId}, { $push: {comments: {content: content,
      creatorId: creatorId,
      creatorPicture: creatorPicture,
      creator: creator,
      whenAdded: new Date()
          } }} );

    if (!user.subscribedThreads || !user.subscribedThreads.includes(threadId)) {
    Meteor.users.update({_id: this.userId}, {$push: {
      subscribedThreads: threadId
    }})
  }

  }
});

Meteor.methods({
  addPictureComment( picture, threadId ) {
    check( picture,  String );
    let user = Meteor.users.findOne({_id: this.userId})
      var  picture = picture;
      var creatorId = this.userId;
      var  creatorPicture= user.profile.picture;
      var  creator= user.profile.name

    let thread = Threads.findOne({_id: threadId})

    Threads.update( {_id: threadId}, { $push: {comments: {picture: picture,
      creatorId: creatorId,
      creatorPicture: creatorPicture,
      creator: creator,
      whenAdded: new Date ()
          } }} );

    if (!user.subscribedThreads || !user.subscribedThreads.includes(threadId)) {
    Meteor.users.update({_id: this.userId}, {$push: {
      subscribedThreads: threadId
    }})
  }
  }
});

Meteor.methods({
  findThreadSlug(_id) {
    console.log(_id)
    return Threads.findOne({_id: _id}).slug
  }
})

let ThreadSchema = new SimpleSchema({
  "creator": {
    type: String,
    label: "The creator of this thread.",
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
    label: "The ID of the creator of this thread.",
    autoValue() {
      if (this.isInsert) {
      return this.userId
    }
    }
  },
  "updated" : {
    type: String,
    label: 'This thread was last updated on.',
    autoValue() {

      return( new Date().toISOString())

    }
  },
  "title": {
    type: String,
    label: "The title of this thread.",
    defaultValue: "Untitled thread"
  },
  "slug": {
    type: String,
    label: "The slug for this post.",
    autoValue() {
      let slug = this.value,
      existingSlugCount = Threads.find({_id: {$ne: this.docId}, slug: slug}).count(),
      existingUntitled  = Threads.find( { slug: { $regex: /untitled-thread/i } } ).count();

      if (slug) {
        return existingSlugCount > 0 ? `${ slug }-${ existingSlugCount + 1 }` : slug;
      } else {
        return existingUntitled > 0 ? `untitled-thread-${ existingUntitled + 1 }` : 'untitled-thread';
      }
      }
  },
  "content": {
    type: String,
    label: "The content of this thread.",
    optional: true
  },
  "tags" : {
    type: [String],
    label: "The tags for this thread",
    optional: true
  },
  "comments": {
    type: [Object],
    label: "The comments on this thread.",
    optional: true,
    blackbox: true
  },

  "pledge": {
    type: String,
    label: "The pledge this thread is attached to.",
    optional: true
  }

});

Threads.attachSchema(ThreadSchema)
