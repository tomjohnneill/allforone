import { Meteor } from 'meteor/meteor';
import { Pledges } from '../imports/api/pledges.js';
import { Reviews } from '../imports/api/reviews.js';
import { Threads } from '../imports/api/threads.js';
import { Interests } from '../imports/api/interests.js';
import { Events } from '../imports/api/events.js';
import { Meetups } from '../imports/api/meetups.js';
import { Projects } from '../imports/api/projects.js';
import { Messages } from '../imports/api/messages.js';
import { Contributions } from '../imports/api/contributions.js';
import { Suggestions } from '/imports/api/suggestions.js';
import { ServiceConfiguration } from 'meteor/service-configuration';
import '../imports/api/pledgemethods.js';
import '../imports/api/messagemethods.js';
import '../imports/api/usermethods.js';
import '../imports/api/threadmethods.js';
import '../imports/api/alertmethods.js';
import '../imports/api/interestmethods.js';
import '../imports/api/projectmethods.js';
import '../imports/api/reviewmethods.js';
import '../imports/api/stripemethods.js';
import '../imports/api/imageresize.js';
import { WebApp } from 'meteor/webapp';


WebApp.rawConnectHandlers.use(function(req, res, next) {
  if (req._parsedUrl.pathname.match(/\.(ttf|ttc|otf|eot|woff|woff2|font\.css|css)$/)) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  next();
});

Meteor.startup(() => {

  if (Meteor.settings.public.setting === 'test') {
    WebAppInternals.setBundledJsCssUrlRewriteHook((url) => {
      return `https://d358qsncn59ak.cloudfront.net${url}&_g_app_v_=${process.env.GALAXY_APP_VERSION_ID}`;
    });
    WebAppInternals.setBundledJsCssPrefix(Meteor.settings.CDN_URL)
  }



  ServiceConfiguration.configurations.remove(
    {service: 'facebook'}
  );

  ServiceConfiguration.configurations.upsert(
    { service: 'facebook' },
    {
      $set: {
        appId: Meteor.settings.public.FacebookAppId,
        secret: Meteor.settings.public.FacebookSecret,
      },
    }
  );
});
