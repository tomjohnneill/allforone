import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Reviews } from '/imports/api/reviews.js';

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

    Reviews.upsert({userId: id, pledgeId: pledgeId, type: type}, {$set: {
      rating: doc.rating,
      review: doc.review,
      reviewerId: this.userId,
      reviewerName: user.profile.name,
      reviewerPicture: user.profile.picture,
      type: type
    }})
  }
})
