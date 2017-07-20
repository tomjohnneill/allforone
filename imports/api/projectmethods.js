import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Pledges } from '/imports/api/pledges.js';
import { Projects } from '/imports/api/projects.js';
import { PledgeVisits } from '/imports/api/pledges.js';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';

if (Meteor.isServer) {
  Meteor.publish("pledgeProjects", function (pledgeId) {
    return Projects.find({pledgeId: pledgeId})
  });

  Meteor.publish("allProjects", function() {
    return Projects.find({})
  })
}

Meteor.methods({
  setToDoListTrelloID: function(listId) {
    Pledges.update({_id: 'Wo5oJMvaNzLS5bcEh'}, {$set: {
      trelloListId: listId
    }})
  }
})


Meteor.methods({
  addTask: function(pledgeId, skills, name, trelloId) {
    Projects.upsert({pledgeId: pledgeId, trelloId: trelloId}, {$set: {
      skills: skills,
      task: name
    }})
  }
})

/*
SyncedCron.add({
  name: 'Look through Trello for new to dos',
  schedule: function(parser) {
    // parser is a later.parse object
    return parser.text('every 12 hours');
  },
  job: function() {
    var numbersCrunched = CrushSomeNumbers();
    return numbersCrunched;
  }
});
*/

Meteor.methods({
  addBoardUrl: function(pledgeId, url) {
    Pledges.update({_id: pledgeId}, {$set: {
      trelloBoardUrl: url
    }})
  }
})

Meteor.methods({
  addSkillToUser: function(text) {
    Meteor.users.update({_id: this.userId}, {$addToSet: {
      skills: text
    }})
  }


})

Meteor.methods({
  removeSkill: function(text) {
    Meteor.users.update({_id: this.userId}, {$pull: {
      skills: text
    }})
  }
})

Meteor.methods({
  addUserAsTrelloAdmin: function(pledgeId, url) {
    Pledges.update({_id: pledgeId}, {$set: {
      trelloAdminSet: true
    }})
  }
})
