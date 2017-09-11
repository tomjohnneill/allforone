import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import {grey200, grey500, grey100, amber500} from 'material-ui/styles/colors'
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import LinearProgress from 'material-ui/LinearProgress';
import Divider from 'material-ui/Divider';
import {Tabs, Tab} from 'material-ui/Tabs';
import {List, ListItem} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Avatar from 'material-ui/Avatar'
import { Session } from 'meteor/session';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import {Link, browserHistory} from 'react-router';
import {Pledges} from '/imports/api/pledges.js';
import Leaderboard from '/imports/ui/components/leaderboard.jsx';
import ProfilePledges from '/imports/ui/components/profilepledges.jsx';
import SocialLeaderboard from '/imports/ui/components/socialleaderboard.jsx';
import Badges from '/imports/ui/components/badges.jsx';
import SuggestionList from '/imports/ui/components/suggestionlist.jsx';
import ReviewList from '/imports/ui/components/reviews.jsx';
import ExpandMore from 'material-ui/svg-icons/navigation/expand-more';
import DocumentTitle from 'react-document-title';
import IconButton from 'material-ui/IconButton';
import {dateDiffInDays} from '/imports/ui/pages/dynamicpledge.jsx'
import MessengerPlugin from 'react-messenger-plugin';
import NotificationsActive from 'material-ui/svg-icons/social/notifications-active'
import CircularProgress from 'material-ui/CircularProgress';
import { Accounts } from 'meteor/accounts-base';
import Publish from 'material-ui/svg-icons/editor/publish';
import InfoIcon from '/imports/ui/components/infoicon.jsx';
import TextField from 'material-ui/TextField'
import Email from 'material-ui/svg-icons/communication/email';
import SMS from 'material-ui/svg-icons/communication/textsms';
import Loadable from 'react-loadable';

const Loading = () => (
  <div/>
)

const ProfilePledgesLoadable = Loadable({
  loader: () => import('/imports/ui/components/profilepledges.jsx'),
  loading: Loading
});

const styles = {
  box: {
    backgroundColor: grey200,
    marginTop: '10px',
    marginBottom: '10px',
    padding: '10px'
  },
  header: {
    backgroundColor: 'white',
    fontSize: '20pt',
    fontWeight: 'bold',
    padding: '10px',
  },
  cardTitle: {
    display: 'flex',
    marginTop: '10px'
  },
  bigTitle: {
    width: '50%',
    fontStyle: 'italic',
    color: grey500
  },
  currentCommitments: {
    textAlign: 'center',

  },
  targetCommitments: {
    textAlign: 'center'
  }

}

var OneSignal = window.OneSignal || [];

export class Profile extends Component {
  constructor(props) {
    super(props);
    var popup = this.props.justAddedPledge !== '' && this.props.justAddedPledge !== undefined
    var messenger = !popup
    this.state = {pledgeAdded: false, permissionOpen: false, popup: popup
      , messenger: messenger, messengerPopup: false}


  }



  handleNotificationSend = (e) => {
    e.preventDefault()
    Meteor.call('sendNotificationToFacebook')
  }

  handlePermissionsPopup = (e) => {
    e.preventDefault()
    this.setState({permissionOpen: true})
  }

  handlePermissionClose = (e) => {
    e.preventDefault()
    this.setState({permissionOpen: false})
  }

  requestMorePermissions = (e) => {
    e.preventDefault()
    Meteor.loginWithFacebook({requestPermissions:['publish_actions'], authType: 'reauthenticate', redirectUrl: Meteor.settings.ROOT_URL})
  }

  handleClose() {
    this.setState({pledgeAdded: false})
  }

  openPopup = () => {
    console.log('popup should open')
    this.setState({pledgeAdded: true})
  }

  openMessengerPopup = () => {
    console.log('messenger popup should open')
    this.setState({messengerPopup: true})
  }

  componentDidMount() {
      console.log('Timeout should be loading')
      if (this.props.justAddedPledge !== undefined && this.props.user && this.props.user.OneSignalUserId === undefined)
        {this.carousel = window.setTimeout(this.handleNotificationsClick, 15000)}
      if (this.state.popup) {
        console.log('In 10 seconds this will load')
        this.aCarousel = window.setTimeout(this.openPopup, 10000)
      } else  {
        //console.log('In 10 seconds show messenger prompt')
        //this.mCarousel = window.setTimeout(this.openMessengerPopup, 10000)
      }
    }

    componentWillUnmount() {
      if (this.props.justAddedPledge !== undefined)
      {clearTimeout(this.carousel)}
      if (this.state.popup) {
        clearTimeout(this.aCarousel)
      }

    }
/*
  componentWillReceiveProps(nextProps) {
    if (!nextProps.loading && Meteor.user().userMessengerId !== undefined) {
      console.log('clearing messenger timeout')
      clearTimeout(this.mCarousel)
    }
  }
*/


  handleScore = (e) => {
    e.preventDefault()
    Meteor.call('recalculateScore', Meteor.userId())
  }

  blahblahblahhandleNotificationsClick = (e) => {
    e.preventDefault()
    OneSignal.push(function() {
      OneSignal.on('subscriptionChange', function (isSubscribed) {
        OneSignal.getUserId(function(userId) {
           console.log("OneSignal User ID:", userId);
           Meteor.call('registerUserToNotification', userId)
           // (Output) OneSignal User ID: 270a35cd-4dda-4b3f-b04e-41d7463a2316
         });
      });
      OneSignal.registerForPushNotifications({
        modalPrompt: true
      });
    });
  }

  handleNotificationsClick = (e) => {
    if (e) {e.preventDefault()};

    var OneSignal = window.OneSignal
    console.log(OneSignal)

    OneSignal.push(function() {
      OneSignal.on('subscriptionChange', function (isSubscribed) {
        OneSignal.getUserId(function(userId) {
           console.log("OneSignal User ID:", userId);
           Meteor.call('registerUserToNotification', userId)
           // (Output) OneSignal User ID: 270a35cd-4dda-4b3f-b04e-41d7463a2316
         });
      });
    });

    OneSignal.push(function() {
    /* These examples are all valid */
    OneSignal.isPushNotificationsEnabled(function(isEnabled) {
      if (isEnabled)
        console.log("Push notifications are enabled!");

      else
        console.log("Push notifications are not enabled yet.");

    });
    });

    OneSignal.push(function() {
      OneSignal.registerForPushNotifications({
        modalPrompt: true
      });
    });


}

  handleMessengerClose = () => {
    this.setState({messengerPopup: false})
  }

  getUserID = (e) => {
    e.preventDefault()
    Meteor.call('sendFriendPledgeSignalNotification', Meteor.userId())
}

  handleFacebookNotification = (e) => {
    Meteor.call('sendFBMessage', Meteor.userId())
  }

  handleSendAPI = (e) => {
    Meteor.call('sendTextMessage', '117077928875496', 'Hello there')
  }

  handleFriendClick(_id, e) {
    e.preventDefault()
    mixpanel.track('Clicked on friend')
    var friend = Meteor.users.findOne({'services.facebook.id': _id})
    browserHistory.push('/profile/' + friend._id)
  }

  handleChangeEmail = (event, newValue) => {
    this.setState({email: newValue})
  }

  handleKeypress = (e) => {
    if (e.key == 'Enter') {
      e.preventDefault()
      this.submitEmail()
    }
  }

  handleChangePhone = (event, newValue) => {
    this.setState({phone: newValue})
  }

  handlePhoneKeypress = (e) => {
    if (e.key == 'Enter') {
      e.preventDefault()
      this.submitPhone()
    }
  }

  submitPhone = () => {
    Meteor.call('updatePhone', this.state.phone, (err, result) => {
      if (err) {
        Bert.alert(err.reason, 'danger')
      } else {
        Bert.alert('Phone number updated', 'success')
      }
    })
  }

  submitEmail = () => {
    Meteor.call('updateEmail', this.state.email, (err, result) => {
      if (err) {
        Bert.alert(err.reason, 'danger')
      } else {
        Bert.alert('Email updated', 'success')
      }
    })
  }

  render () {
/*
    if (!this.props.loading) {
      var today = new Date()
      today.setHours(0,0,0,0)
      var i
      var previousResults = false
      var totalWeek = []
      var friendWeek = []
      var createdWeek = []
      var suggestionWeek = []
      if (this.props.thisUser.influence) {
        friendWeek[6] = this.props.thisUser.influence[this.props.thisUser.influence.length-1].pledgeFriendInfluence
        createdWeek[6] = this.props.thisUser.influence[this.props.thisUser.influence.length-1].pledgeCreatedInfluence
        suggestionWeek[6] = this.props.thisUser.influence[this.props.thisUser.influence.length-1].suggestionInfluence
        totalWeek[6] = this.props.thisUser.influence[this.props.thisUser.influence.length-1].totalInfluence
        for (i=5;i >= 0; i--) {
          var day = today - ((6-i) * 1000 * 60 * 60 * 24)
          var entry = this.props.thisUser.influence.find(x => x.date.setHours(0,0,0,0) === day)
          if (entry && entry.date) {
            totalWeek[i] = entry.totalInfluence
            friendWeek[i] = entry.pledgeFriendInfluence
            createdWeek[i] = entry.pledgeCreatedInfluence
            suggestionWeek[i] = entry.suggestionInfluence
            previousResults = true
          } else {
            totalWeek[i] = null
            friendWeek[i] = null
            createdWeek[i] = null
            suggestionWeek[i] = null
          }
        }
        if (!previousResults) {
          var early = today - ((6) * 1000 * 60 * 60 * 24)
          var entry = this.props.thisUser.influence.find(x => x.date.setHours(0,0,0,0) < day)
          if (entry) {
            totalWeek[0] = entry.totalInfluence
            friendWeek[0] = entry.pledgeFriendInfluence
            createdWeek[0] = entry.pledgeCreatedInfluence
            suggestionWeek[0] = entry.suggestionInfluence
          } else {
            totalWeek[0] = 0
            friendWeek[0] = 0
            createdWeek[0] = 0
            suggestionWeek[0] = 0
          }
        }
      }
    }
    console.log(totalWeek)

    var labels = []
    var j
    var today = new Date()
    var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri','Sat']
    today.setHours(0,0,0,0)
    for (j=6;j>=0;j--) {
      var day = today - ((6-j) * 1000 * 60 * 60 * 24)
      console.log(day)
      var date = new Date(day)
      console.log(date)
      labels[j] = days[date.getDay()]
    }

    var data = {
      labels: labels,
      series: [
        totalWeek, friendWeek, createdWeek, suggestionWeek
      ],

    };



    var type = 'Line'
    */
    if (this.props.justAddedPledge !== undefined && this.props.user && this.props.user.OneSignalUserId === undefined)
    {clearTimeout(this.carousel)}


    if (this.props.loading === false) {
    var justAddedPledgeCollection = undefined
    if (this.props.justAddedPledgeId !== undefined) {
      console.log('looking for a pledge in documents')
      justAddedPledgeCollection = Pledges.findOne({_id: this.props.justAddedPledgeId})
      console.log(justAddedPledgeCollection)
    }
    console.log(this.props)
    console.log(justAddedPledgeCollection)
    console.log(this.props.justAddedPledgeId)
    var justAddedPledgePicture = 'X'
    var justAddedPledgeTarget = 'X'
    var justAddedPledgeTitle = 'X'
    var justAddedPledgeDuration = 'X'
    if (justAddedPledgeCollection !== undefined) {
      justAddedPledgePicture = justAddedPledgeCollection.coverPhoto
      justAddedPledgeTarget = justAddedPledgeCollection.target
      justAddedPledgeTitle = justAddedPledgeCollection.title
      justAddedPledgeDuration = justAddedPledgeCollection.duration
    }

    console.log(justAddedPledgeTitle + 'Duration: ' + justAddedPledgeDuration)

  }
    return (
      <div>
        <DocumentTitle title='Profile'>
        {this.props.loading === true ? <div style={{height: '80vh', width: '100%',
                                              display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <CircularProgress/>
        </div>
       :
          <div style={styles.box}>
            <Card>
              <CardHeader
                  title={this.props.thisUser.profile.name}
                  subtitle={'Joined ' + this.props.thisUser.createdAt.toDateString()}
                  avatar={this.props.thisUser.profile.picture}
                />
              <Subheader>Contact methods for when a pledge finishes:</Subheader>
              {/*}  <ListItem
                  onTouchTap={this.handleNotificationsClick}
                  primaryText="Send a push notification"
                  leftAvatar={<IconButton
                    style={{padding: '0px'}}
                    iconStyle={{height: '36px', width: '36px'}}
                    >
                    <NotificationsActive
                     color={grey500}
                    />
                    </IconButton>
                    }
                  />
                  <ListItem
                    onTouchTap={this.handlePermissionsPopup}
                    primaryText="Tell my friends on Facebook"
                    leftAvatar={<IconButton
                      style={{padding: '0px'}}
                      iconStyle={{height: '36px', width: '36px'}}
                      >
                      <Publish
                       color={grey500}
                      />
                      </IconButton>
                      }
                    /> */}
                  <ListItem
                    innerDivStyle={{paddingTop: '0px', paddingBottom: '5px'}}
                    leftAvatar={<IconButton style={{padding: '0px'}}
                    iconStyle={{height: '36px', width: '36px'}}
                    >
                    <Email
                      color={grey500}
                      />
                  </IconButton>
                  }
                    children={<TextField
                      hintText='Hit Enter to change e-mail'
                      onKeyPress={this.handleKeypress}
                      onChange={this.handleChangeEmail} defaultValue={this.props.thisUser.profile.email?
                        this.props.thisUser.profile.email
                        : this.props.thisUser.services.facebook.email}/>}
                    >
                  </ListItem>
                  <ListItem
                    innerDivStyle={{paddingTop: '0px', paddingBottom: '5px'}}
                    leftAvatar={<IconButton style={{padding: '0px'}}
                    iconStyle={{height: '36px', width: '36px'}}
                    >
                    <SMS
                      color={grey500}
                      />
                  </IconButton>
                  }
                    children={<TextField
                      hintText='By SMS - enter mobile number'
                      onKeyPress={this.handlePhoneKeypress}
                      onChange={this.handleChangePhone} defaultValue={this.props.thisUser.profile.phone?
                        this.props.thisUser.profile.phone
                        : ''}/>}
                    >
                  </ListItem>
                  {this.props.thisUser && !this.props.thisUser.userMessengerId ?
                    <div>
                <Subheader>Sent alerts to my Facebook</Subheader>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <div style={{marginLeft: '85px', marginBottom: '20px', marginTop: '5px'}}>
                <MessengerPlugin
                  appId={Meteor.settings.public.FacebookAppId}
                  pageId={Meteor.settings.public.FacebookPageId}
                  size='large'
                  color='blue'
                  passthroughParams={Meteor.userId()}
                />
              </div>

            </div>
            </div> : null}



            </Card>

            <Card style={{marginTop: '20px'}}>
                <ReviewList userId={Meteor.userId()}/>
                  </Card>

          {/*  <Card style={{marginTop: '20px'}}>
                <ProfilePledgesLoadable/>
                  </Card>
                  */}

                <Card style={{marginTop: '20px'}}>
                    <Subheader>Suggestions</Subheader>
                    <SuggestionList userId={Meteor.userId()}/>
                </Card>


                  <Card style={{marginTop: '20px'}}>
                <List>
                                    <Subheader>Your friends</Subheader>
                  <div style={{display: 'flex',  backgroundColor: grey100
                    , paddingTop: '20px', paddingLeft: '20px', paddingRight: '20px', paddingBottom: '40px', fontSize: '14px', width: '100%', boxSizing: 'border-box', overflowX: 'scroll'}}>
                    {Meteor.user().friends ?

                      Meteor.user().friends.map((friend) => (


                        <IconButton tooltip={friend.first_name + ' ' + friend.last_name}
                          style={{height: '40px', width: '40px', padding: '0px'}}
                        iconStyle={{padding: '0px'}}>
                        <Avatar key={friend.id} src={friend.picture.data.url} onTouchTap={this.handleFriendClick.bind(this, friend.id)} style={{marginLeft: '-10px'}}/>
                        </IconButton>

                      ))
                      :

                        <div>None of your friends have signed up</div>


                    }
                  </div>
                </List>
                </Card>
                <Card style={{marginTop: '20px'}}>
                  <List>
                  <Subheader>Leaderboard</Subheader>
                  <div style={{paddingLeft: '16px', color: grey500, fontStyle: 'italic'}}>
                    Get more friends to join, or sign up to more pledges to increase your score</div>
                  <div style={{padding: '16px'}}>
                    <Tabs tabItemContainerStyle={{backgroundColor: '#1251BA', height: '36px'}} contentContainerStyle={{backgroundColor: grey100, padding: '10px'}}>
                      <Tab label='Your friends' buttonStyle={{backgroundColor: '#1251BA',height: '36px'}}>
                        <SocialLeaderboard/>
                      </Tab>
                      <Tab label='Everyone' buttonStyle={{backgroundColor: '#1251BA',height: '36px'}}>
                        <Leaderboard/>
                      </Tab>
                      <Tab label='Your score' buttonStyle={{backgroundColor: '#1251BA',height: '36px'}}>
                        <div style={{backgroundColor: 'white', padding: '10px'}}>
                          {this.props.thisUser.score ?
                            <div>
                        Signed up: 5 points<br/>
                      Number of friends: {this.props.thisUser.score.friend} points<br/>
                    Pledges signed up to: {this.props.thisUser.score.pledge} points<br/>
                  Impact of your pledges: {this.props.thisUser.score.pledgeImpact} points<br/>
                Popular threads: {this.props.thisUser.score.thread} points<br/>
              </div>
              : null}


                      </div>
                      </Tab>
                    </Tabs>
                  </div>

                </List>
                {/*}<RaisedButton label='Calculate my score' onTouchTap={this.handleScore}/>*/}
            </Card>

            <Card style={{marginTop: '20px'}}>
              <Subheader>Your badges</Subheader>
              <div style={{padding: '16px'}}>
              <Badges/>
              </div>
            </Card>
            {/*
            <Card style={{marginTop: '20px'}}>
              <Subheader>Your streaks</Subheader>
              <div style={{padding: '0px 16px 16px 16px'}}>
              <Streaks/>
              </div>
            </Card>
            */}
            <Dialog
              title='Can we post to Facebook for you?'
              modal={true}
              open={this.state.permissionOpen}
              onRequestClose={this.handlePermissionClose}
              actions={[
                <FlatButton label='No Thanks' onTouchTap={this.handlePermissionClose}/>
                , <FlatButton label='Yes, sure' onTouchTap={this.requestMorePermissions}/>
            ]}>
              <div>
                This will only ever post when a pledge you have joined has reached its target.
              </div>
            </Dialog>

            <Dialog
              modal={true}
              open={this.state.messengerPopup}
              onRequestClose={this.handleMessengerClose.bind(this)}
              actions={[
                <FlatButton
                  label="No Thanks"
                  primary={true}
                  onTouchTap={this.handleClose.bind(this)}
                />
            ]}
              >
              <Subheader style={{paddingLeft: '0px', textAlign: 'center'}}>
                Don't forget about your pledges
              </Subheader>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <div style={{marginLeft: '85px', marginBottom: '20px', marginTop: '5px'}}>
              <MessengerPlugin
                appId={Meteor.settings.public.FacebookAppId}
                pageId={Meteor.settings.public.FacebookPageId}
                size='large'
                color='blue'
                passthroughParams={Meteor.userId()}
              />
            </div>

          </div>
            </Dialog>
          </div> }
          </DocumentTitle>

      </div>
    )
  }
}

Profile.propTypes = {
  users: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  thisUser: PropTypes.object.isRequired,
};

export default createContainer(() => {
  const subscriptionHandler = Meteor.subscribe("userData");
  const scoreHandler = Meteor.subscribe("userScores");

  return {
    loading: !subscriptionHandler.ready()  || !scoreHandler.ready(),
    users: Meteor.users.find({}).fetch(),
    thisUser: Meteor.users.findOne({_id: Meteor.userId()}, {fields: {visits: 0, suggestions: 0, influence: 0, skills: 0}}),
    userScores: Meteor.users.find({}, {sort: {'score.total': -1}}, {fields: {'profile': 1, 'email.address':1, score: 1, 'services.facebook.id': 1}}).fetch(),
  };
}, Profile);
