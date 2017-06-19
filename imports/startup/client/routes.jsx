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

import {Terms} from '../../ui/pages/terms.jsx';
import {About } from '../../ui/pages/about.jsx';
import {PrivacyPolicy} from '../../ui/pages/privacypolicy.jsx';

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
        <Route path='/about' component={About}/>
        <Route path='/pages' component ={UserTabs} />
        <Route path='/pages/:tab' component={UserTabs}/>
        <Route path='/pages/pledges/new' component={PledgeList}/>
        <Route path='/pages/community/:thread/:_id' component={Thread}/>
        <Route path='/pages/community/:thread/:_id/edit' component={EditThread}/>
        {/*<Route path='/pages/:tab/chat/:thread/:_id' component={DynamicThread}/>*/}
        <Route path='/pages/:tab/just-added/:pledge/:_id' component={UserTabs}/>
        <Route path='/pages/:tab/:pledge/:_id' component={DynamicPledge}/>
        <Route path='/pages/:tab/:pledge/:_id/edit' component={EditPledge}/>

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
