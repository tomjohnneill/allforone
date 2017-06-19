import { Meteor } from 'meteor/meteor';
import { Pledges } from '../imports/api/pledges.js';
import { Threads } from '../imports/api/threads.js';
import { ServiceConfiguration } from 'meteor/service-configuration';
import '../imports/api/pledgemethods.js';
import '../imports/api/usermethods.js';
import '../imports/api/threadmethods.js';
import '../imports/api/alertmethods.js';

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
