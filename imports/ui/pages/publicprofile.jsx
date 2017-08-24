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
import {Suggestions} from '/imports/api/suggestions.js';
import Leaderboard from '/imports/ui/components/leaderboard.jsx';
import SocialLeaderboard from '/imports/ui/components/socialleaderboard.jsx';
import Badges from '/imports/ui/components/badges.jsx';
import SuggestionList from '/imports/ui/components/suggestionlist.jsx';
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
import ReviewList from '/imports/ui/components/reviews.jsx';

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

export class PublicProfile extends Component {
  constructor(props) {
    super(props);
      this.state = {pledgeAdded: true, permissionOpen: false}

  }

  handleNewPledge = (e) => {
    e.preventDefault()

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


  handleFriendClick(_id, e) {
    e.preventDefault()
    var friend = Meteor.users.findOne({'services.facebook.id': _id})
    browserHistory.push('/profile/' + friend._id)
  }


  render () {

    if (!this.props.loading) {
      console.log(this.props.suggestions)
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



            </Card>

            <Card style={{marginTop: '20px'}}>
                <ReviewList userId={this.props.params.userId}/>
                  </Card>

            <Card style={{marginTop: '20px'}}>
              <Subheader>Pledges</Subheader>
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
                      (pledge.creatorId === this.props.params.userId) ?
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
                          </div>



                          }/>
                        ]}
                      />
                    : null ) )}
                    />
                  <div style={{height: '16px'}}/>

                  </List>
                  </Card>

            <Card style={{marginTop: '20px'}}>
              <Subheader>Suggestions</Subheader>
                    <SuggestionList userId={this.props.params.userId}/>
                  </Card>

                  <Card style={{marginTop: '20px'}}>
                <List>
                                    <Subheader>Friends</Subheader>
                  <div style={{display: 'flex',  backgroundColor: grey100
                    , paddingTop: '20px', paddingLeft: '20px', paddingRight: '20px', paddingBottom: '40px', fontSize: '14px', width: '100%', boxSizing: 'border-box', overflowX: 'scroll'}}>
                    {this.props.thisUser.friends ?

                      this.props.thisUser.friends.map((friend) => (


                        <IconButton tooltip={friend.first_name + ' ' + friend.last_name}
                          style={{height: '40px', width: '40px', padding: '0px'}}
                        iconStyle={{padding: '0px'}}>
                        <Avatar key={friend.id} src={friend.picture.data.url}
                          onTouchTap={this.handleFriendClick.bind(this, friend.id)}
                          style={{marginLeft: '-10px'}}/>
                        </IconButton>

                      ))
                      :

                        <div>None of their friends have signed up</div>


                    }
                  </div>
                </List>
                </Card>





            <Card style={{marginTop: '20px'}}>
              <Subheader>Badges</Subheader>
              <div style={{padding: '16px'}}>
              <Badges otherUser = {this.props.params.userId}/>
              </div>
            </Card>



          </div> }
          </DocumentTitle>

      </div>
    )
  }
}

PublicProfile.propTypes = {
  users: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  pledges: PropTypes.array.isRequired,
  thisUser: PropTypes.object.isRequired,
  suggestions: PropTypes.array.isRequired,
};

export default createContainer(({params}) => {
  const subscriptionHandler = Meteor.subscribe("userData");
  const pledgeHandler = Meteor.subscribe("thesePledges", params.userId);
  const suggestionHandler = Meteor.subscribe("suggestions", params.userId)
  const scoreHandler = Meteor.subscribe("publicUser", params.userId);
  const allUserHandler = Meteor.subscribe("userScores");


  return {
    loading: !subscriptionHandler.ready() || !pledgeHandler.ready() || !scoreHandler.ready(),
    users: Meteor.users.find({}, {fields: {visits: 0, suggestions: 0, influence: 0, skills: 0}}).fetch(),
    thisUser: Meteor.users.findOne({_id: params.userId}, {fields: {visits: 0, suggestions: 0, influence: 0, skills: 0}}),
    pledges: Pledges.find().fetch(),
    suggestions: Suggestions.find().fetch(),
  };
}, PublicProfile);
