import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Reviews } from '/imports/api/reviews.js';
import { Pledges } from '/imports/api/pledges.js';

if (Meteor.isServer) {
  Meteor.publish("pledgeReviews", function (pledgeId) {
    return Reviews.find({pledgeId: pledgeId, type: 'volunteer'})
  });

  Meteor.publish("userReviews", function (userId) {
    return Reviews.find({userId: userId})
  });

  Meteor.publish("orgReviews", function (userId) {
    return Reviews.find({userId: userId, type: 'organiser'})
  });
}

Meteor.methods({
  submitReview: function(doc, id, pledgeId, type) {
    var user = Meteor.users.findOne({_id: this.userId})
    var pledge = Pledges.findOne({_id: pledgeId})
    console.log(type)
    console.log(id)
    if (type === 'volunteer' && Roles.userIsInRole(id, ['admin', 'administrator'], pledgeId) ) {
      Reviews.upsert({userId: id, pledgeId: pledgeId, type: type}, {$set: {
        rating: doc.rating,
        review: doc.review,
        reviewerId: this.userId,
        reviewerName: user.profile.name,
        reviewerPicture: user.profile.picture,
        type: type
      }})
    } else if (type == 'organiser' && pledge.pledgedUsers.includes(this.userId)) {
      Reviews.upsert({userId: id, pledgeId: pledgeId, type: type}, {$set: {
        rating: doc.rating,
        review: doc.review,
        reviewerId: this.userId,
        reviewerName: user.profile.name,
        reviewerPicture: user.profile.picture,
        type: type
      }})
    } else {
      console.log('error')
      throw new Meteor.Error("noPermission", "You need to be a member of this pledge to leave a review")
    }
  }
})
