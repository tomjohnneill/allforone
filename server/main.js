import { Meteor } from 'meteor/meteor';
import { Pledges } from '../imports/api/pledges.js';
import { Threads } from '../imports/api/threads.js';
import { Interests } from '../imports/api/interests.js';
import { Events } from '../imports/api/events.js';
import { Meetups } from '../imports/api/meetups.js';
import { Projects } from '../imports/api/projects.js';
import { Contributions } from '../imports/api/contributions.js';
import { Suggestions } from '/imports/api/suggestions.js';
import { ServiceConfiguration } from 'meteor/service-configuration';
import '../imports/api/pledgemethods.js';
import '../imports/api/usermethods.js';
import '../imports/api/threadmethods.js';
import '../imports/api/alertmethods.js';
import '../imports/api/interestmethods.js';
import '../imports/api/projectmethods.js';

Meteor.startup(() => {


  ServiceConfiguration.configurations.remove(
    {service: 'facebook'}
  );

  ServiceConfiguration.configurations.upsert(
    { service: 'facebook' },
    {
      $set: {
        appId: Meteor.settings.public.FacebookAppId,
        loginStyle: 'redirect',
        secret: Meteor.settings.public.FacebookSecret,
      },
    }
  );
});
