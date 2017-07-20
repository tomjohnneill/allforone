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
import MoreHoriz from 'material-ui/svg-icons/navigation/more-horiz'
import IconButton from 'material-ui/IconButton'
import Refresh from 'material-ui/svg-icons/navigation/refresh';
import CircularProgress from 'material-ui/CircularProgress';

export class SocialLeaderboard extends Component {
  constructor(props) {
    super(props);


  }

  handleFriendClick(_id, e) {
    e.preventDefault()
    var friend = Meteor.users.findOne({'services.facebook.id': _id})
    browserHistory.push('/profile/' + friend._id)
  }

  getColor(user) {

    switch(user) {
      case 0:
        return '#D9A441'
      case 2:
        return '#965A38'
      default:
        return grey400
    }
  }

  renderBoard() {
    var topRankings = [,]
    var userRankings = [,]
    var thisUser = Meteor.users.findOne({_id: Meteor.userId()})
    var friendList = [,]
    for (var friend in thisUser.friends) {
      friendList.push(thisUser.friends[friend].id)
    }
    var ranking = 0
    for (var user in this.props.userScores) {

      if (friendList.includes(this.props.userScores[user].services.facebook.id) ||
      this.props.userScores[user]._id === Meteor.userId()) {

        ranking += 1
        topRankings.push(
            <ListItem
              key={user}
              style={{backgroundColor: 'white'}}
              primaryText={(this.props.userScores[user].score ? this.props.userScores[user].score.total : 'Unknown') + ' points'}
              leftAvatar={<Avatar
                backgroundColor={'#6b88b9'}
                >{(ranking).toString()}</Avatar>}
              rightAvatar={<IconButton style={{height: '40px', width: '40px', padding: '0px'}}
              iconStyle={{padding: '0px'}}
              tooltipStyles={{zIndex: '15'}}
              onTouchTap = {this.handleFriendClick.bind(this, this.props.userScores[user].services.facebook.id)}
              tooltip={this.props.userScores[user].profile.name} >
              <Avatar src={this.props.userScores[user].profile.picture}/>
                            </IconButton>}
              />
          )
      }
    }
    return (
      <div>
        {this.props.userScores.length > 1 ?
          <div>
        {topRankings}

        </div> :
        <div style={{textAlign: 'center'}}>
          You don't have any friends. <br/><br/>
        So in a sense, you're winning

      </div>}
      <div style={{justifyContent: 'center', display: 'flex'}}>
        <IconButton onTouchTap={this.handleRefresh}>
          <Refresh/>
        </IconButton>
      </div>
      </div>
    )
  }

  handleRefresh = (e) => {
    e.preventDefault();
    Meteor.call('findFriends')
    Meteor.call('recalculateScore', Meteor.userId())
    Meteor.call('triggerSocialScoreCalculate')
    this.forceUpdate()
  }

  render() {


    return(
      <div>
      {this.props.loading === true ? <div style={{height: '80vh', width: '100%',
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

SocialLeaderboard.propTypes = {
  loading: PropTypes.bool.isRequired,
  userScores: PropTypes.array.isRequired,
};

export default createContainer(() => {

  const scoreHandler = Meteor.subscribe("userScores");
  const subscriptionHandler = Meteor.subscribe("userData");

  return {
    loading:  !scoreHandler.ready(),
    userScores: Meteor.users.find({}, {sort: {'score.total': -1}}).fetch(),
    thisUser: Meteor.users.findOne({_id: Meteor.userId()})
  };
}, SocialLeaderboard);
