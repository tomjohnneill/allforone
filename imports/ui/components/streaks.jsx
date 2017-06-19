import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import {grey200, grey500, grey100, amber500, grey400} from 'material-ui/styles/colors'
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
import MoreHoriz from 'material-ui/svg-icons/navigation/more-horiz';
import CircularProgress from 'material-ui/CircularProgress';
import Lock from 'material-ui/svg-icons/action/lock';
import AssignmentTurnedIn from 'material-ui/svg-icons/action/assignment-turned-in';
import Badge from 'material-ui/Badge'
import BorderColor from 'material-ui/svg-icons/editor/border-color'
import Comment from 'material-ui/svg-icons/communication/comment';
import Popover from 'material-ui/Popover';
import InfoIcon from '/imports/ui/components/infoicon.jsx';

const styles = {
  iconOff: {
  filter:  'gray', WebkitFilter:  'grayscale(1)'
    , opacity:  '0.2'
},
  avatar: {
    padding: '10px',
    margin: '10px',
    backgroundColor: grey200
  }
}

export class Streaks extends Component {
  constructor(props) {
    super(props);

    this.state = {open: false, text: ''}
  }

  handleBadgeClick(text, e) {
    e.preventDefault()
    this.handleRequestClose
    this.setState({open: true,
    anchorEl: e.currentTarget, text: text})
  }

  handleRequestClose = () => {
     this.setState({
       open: false, text: ''
     });
   };


  renderBoard() {
    var primary = '#006699'
    var secondary = '#996699'
    var user = this.props.user

    var visitDates = []
    var j = 0
    var streak = 0
    var i
    if (this.props.user.visits) {
      var visits = this.props.user.visits
      for (i=visits.length-1; i > -1; i--) {
        var visitDate = visits[i].setHours(0,0,0,0)
        if (!visitDates.includes(visitDate)) {
          visitDates.push(visitDate)
          if (j > 0 && Math.abs(visitDates[j] - visitDates[j-1]) !== 1000 * 60 * 60 * 24) {
            streak = j + 1
            break;
          }
          j += 1
        }
        if (i === 0) {
          streak = j
          break;
        }
      }
    }

    var FriendProgressStreaks=[]
    var friends = this.props.user.friends
    var now = new Date()
    if (friends) {
      for (var k in friends) {
        var fbId = friends[k].id
        console.log(fbId)
        var friendUser = Meteor.users.findOne({'services.facebook.id': fbId})
        var friendVisitDates = []
        var m = 0
        var friendStreak = 0
        if (friendUser && friendUser.visits) {
          var friendVisits = friendUser.visits
          var n
          for (n=friendVisits.length-1; n > -1; n--) {
            var friendVisitDate = friendVisits[n].setHours(0,0,0,0)
            if (n  === friendVisits.length-1 && Math.abs(visitDates[n] - now) > 1000 * 60 * 60 * 24) {
              friendStreak = 0;
              break;
            }
            if (!friendVisitDates.includes(friendVisitDate)) {
              friendVisitDates.push(friendVisitDate)
              if (m > 0 && Math.abs(visitDates[m] - visitDates[m-1]) !== 1000 * 60 * 60 * 24) {
                friendStreak = m
                break;
              }
              if (m > streak) {
                friendStreak = streak
                break;
              }
              m += 1
            }
            if (n === 0) {
              friendStreak = m
              break;
            }
          }
          if (friendStreak > 0) {
          FriendProgressStreaks.push(
          <div>
            <ListItem
              leftAvatar={<Avatar src={friendUser.profile.picture}/>}
              primaryText={friendStreak + ' out of 10 days in a row'}/>
              <div style={{marginLeft: '72px', paddingBottom: '10px'}}>
            <LinearProgress
              mode="determinate"
              color={amber500}
              value = {friendStreak*10}
            />
          </div>
        </div>
          )
        }
        }


      }
      console.log(friendVisitDates)
    }

    return (
      <div>
        <div style={{display: 'flex'}}>
        <Subheader style={{width: '80%'}}>Your daily login</Subheader>
        <InfoIcon style={{float: 'right'}} text='Log in every day to build a streak and collect points'/>
        </div>
          <ListItem
          leftAvatar={<Avatar src={this.props.user.profile.picture}/>}
          primaryText={streak + ' out of 10 days in a row'}
          />
        <div style={{marginLeft: '72px', paddingBottom: '10px'}}>
          <LinearProgress
              mode="determinate"
              color={amber500}
              value = {streak*10}
              />
          </div>

          {FriendProgressStreaks === [] ? null :
          <div>
          <div style={{display: 'flex'}}>
          <Subheader style={{width: '80%'}}>Your friends and you</Subheader>
          <InfoIcon style={{float: 'right'}} text='If you and your friend log on every day, you both build your streaks'/>
          </div>
          {FriendProgressStreaks}

        </div>}
        </div>
    )
  }

  render() {


    return(
      <div>
      {this.props.loading === true ? <div style={{height: '20vh', width: '100%',
                                            display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
      <CircularProgress/>
      </div> :
      <div>
        {this.renderBoard()}
      </div>
      }
      </div>
    )
  }
}

Streaks.propTypes = {
  loading: PropTypes.bool.isRequired,
  user: PropTypes.object.isRequired,
  myCreatedPledges: PropTypes.array.isRequred,
  userScores: PropTypes.array.isRequired,
};

export default createContainer(() => {

  const userHandler = Meteor.subscribe("userData");
  const scoreHandler = Meteor.subscribe("userScores");

  return {
    loading:  !scoreHandler.ready() || !userHandler.ready(),
    user:  Meteor.users.findOne({_id: Meteor.userId()}),
    myCreatedPledges: Pledges.find({creatorId: Meteor.userId()}).fetch(),
    userScores: Meteor.users.find({}, {sort: {'score.total': -1}}).fetch(),
  };
}, Streaks);
