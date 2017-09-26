import React , {PropTypes} from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import {grey200, grey500, grey100, amber50} from 'material-ui/styles/colors';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import LinearProgress from 'material-ui/LinearProgress';
import FlatButton from 'material-ui/FlatButton';
import Divider from 'material-ui/Divider';
import {Tabs, Tab} from 'material-ui/Tabs';
import { Session } from 'meteor/session';
import Dialog from 'material-ui/Dialog';
import {Pledge} from '/imports/ui/pages/pledge.jsx'
import {Link, browserHistory} from 'react-router';
import PledgeList from '../../ui/pages/pledgelist.jsx';
import SwipeableViews from 'react-swipeable-views';
import Subheader from 'material-ui/Subheader';
import Loadable from 'react-loadable';
import Support from '/imports/ui/pages/support.jsx';
import MessengerPlugin from 'react-messenger-plugin';

const styles = {
  selectedTab: {
    height: '36px',
    backgroundColor: 'white',
    color: '#0068B2',
    fontWeight: 700,
    fontSize: '12px',
    letterSpacing: '0.4px',
    lineHeight: '16px',
    fontFamily: 'Roboto',
    width: '100px'
  },
  tab: {
    height: '36px',
    fontFamily: 'Roboto',
    backgroundColor: 'white',
    color: '#484848',
    fontWeight: 700,
    fontSize: '12px',
    letterSpacing: '0.4px',
    lineHeight: '16px',
    width: '100px'
  }
}

const Loading = () => (
  <div/>
)

const ProfileLoadable = Loadable({
  loader: () => import('/imports/ui/pages/profile.jsx'),
  loading: Loading
});

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

handleTabClick = (value) => {
  mixpanel.track("Clicked on " + value + ' tab')
  var lookup = ['pledges','profile','community']
  browserHistory.push('/pages/' + value)
  this.setState({
    value: value,
    slideIndex: lookup.indexOf(value),
  });
  };

handleTwoTabClick = (value) => {
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
          style={{borderBottom: '1px solid #e4e4e4', boxShadow: '0 1px 5px rgba(0, 0, 0, 0.1) '}}
          tabItemContainerStyle={{height: '36px', backgroundColor: 'white'}}
            value={this.props.params.tab}
            onChange={this.handleTabClick}
            inkBarStyle={{zIndex: 2, backgroundColor: '#0068B2',
            left:this.state.slideIndex * 100 + 20 + 'px', width: '60px'}}
          >
            <Tab label="Pledges"  buttonStyle={this.props.params.tab === 'pledges' || !this.props.params.tab ? styles.selectedTab : styles.tab} style={{width: '100px'}} value="pledges"/>
            <Tab label="Profile" buttonStyle={this.props.params.tab === 'profile' ? styles.selectedTab : styles.tab} style={{width: '100px'}} value="profile"/>
            <Tab label="Community" buttonStyle={this.props.params.tab === 'community' ? styles.selectedTab : styles.tab}style={{width: '100px'}}  value="community"/>
          </Tabs>

          <SwipeableViews
            
          index={this.state.slideIndex}
          onChangeIndex={this.handleChange.bind(this)}
        >
        <div>
          <PledgeList hidden={this.props.params.tab !== 'pledges'}/>
        </div>
        <div>
          <ProfileLoadable hidden={true} justAddedPledge={this.props.params.pledge} justAddedPledgeId = {this.props.params._id}/>
          <div style={{height: '36px'}}/>
        </div>
        <div>

            <Support hidden={true}/>

          <div style={{height: '36px'}}/>
        </div>
        </SwipeableViews>

      </div>

           :
           <div>
        <Tabs
          tabItemContainerStyle={{height: '36px', backgroundColor: 'white', borderBottom: '1px solid #e4e4e4', boxShadow: '0 1px 5px rgba(0, 0, 0, 0.1) '}}
          style={{backgroundColor: 'white'}}
            value={this.props.params.tab}
            onChange={this.handleTwoTabClick.bind(this)}
            inkBarStyle={{zIndex: 2, backgroundColor: '#0068B2',
            left:this.state.slideIndex * 100 + 20 + 'px', width: '60px'}}
          >
            <Tab label="Pledges"   buttonStyle={this.props.params.tab === 'pledges' || !this.props.params.tab ? styles.selectedTab : styles.tab} style={{width: '100px'}} value="pledges">
              <div>
                <PledgeList hidden={this.props.params.tab !== 'pledges'}/>
              </div>
            </Tab>
            <Tab label="Community"  buttonStyle={this.props.params.tab === 'community' ? styles.selectedTab : styles.tab} style={{width: '100px'}} value="community">
              <div>

                  <Support hidden={true}/>


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
