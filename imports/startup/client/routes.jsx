import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import Loadable from 'react-loadable';

import { App } from '../../ui/layouts/app.jsx';
import { NotFound } from '../../ui/pages/notfound.jsx';
import { Pledge } from '../../ui/pages/pledge.jsx';
import UserTabs from '../../ui/components/tabs.jsx';
import PledgeList from '../../ui/pages/pledgelist.jsx';
import DynamicPledge from '../../ui/pages/dynamicpledge.jsx';
import {Interests} from '../../ui/pages/interests.jsx'

import EmailAdmin from '../../ui/pages/emailadmin.jsx';
import Project from '../../ui/pages/project.jsx';
import Discover from '../../ui/pages/discover.jsx'
import PledgedUsers from '../../ui/pages/pledgedusers.jsx';
import UserList from '../../ui/pages/userlist.jsx';
import Groups from '../../ui/pages/groups.jsx';
import Broadcast from '../../ui/pages/broadcast.jsx';
import StripeRedirect from '../../ui/pages/striperedirect.jsx'

import {Terms} from '../../ui/pages/terms.jsx';
import {PrivacyPolicy} from '../../ui/pages/privacypolicy.jsx';

import TestyPage from '../../ui/pages/testypage.jsx';

const Loading = () => (
  <div/>
)

const UserListLoadable = Loadable({
  loader: () => import('/imports/ui/pages/userlist.jsx'),
  loading: Loading
});

const FormBuilderLoadable = Loadable({
  loader: () => import('/imports/ui/pages/formbuilder.jsx'),
  loading: Loading
});

const EditPledgeLoadable = Loadable({
  loader: () => import('/imports/ui/pages/editpledge.jsx'),
  loading: Loading
});

const AnalyticsLoadable = Loadable({
  loader: () => import('/imports/ui/pages/analytics.jsx'),
  loading: Loading
});

const PledgeAnalyticsLoadable = Loadable({
  loader: () => import('/imports/ui/pages/pledgeanalytics.jsx'),
  loading: Loading
});

const AdminLoadable = Loadable({
  loader: () => import('/imports/ui/pages/admin.jsx'),
  loading: Loading
});

const PublicProfileLoadable = Loadable({
  loader: () => import('/imports/ui/pages/publicprofile.jsx'),
  loading: Loading
});

const TermsLoadable = Loadable({
  loader: () => import('/imports/ui/pages/terms.jsx'),
  loading: Loading
});

const AboutLoadable = Loadable({
  loader: () => import('/imports/ui/pages/about.jsx'),
  loading: Loading
});

const PrivacyPolicyLoadable = Loadable({
  loader: () => import('/imports/ui/pages/privacypolicy.jsx'),
  loading: Loading
});

const PaymentPlansLoadable = Loadable({
  loader: () => import('/imports/ui/pages/paymentplans.jsx'),
  loading: Loading
});

const MessagesLoadable = Loadable({
  loader: () => import('/imports/ui/pages/messages.jsx'),
  loading: Loading
});

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
        <Route path='/messages' component={MessagesLoadable}/>
        <Route path='/messages/:conversationId' component={MessagesLoadable}/>
        <Route path='/admin/:adminTab' component={AdminLoadable}/>
        <Route path='/emailadmin' component={EmailAdmin}/>
        <Route path='/:pledgeId/project' component={Project}/>
        <Route path='/discover' component={Discover}/>
        <Route path='/stripe-redirect' component={StripeRedirect}/>
        <Route path='/analytics' component={AnalyticsLoadable}/>
        <Route path='/interests' component={Interests}/>
        <Route path='/about' component={AboutLoadable}/>
        <Route path='/profile/:userId' component={PublicProfileLoadable}/>
        <Route path='/pages' component ={UserTabs} />
        <Route path='/pages/:tab' component={UserTabs}/>
        <Route path='/pages/pledges/new' component={PledgeList}/>
        <Route path='/pages/:tab/just-added/:pledge/:_id' component={UserTabs}/>
        <Route path='/pages/:tab/:pledge/:_id' component={DynamicPledge}/>
        <Route path='/pages/:tab/:pledge/:_id/edit' component={EditPledgeLoadable}/>
        <Route path='/pages/:tab/:pledge/:_id/analytics' component={PledgeAnalyticsLoadable}/>
        <Route path='/pages/:tab/:pledge/:_id/pledged-users' component={PledgedUsers}/>
        <Route path='/pages/:tab/:pledge/:_id/user-list' component={UserListLoadable}/>
        <Route path='/pages/:tab/:pledge/:_id/user-groups' component={Groups}/>
        <Route path='/pages/:tab/:pledge/:_id/form-builder' component={FormBuilderLoadable}/>
        <Route path='/pages/:tab/:pledge/:_id/broadcast' component={Broadcast}/>
        <Route path='/pages/:tab/:pledge/:_id/payment-plans' component={PaymentPlansLoadable}/>
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
