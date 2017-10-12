import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

Meteor.methods({
  createDifferentImageSizes : function(image) {
    this.unblock()
    try {
        var res = request.sync(image);
        if (res.response.statusCode == 200) {
            console.log(res.body);
        }
    } catch (error) {
        // See below for info on errors
    }
  }
})
