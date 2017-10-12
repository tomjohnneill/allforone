import React, {PropTypes} from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { IndexLink, Link, browserHistory } from 'react-router';
import {grey200, grey500, grey100, amber500, blue200} from 'material-ui/styles/colors';
import Paper from 'material-ui/Paper';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import RaisedButton from 'material-ui/RaisedButton';
import Popover from 'material-ui/Popover';
import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import Avatar from 'material-ui/Avatar';
import Badge from 'material-ui/Badge';
import IconButton from 'material-ui/IconButton';
import NotificationsIcon from 'material-ui/svg-icons/social/notifications';
import MessageIcon from 'material-ui/svg-icons/communication/message';
import DoneAll from 'material-ui/svg-icons/action/done-all';
import MediaQuery from 'react-responsive';
import TextField from 'material-ui/TextField';
import Settings from 'material-ui/svg-icons/action/settings';
import { ServiceConfiguration } from 'meteor/service-configuration';
import InfoOutline from 'material-ui/svg-icons/action/info';
import MessagingButton from '/imports/ui/components/messagingbutton.jsx';
import {SignupModal} from '/imports/ui/components/signupmodal.jsx';

import globalStyles from '/client/main.css';

// Fixes some issues with arrow drops etc.
// Apparently injectTapEvent can only be done once - so need to remember not to put it here
var injectTapEventPlugin = require("react-tap-event-plugin");
injectTapEventPlugin();


const style = {
  display: 'inline-block',
  margin: '16px 32px 16px 0',
  title: {
    cursor: 'pointer',
    fontFamily: 'Permanent Marker',
    color: '#FF9800',
    fontSize: '30px',
    marginRight: '15px',
    width: '100px'
  },
  appBar: {
    margin: '0px',
    boxShadow: null,
    paddingLeft: '16px',
    backgroundColor: 'white'
  },
  otherAnchor :{
    float: 'right',
    width: '10px',
  },
  popover: {
    maxWidth: '180px'
  },
  avatar: {
    cursor: 'pointer'
  }
  , badge: {
    paddingBottom : '0px'
    , paddingTop: '16px'
    , marginRight: '12px'
    , cursor: 'pointer'
  }
  , alertBadge: {
    paddingBottom : '0px'
    , paddingTop: '16px'
    , cursor: 'pointer'
  }
  , rightSide: {
    height: '50px'
    , display: 'flex'
    , alignItems: 'center'
  }
  , plainIcon: {
    paddingRight: '36px',
    paddingLeft: '12px'
  }
  , alertPlain: {
    paddingRight: '12px'
  }
  , verifiedPlain: {
    paddingRight: '24px'
  }
};

export default class Navigation extends React.Component {

  constructor(props){
    super(props);
    this.state = {open: false, changePasswordOpen: false, modalOpen: false};
    this.logout = this.logout.bind(this);

  }

  componentDidMount() {
    if (Meteor.userId() !== null) {
    Meteor.call('findFriends', function(error, result) {
      Session.set('friends', result);
      Meteor.call('recalculateScore', Meteor.userId())
      Meteor.call('triggerSocialScoreCalculate')
    })
    Meteor.call('recalculateScore', Meteor.userId())

  }

  var navigator = window.navigator

}

  logout(e){
    e.preventDefault();
    Meteor.logout();
    this.setState({data: {isAuthenticated: false}})


  }


  handleOpen() {
  this.setState({changePasswordOpen: true});
  };

  handleClose() {
    this.setState({changePasswordOpen: false});
  };


  handleRequestClose() {
    this.setState({
      open: false
    });
  };

  handleChange(textField, event) {
        this.setState({
            [textField]: event.target.value
        });
    }

  handleTitleTap(event) {
    event.preventDefault();

    browserHistory.push('/')
  }

  handleYourListings(event) {
    browserHistory.push('/yourdetails')
  }

  handleDashboard(event) {
    browserHistory.push('/dashboard')
  }

  handleBlog(event) {
    event.preventDefault()
    browserHistory.push('/blog')
  }

  handleChangePassword(e) {
    Accounts.changePassword(this.state.oldPassword, this.state.newPassword, function(err) {
      return (err)
    })
  }

  handleSettingsClick = (e) => {
    e.preventDefault()
    this.setState({
      open: true,
      anchorEl: e.currentTarget
    })
  }

  handleAboutClick = (e) => {
    e.preventDefault()
    browserHistory.push('/messages')
  }

  handleSignOut = (e) => {
    e.preventDefault()
    Meteor.logout(function(error, result) {
      if (error) {
        Bert.alert(error.reason, 'danger')
      } else {
        Bert.alert('Logged out', 'success')
        browserHistory.push('/')
      }
    })
  }

  handleModal = (e) => {
    this.setState({open: false})
    this.setState({modalOpen: true})
  }

  setModal = () => {
    let modal = this.state.modalOpen
    this.setState({modalOpen: !modal})
  }

  handleModalChangeOpen = (e) => {
    this.setState({modalOpen: false})
  }

  handleSignIn = (e) => {
    e.preventDefault()
    Meteor.loginWithFacebook({requestPermissions: ['email', 'public_profile', 'user_friends']},function(error, result) {
      if (error) {
          console.log("facebook login didn't work at all")
          Bert.alert(error.reason, 'danger')
      }
    })
  }

  handleTerms = (e) => {
    e.preventDefault()
    browserHistory.push('/terms')
  }

  handlePrivacyPolicy = (e) => {
    e.preventDefault()
    browserHistory.push('/privacypolicy')
  }

  handleAnalytics = (e) => {
    e.preventDefault()
    browserHistory.push('/analytics')
  }

  handleNewPledge = (e) => {
    console.log('handleNewPledge fired')
    if (e) {
      e.preventDefault()
    }
    console.log('handleNewPledge fired second')
    Meteor.call( 'newPledge', ( error, pledgeId ) => {
      if ( error ) {
        Bert.alert( error.reason, 'danger' );
      } else {

        Meteor.call('findPledgeSlug', pledgeId, (error, pledgeSlug) => {
          if (error) {
            Bert.alert(error.reason, "Can't find pledge slug")
          } else {
          browserHistory.push( `/pages/pledges/${ pledgeSlug }/${ pledgeId }/edit` );
          Bert.alert( 'All set! Get to typin\'', 'success' );
        }
        })
      }
    })
  }

  handleCreatePledge = (e) => {
    e.preventDefault()
    if (Meteor.userId() === null) {
        this.setState({modalOpen: true})
        }
    else {
      this.handleNewPledge(e)
    }
  }

  renderLayout() {

  return(

      <div>

        <AppBar
          showMenuIconButton={false}
          style={style.appBar}
          iconElementRight={
                            <div style={{display: 'flex', alignItems: 'center'}}>
                            <MediaQuery minDeviceWidth = {700}>
                              <RaisedButton
                                style={{height: '36px', marginRight: '16px', boxShadow: ''}} primary={true} overlayStyle={{height: '36px'}}
                                buttonStyle={{height: '36px'}}
                                 labelStyle={{height: '36px', display: 'flex', alignItems: 'center',
                                      letterSpacing: '0.6px', fontWeight: 'bold'}}
                                 label='Start a Pledge' onTouchTap={this.handleCreatePledge}/>
                            </MediaQuery>
                            <MessagingButton handleClick={this.handleAboutClick}/>
                            <IconButton tooltip='Settings' onTouchTap={this.handleSettingsClick}>
                            <Settings color={'#484848'}/>
                            </IconButton>
                            </div>}
          title={
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <span onTouchTap ={this.handleTitleTap.bind(this)}  className = 'idle' style={style.title}>
              Who's In?
            </span>

            </div>
          }
          titleStyle = {{display: 'flex', alignItems: 'center', justifyContent: 'flex-start'}}
          />

        <div>
          <SignupModal

            open={this.state.modalOpen}
            changeOpen={this.handleModalChangeOpen}
          />
        <Popover
          open={this.state.open}
         anchorEl={this.state.anchorEl}
         anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
         targetOrigin={{horizontal: 'left', vertical: 'top'}}
         onRequestClose={this.handleRequestClose.bind(this)}
       >

         <Menu>
           {
             Meteor.userId() === null ? <MenuItem primaryText="Sign In" onTouchTap={this.handleModal}/> :
             <MenuItem primaryText="Sign Out" onTouchTap={this.handleSignOut}/>
           }
           <MenuItem primaryText="Terms &amp; Conditions"  onTouchTap={this.handleTerms}/>
           <MenuItem primaryText="Privacy Policy"  onTouchTap={this.handlePrivacyPolicy}/>
           <MenuItem primaryText='Analytics' onTouchTap={this.handleAnalytics}/>

         </Menu>
       </Popover>
       </div>
      </div>
    );
  }
  render () {
    return(
    <div>
      {this.renderLayout()}

    </div>
  )
  }
}
