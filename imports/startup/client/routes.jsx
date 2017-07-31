import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';

import { App } from '../../ui/layouts/app.jsx';
import { Index } from '../../ui/components/index.jsx';
import { NotFound } from '../../ui/pages/notfound.jsx';
import { Pledge } from '../../ui/pages/pledge.jsx';
import Profile from '../../ui/pages/profile.jsx';
import UserTabs from '../../ui/components/tabs.jsx';
import EditPledge from '../../ui/pages/editpledge.jsx';
import PledgeList from '../../ui/pages/pledgelist.jsx';
import DynamicPledge from '../../ui/pages/dynamicpledge.jsx';
import EditThread from '../../ui/pages/editthread.jsx';
import Thread from '../../ui/pages/thread.jsx';
import Community from '../../ui/pages/community.jsx';
import {Interests} from '../../ui/pages/interests.jsx'
import PublicProfile from '../../ui/pages/publicprofile.jsx';

import {Terms} from '../../ui/pages/terms.jsx';
import {About } from '../../ui/pages/about.jsx';
import {PrivacyPolicy} from '../../ui/pages/privacypolicy.jsx';

import EmailAdmin from '../../ui/pages/emailadmin.jsx';
import Analytics from '../../ui/pages/analytics.jsx'
import Project from '../../ui/pages/project.jsx';
import Discover from '../../ui/pages/discover.jsx'
import PledgeAnalytics from '../../ui/pages/pledgeanalytics.jsx';

import Admin from '../../ui/pages/admin.jsx';

import TestyPage from '../../ui/pages/testypage.jsx';

/* This is obviously just the routing code
Interesting things to note:
  different imports above, depending on export or export default
  Navigation becomes an index route - by being loaded into the Index component
 */

Meteor.startup( () => {
  render(
    <Router history={ browserHistory }>
      <Route path="/" component={ App }>
        <IndexRoute component={ UserTabs } />
        <Route path='/terms' component={Terms}/>
        <Route path='/testypage' component={TestyPage}/>
        <Route path='/privacypolicy' component={PrivacyPolicy}/>
        <Route path='/admin' component={Admin}/>
        <Route path='/community' component={Community}/>
        <Route path='/emailadmin' component={EmailAdmin}/>
        <Route path='/:pledgeId/project' component={Project}/>
        <Route path='/discover' component={Discover}/>
        <Route path='/analytics' component={Analytics}/>
        <Route path='/interests' component={Interests}/>
        <Route path='/about' component={About}/>
        <Route path='/profile/:userId' component={PublicProfile}/>
        <Route path='/pages' component ={UserTabs} />
        <Route path='/pages/:tab' component={UserTabs}/>
        <Route path='/pages/pledges/new' component={PledgeList}/>
        <Route path='/pages/community/:thread/:_id' component={Thread}/>
        <Route path='/pages/community/:thread/:_id/edit' component={EditThread}/>
        {/*<Route path='/pages/:tab/chat/:thread/:_id' component={DynamicThread}/>*/}
        <Route path='/pages/:tab/just-added/:pledge/:_id' component={UserTabs}/>
        <Route path='/pages/:tab/:pledge/:_id' component={DynamicPledge}/>
        <Route path='/pages/:tab/:pledge/:_id/edit' component={EditPledge}/>
        <Route path='/pages/:tab/:pledge/:_id/analytics' component={PledgeAnalytics}/>
        <Route path='/pages/:tab/:pledge/:pledgeId/project' component={Project}/>
        <Route path='/pages/:tab/:pledge' component={UserTabs}/>
        <Route path="/pledge" component={ UserTabs } />
        <Route path="/profile" component={ UserTabs } />
        <Route path="/starterpledge" component={Pledge}/>
        <Route path="*" component={ NotFound } />
        </Route>


    </Router>,
    document.getElementById( 'react-root' )
  );
});
