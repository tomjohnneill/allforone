import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
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
import {
  ShareButtons,
  ShareCounts,
  generateShareIcon
} from 'react-share';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import {Link, browserHistory} from 'react-router';
import {Pledges} from '/imports/api/pledges.js';
import Leaderboard from '/imports/ui/components/leaderboard.jsx';
import SocialLeaderboard from '/imports/ui/components/socialleaderboard.jsx';
import Streaks from '/imports/ui/components/streaks.jsx';
import Badges from '/imports/ui/components/badges.jsx'
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


const FacebookIcon = generateShareIcon('facebook');
const TwitterIcon = generateShareIcon('twitter');
const TelegramIcon = generateShareIcon('telegram');
const WhatsappIcon = generateShareIcon('whatsapp');
const GooglePlusIcon = generateShareIcon('google');
const LinkedinIcon = generateShareIcon('linkedin');
const PinterestIcon = generateShareIcon('pinterest');
const VKIcon = generateShareIcon('vk');
const OKIcon = generateShareIcon('ok');

const {
  FacebookShareButton,
  GooglePlusShareButton,
  LinkedinShareButton,
  TwitterShareButton,
  TelegramShareButton,
  WhatsappShareButton,
  PinterestShareButton,
  VKShareButton,
  OKShareButton
} = ShareButtons;

const {
  FacebookShareCount,
  GooglePlusShareCount,
  LinkedinShareCount,
  PinterestShareCount,
  VKShareCount,
  OKShareCount
} = ShareCounts;

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
    Meteor.call('sendTextMessage', '117077928875496', 'Hello there')
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

                {/*
                <Subheader>Sent alerts to my Facebook</Subheader>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <div style={{marginLeft: '85px', marginBottom: '20px', marginTop: '5px'}}>
                <MessengerPlugin
                  appId={Meteor.settings.public.FacebookAppId}
                  pageId={Meteor.settings.public.FacebookPageId}
                  size='large'
                  color='white'
                />
              </div>

              </div>
              <FlatButton label='FB message' onTouchTap={this.handleFacebookNotification}/>
                */}


            </Card>

            <Card style={{marginTop: '20px'}}>
              <Subheader>Your pledges</Subheader>
                <List>
                  <div style={{display: 'flex'}}>


                  </div>

                    <ListItem
                      primaryText='Committed Pledges'
                      primaryTogglesNestedList={true}
                      style={{backgroundColor: grey200}}

                      nestedListStyle={{marginLeft: '0px'}}
                      nestedItems={
                        this.props.pledges.map((pledge) => (
                          (pledge.title !== 'Untitled Pledge' && pledge.pledgedUsers.includes(Meteor.userId())) ?
                    <ListItem
                      primaryText={pledge.title}
                      secondaryText={pledge.duration === 'Once' ? 'Just Once' : 'For ' + pledge.duration}
                      leftAvatar={pledge.coverPhoto === undefined ? <Avatar>{pledge.title.charAt(0)}</Avatar> : <Avatar src={pledge.coverPhoto}/>}
                      primaryTogglesNestedList={true}
                      style={{marginLeft: '0px'}}

                      innerDivStyle={{marginLeft: '0px'}}
                      nestedItems={[
                        <ListItem

                          innerDivStyle={{marginLeft: '0px'}}
                          children={
                          <div>
                            <div onTouchTap={this.handleMoreDetail.bind(this, pledge._id, pledge.slug)}>
                            <LinearProgress color={amber500} mode="determinate" value={pledge.pledgedUsers.length/pledge.target*100} />

                            <div style={styles.cardTitle}>
                              <div style={styles.bigTitle}>
                                Commitments:
                              <div style={styles.smallTitle}>
                                <div style={styles.currentCommitments}><b>{pledge.pledgedUsers.length}</b> people</div>
                                <div style={styles.targetCommitments}>out of {pledge.target}</div>
                              </div>
                              </div>
                              <div style={styles.bigTitle}>
                                Deadline:
                                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                  {pledge.deadline ? dateDiffInDays(new Date(),pledge.deadline) : 'Some'} days
                                </div>
                              </div>
                            </div>
                            </div>


                            <Subheader style={{ marginTop: '10px'}}>Share your pledge</Subheader>


                              <div style={{display: 'flex', justifyContent: 'center', marginLeft: '-34px'}}>

                                  <FacebookShareButton
                                    style={{cursor: 'pointer'}}
                                    children = {<div>
                                      <FacebookIcon size={36} round={true}/>
                                  </div>}
                                    url = {'https://www.allforone.io/pages/pledges/' + pledge.slug + '/' + pledge._id}
                                    title={"What if " + pledge.target +" people decided to change the world?"} description={"I just agreed to " + pledge.title + " for " + pledge.duration + " - as long as " + (pledge.target-pledge.pledgedUsers.length).toString() + " more people do the same. Care to join me?"}
                                    picture = {pledge.coverPhoto ? pledge.coverPhoto : 'https://www.allforone.io/splash.jpg'}
                                    />
                                  <div style={{width: '10px'}}></div>
                                  <TwitterShareButton
                                    style={{cursor: 'pointer'}}
                                    children = {<TwitterIcon size={36} round={true}/>}
                                    url = {'https://www.allforone.io/pages/pledges/' + pledge.slug + '/' + pledge._id}
                                    title={"If another " + (pledge.target-pledge.pledgedUsers.length).toString() + ' people join me, I am ' + pledge.title + ' for ' + pledge.duration }
                                    />
                                </div>
                            </div>


                        }/>
                      ]}
                    />
                 : null
               ))}/>

                    <ListItem
                      primaryText='Created Pledges'
                      primaryTogglesNestedList={true}
                      style={{backgroundColor: grey200}}
                      nestedListStyle={{marginLeft: '0px'}}
                      nestedItems={
                    this.props.pledges.map((pledge) => (
                      (pledge.creatorId === Meteor.userId()) ?
                  <ListItem
                        primaryText={pledge.title}
                        secondaryText={pledge.duration === 'Once' ? 'Just Once' : 'For ' + pledge.duration}
                        leftAvatar={pledge.coverPhoto === undefined ? <Avatar>{pledge.title.charAt(0)}</Avatar> : <Avatar src={pledge.coverPhoto}/>}
                        primaryTogglesNestedList={true}
                        key={pledge.title}
                        innerDivStyle={{marginLeft: '0px'}}
                        nestedItems={[
                          <ListItem

                            innerDivStyle={{marginLeft: '0px'}}
                            key={pledge._id + pledge.slug}
                            children={
                            <div>
                            <div onTouchTap={this.handleMoreDetail.bind(this, pledge._id, pledge.slug)}>
                              <LinearProgress color={amber500} mode="determinate" value={pledge.pledgedUsers.length/pledge.target*100} />

                              <div style={styles.cardTitle}>
                                <div style={styles.bigTitle}>
                                  Commitments:
                                <div style={styles.smallTitle}>
                                  <div style={styles.currentCommitments}><b>{pledge.pledgedUsers.length}</b> people</div>
                                  <div style={styles.targetCommitments}>out of {pledge.target}</div>
                                </div>
                                </div>
                                <div style={styles.bigTitle}>
                                  Deadline:
                                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                    {pledge.deadline ? dateDiffInDays(new Date(),pledge.deadline) : 'Some'} days
                                  </div>
                                </div>
                              </div>

                            </div>
                              <Subheader style={{marginLeft: '-34px', marginTop: '10px'}}>Share your pledge</Subheader>


                                <div style={{display: 'flex', justifyContent: 'center', marginLeft: '-34px'}}>
                                  <FacebookShareButton
                                    style={{cursor: 'pointer'}}
                                    children = {<div>
                                      <FacebookIcon size={36} round={true}/>
                                  </div>}
                                    url = {'https://www.allforone.io/pages/pledges/' + pledge.slug + '/' + pledge._id}
                                    title={"What if " + pledge.target +" people decided to change the world?"} description={"I just agreed to " + pledge.title + " for " + pledge.duration + " - as long as " + (pledge.target-pledge.pledgedUsers.length).toString() + " more people do the same. Care to join me?"}
                                    picture = {pledge.coverPhoto ? pledge.coverPhoto : 'https://www.allforone.io/splash.jpg'}
                                    />
                                  <div style={{width: '10px'}}></div>
                                  <TwitterShareButton
                                    style={{cursor: 'pointer'}}
                                    children = {<TwitterIcon size={36} round={true}/>}
                                    url = {'https://www.allforone.io/pages/pledges/' + pledge.slug + '/' + pledge._id}
                                    title={"If another " + (pledge.target-pledge.pledgedUsers.length).toString() + ' people join me, I am ' + pledge.title + ' for ' + pledge.duration }
                                    />
                                </div>
                              </div>


                          }/>
                        ]}
                      />
                    : null ) )}
                    />
                  <div style={{height: '16px'}}/>
                  <FlatButton label='Create New Pledge' onTouchTap={this.handleNewPledge} secondary={true} fullWidth={true}/>
                  </List>
                  </Card>
                  <Card style={{marginTop: '20px'}}>
                <List>
                                    <Subheader>Your friends</Subheader>
                  <div style={{display: 'flex',  backgroundColor: grey100
                    , paddingTop: '20px', paddingLeft: '20px', paddingRight: '20px', paddingBottom: '40px', fontSize: '14px', width: '100%', boxSizing: 'border-box', overflowX: 'scroll'}}>
                    {this.props.thisUser.friends ?

                      this.props.thisUser.friends.map((friend) => (


                        <IconButton tooltip={friend.first_name + ' ' + friend.last_name}
                          style={{height: '40px', width: '40px', padding: '0px'}}
                        iconStyle={{padding: '0px'}}>
                        <Avatar key={friend.id} src={friend.picture.data.url} style={{marginLeft: '-10px'}}/>
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
                    <Tabs tabItemContainerStyle={{backgroundColor: '#006699', height: '36px'}} contentContainerStyle={{backgroundColor: grey100, padding: '10px'}}>
                      <Tab label='Your friends' buttonStyle={{backgroundColor: '#006699',height: '36px'}}>
                        <SocialLeaderboard/>
                      </Tab>
                      <Tab label='Everyone' buttonStyle={{backgroundColor: '#006699',height: '36px'}}>
                        <Leaderboard/>
                      </Tab>
                      <Tab label='Your score' buttonStyle={{backgroundColor: '#006699',height: '36px'}}>
                        <div style={{backgroundColor: 'white', padding: '10px'}}>
                        Signed up: 5 points<br/>
                      Number of friends: {this.props.thisUser.score.friend} points<br/>
                    Pledges signed up to: {this.props.thisUser.score.pledge} points<br/>
                  Impact of your pledges: {this.props.thisUser.score.pledgeImpact} points<br/>
                Popular threads: {this.props.thisUser.score.thread} points<br/>
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

            <Card style={{marginTop: '20px'}}>
              <Subheader>Your streaks</Subheader>
              <div style={{padding: '0px 16px 16px 16px'}}>
              <Streaks/>
              </div>
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
                This will only ever post when a pledge you have joined has reached its target.
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

Profile.propTypes = {
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
}, Profile);
