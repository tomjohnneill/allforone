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
import SocialLeaderboard from '/imports/ui/components/socialleaderboard.jsx';
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

export class TestyPage extends Component {
  constructor(props) {
    super(props);
      this.state = {pledgeAdded: true, permissionOpen: false}

  }

  handleNewPledge = (e) => {
    e.preventDefault()
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

  componentDidMount() {
      console.log('Timeout should be loading')
      if (this.props.justAddedPledge !== undefined && this.props.user && this.props.user.OneSignalUserId === undefined)
        {this.carousel = window.setTimeout(this.handleNotificationsClick, 15000)}
    }

    componentWillUnmount() {
      if (this.props.justAddedPledge !== undefined)
      {clearTimeout(this.carousel)}
    }

  handleMoreDetail(id, slug, event) {
    event.preventDefault()
    browserHistory.push(`/pages/pledges/${ slug }/${id}`)
  }

  handleScore = (e) => {
    e.preventDefault()
    Meteor.call('recalculateScore', Meteor.userId())
  }



  handleNotificationsClick = (e) => {
    if (e) {e.preventDefault()}
    var OneSignal = window.OneSignal

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

  getUserID = (e) => {
    e.preventDefault()
    Meteor.call('sendFriendPledgeSignalNotification', Meteor.userId())
}

  handleFacebookNotification = (e) => {
    Meteor.call('sendFBMessage', Meteor.userId())
  }

  handleSendAPI = (e) => {
    Meteor.call('sendTextMessage', this.props.thisUser.userMessengerId, 'Hello there')
  }

  handleIndiegogoSearch = (e) => {
    var i

    var interestLength = this.props.user.interests
    for (i=0;i< interestLength;i++) {
      Meteor.call('indiegogoSearch', this.props.user.interests[i])
    }

  }

  handleEmails = (e) => {
    e.preventDefault()
    Meteor.call('sendPledgeFullEmail')
  }

  render () {
    if (this.props.justAddedPledge !== undefined && this.props.user && this.props.user.OneSignalUserId === undefined)
    {clearTimeout(this.carousel)}


    if (this.props.loading === false) {
    var justAddedPledgeCollection = undefined
    if (this.props.justAddedPledgeId !== undefined) {
      console.log('looking for a pledge in documents')
      justAddedPledgeCollection = this.props.pledges.find(pledge => (pledge._id === this.props.justAddedPledgeId))
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
              <Subheader>Notifications</Subheader>

              <FlatButton label='Run indiegogo' onTouchTap={this.handleIndiegogoSearch}/>

                <ListItem
                  onTouchTap={this.handleNotificationsClick}
                  primaryText="Tell me when my pledges start"
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
                    primaryText="Tell my friends when my pledge is about to start"
                    leftAvatar={<IconButton
                      style={{padding: '0px'}}
                      iconStyle={{height: '36px', width: '36px'}}
                      >
                      <Publish
                       color={grey500}
                      />
                      </IconButton>
                      }
                    />

                  {this.props.thisUser && !this.props.thisUser.userMessengerId ?
                    <div>
                <Subheader>Sent alerts to my Facebook</Subheader>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <div style={{marginLeft: '85px', marginBottom: '20px', marginTop: '5px'}}>
                <MessengerPlugin
                  appId={Meteor.settings.public.FacebookAppId}
                  pageId={Meteor.settings.public.FacebookPageId}
                  size='large'
                  color='white'
                  passthroughParams={Meteor.userId()}
                />
              </div>

            </div>
            </div> : null}


                <FlatButton label='Send to Messenger' onTouchTap={this.handleFacebookNotification}/>
                <FlatButton label='Messenger second method' onTouchTap={this.handleSendAPI}/>
                <FlatButton label='Send emails' onTouchTap={this.handleEmails}/>

            </Card>

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
                The stuff that goes here
              </div>
            </Dialog>
            <Dialog
              title="Well done - now share your pledge!"
              modal={true}
              open={this.props.justAddedPledge !== '' && this.props.justAddedPledge
                !== undefined && this.state.pledgeAdded !== false}
              onRequestClose={this.handleClose.bind(this)}
              actions={
                this.props.justAddedPledge ?
                [

                <div style={{display: 'flex', justifyContent: 'center'}}>
                <FacebookShareButton
                  style={{cursor: 'pointer'}}
                  children = {<div>
                    <FacebookIcon size={36} round={true}/>


                  </div>}
                  url = {'https://www.allforone.io/pages/pledges/' + this.props.justAddedPledge + '/' + this.props.justAddedPledgeId}
                  title={"What if " + justAddedPledgeTarget +" people decided to change the world?"} description={"I just agreed to "+ justAddedPledgeTitle.toLowerCase() +  " for " + justAddedPledgeDuration.toLowerCase() + " - as long as " + (justAddedPledgeTarget-justAddedPledgeCollection.pledgeCount).toString() + " more people do the same. Care to join me?"}
                  picture = {justAddedPledgePicture ? justAddedPledgePicture : '/images/splash.jpg'}
                  />
                <div style={{width: '10px'}}></div>
                <TwitterShareButton
                  style={{cursor: 'pointer'}}
                  children = {<TwitterIcon size={36} round={true}/>}
                  url = {'https://www.allforone.io/pages/pledges/' + this.props.justAddedPledge + '/' + this.props.justAddedPledgeId}
                  title={"If another " + (justAddedPledgeTarget-justAddedPledgeCollection.pledgeCount).toString() + ' people join me, I pledge to' + justAddedPledgeTitle.toLowerCase() +  " for " + justAddedPledgeDuration.toLowerCase() }

                  />
              </div>,
                  <FlatButton
                  label="No Thanks"
                  primary={true}
                  onTouchTap={this.handleClose.bind(this)}
                />
            ] : null}
              >
              1) Unless this pledge reaches its target, no one is going to do anything<br/>
            2) If you share it with your friends, you are much more likely to complete it<br/>
          3) It gets people talking about climate change, which we really need <br/>
            </Dialog>
          </div> }
          </DocumentTitle>

      </div>
    )
  }
}

TestyPage.propTypes = {
  users: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  pledges: PropTypes.array.isRequired,
  thisUser: PropTypes.object.isRequired,
};

export default createContainer(() => {
  const subscriptionHandler = Meteor.subscribe("userData");
  const pledgeHandler = Meteor.subscribe("myPledges");
  const scoreHandler = Meteor.subscribe("userScores");

  return {
    loading: !subscriptionHandler.ready() || !pledgeHandler.ready() || !scoreHandler.ready(),
    users: Meteor.users.find({}).fetch(),
    thisUser: Meteor.users.findOne({_id: Meteor.userId()}),
    pledges: Pledges.find().fetch(),
    userScores: Meteor.users.find({}, {sort: {'score.total': -1}}).fetch(),
  };
}, TestyPage);
