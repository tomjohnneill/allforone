import React , {PropTypes} from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import {grey200, grey500, grey100} from 'material-ui/styles/colors';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import LinearProgress from 'material-ui/LinearProgress';
import FlatButton from 'material-ui/FlatButton';
import Divider from 'material-ui/Divider';
import {Tabs, Tab} from 'material-ui/Tabs';
import { Session } from 'meteor/session';
import FacebookProvider, { Comments } from 'react-facebook';
import Dialog from 'material-ui/Dialog';
import {Pledge} from '/imports/ui/pages/pledge.jsx'
import Profile from '/imports/ui/pages/profile.jsx';
import {Link, browserHistory} from 'react-router';
import ThreadList from '/imports/ui/pages/threadlist.jsx';
import PledgeList from '../../ui/pages/pledgelist.jsx';
import Community from '../../ui/pages/community.jsx';
import SwipeableViews from 'react-swipeable-views';
import Subheader from 'material-ui/Subheader';

export class UserTabs extends React.Component{
  constructor(props) {
  super(props);
  var lookup = ['pledges','profile','community']
  this.state = {
    open: this.props.params.tab === 'community' || this.props.params.tab === 'pledges' ? false : true,
    value: 'pledges',
    slideIndex: this.props.params.tab ? lookup.indexOf(this.props.params.tab) : 0,
  };
}

handleChange(value) {
  mixpanel.track("Clicked on " + value + ' tab')
  var lookup = ['pledges','profile','community']
  browserHistory.push('/pages/' + lookup[value])
  this.setState({
    value: lookup[value],
    slideIndex: value,
  });
  };

handleTabClick(value) {
  mixpanel.track("Clicked on " + value + ' tab')
  var lookup = ['pledges','profile','community']
  browserHistory.push('/pages/' + value)
  this.setState({
    value: value,
    slideIndex: lookup.indexOf(value),
  });
  };

handleTwoTabClick(value) {
  mixpanel.track("Clicked on " + value + ' tab')
  var lookup = ['pledges','community']
  browserHistory.push('/pages/' + value)
  this.setState({
    value: value,
    slideIndex: lookup.indexOf(value),
  });
}

handleSignIn = (e) => {
  console.log('What is going on?')
  e.preventDefault()
  console.log('What is going on?')
  Meteor.loginWithFacebook({requestPermissions: ['email', 'public_profile', 'user_friends']},function(error, result) {
    if (error) {
        console.log("facebook login didn't work at all")
        Bert.alert(error.reason, 'danger')
    }
  })
}

componentDidMount() {
  if (this.props.params.tab !== 'pledges' && this.props.params.tab !== 'community') {
    browserHistory.push('/pages/community')
    browserHistory.goBack()
  }
}

handleClose = () => this.setState({open: false});

  componentDidMount() {
    if (this.props.loading === false && Meteor.userId() !== null) {
      Meteor.call('recalculateScore', Meteor.userId())
    }
  }

  render() {

    return(
      <div>
      {Meteor.userId() !== null ?
        <div>
        <Tabs
          tabItemContainerStyle={{height: '36px'}}
            value={this.props.params.tab}
            onChange={this.handleTabClick.bind(this)}
          >
            <Tab label="Pledges"  buttonStyle={{height: '36px'}} value="pledges"/>
            <Tab label="Profile" buttonStyle={{height: '36px'}} value="profile"/>
            <Tab label="Community" buttonStyle={{height: '36px'}} value="community"/>
          </Tabs>

          <SwipeableViews
            animateHeight={true}
          index={this.state.slideIndex}
          onChangeIndex={this.handleChange.bind(this)}
        >
        <div>
          <PledgeList hidden={this.props.params.tab !== 'pledges'}/>
        </div>
        <div>
          <Profile hidden={true} justAddedPledge={this.props.params.pledge} justAddedPledgeId = {this.props.params._id}/>
          <div style={{height: '36px'}}/>
        </div>
        <div>
          <Community hidden={true}/>
          <div style={{height: '36px'}}/>
        </div>
        </SwipeableViews>

      </div>

           :
           <div>
        <Tabs
          tabItemContainerStyle={{height: '36px'}}
            value={this.props.params.tab}
            onChange={this.handleTwoTabClick.bind(this)}
          >
            <Tab label="Pledges"  buttonStyle={{height: '36px'}} value="pledges">
              <div>
                <PledgeList hidden={this.props.params.tab !== 'pledges'}/>
              </div>
            </Tab>
            <Tab label="Community" buttonStyle={{height: '36px'}} value="community">
              <div>
                <Community hidden={true}/>
                <div style={{height: '36px'}}/>
              </div>
            </Tab>
          </Tabs>
          {this.props.params.tab !== 'pledges' && this.props.params.tab !== 'community' && this.props.params.tab ?
            <Dialog open={this.state.open}
          onRequestClose={this.handleClose}>
            <div style={{display: 'flex', justifyContent: 'center'
              , alignItems: 'center', flexDirection: 'column', zIndex: '100'}}>
              <Subheader style={{paddingLeft: '0px', textAlign: 'center', marginBottom: '40px'}}>
                You need to be logged in to access this page
              </Subheader>
              <div>
              <RaisedButton onTouchTap={this.handleSignIn} primary={true} label='Login'  />
              </div>
            </div>
          </Dialog>
            : null}
          </div>

      }
      </div>
    )
  }
}

UserTabs.propTypes = {
  users: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default createContainer(() => {
  const subscriptionHandler = Meteor.subscribe("userData");

  return {
    loading: !subscriptionHandler.ready(),
    users: Meteor.users.find({}, {fields: {_id: 1}}).fetch(),
  };
}, UserTabs);
