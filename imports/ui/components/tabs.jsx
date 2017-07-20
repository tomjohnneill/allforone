import React , {PropTypes} from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import {grey200, grey500, grey100} from 'material-ui/styles/colors';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import LinearProgress from 'material-ui/LinearProgress';
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

export class UserTabs extends React.Component{
  constructor(props) {
  super(props);
  var lookup = ['pledges','profile','community']
  this.state = {
    value: 'pledges',
    slideIndex: this.props.params.tab ? lookup.indexOf(this.props.params.tab) : 0,
  };
}

handleChange(value) {
  var lookup = ['pledges','profile','community']
  browserHistory.push('/pages/' + lookup[value])
  this.setState({
    value: lookup[value],
    slideIndex: value,
  });
  };

handleTabClick(value) {
  var lookup = ['pledges','profile','community']
  browserHistory.push('/pages/' + value)
  this.setState({
    value: value,
    slideIndex: lookup.indexOf(value),
  });
  };

handleTwoTabClick(value) {
  var lookup = ['pledges','community']
  browserHistory.push('/pages/' + value)
  this.setState({
    value: value,
    slideIndex: lookup.indexOf(value),
  });
}


  componentDidMount() {
    if (this.props.loading === false && this.props.users[0] !== undefined) {
      Meteor.call('recalculateScore', Meteor.userId())
    }
  }

  render() {

    return(
      <div>
      {this.props.userId?
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
    users: Meteor.users.find().fetch(),
    userId: Meteor.userId(),
    thisUser: Meteor.users.findOne({_id: Meteor.userId()})
  };
}, UserTabs);
