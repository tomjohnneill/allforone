import React, { Component, PropTypes } from 'react';
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
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import {Link, browserHistory} from 'react-router';
import {Pledges} from '/imports/api/pledges.js';
import MoreHoriz from 'material-ui/svg-icons/navigation/more-horiz';
import CircularProgress from 'material-ui/CircularProgress';

export class Leaderboard extends Component {
  constructor(props) {
    super(props);


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
    var position = this.props.userScores.map(function(x) {return x._id; }).indexOf(Meteor.userId())
    for (var user in this.props.userScores) {
      if (user < 10) {
        topRankings.push(
            <ListItem
              key={user}
              style={{backgroundColor: 'white'}}
              primaryText={(this.props.userScores[user].score ? this.props.userScores[user].score.total : 'Unknown').toString()  + ' points'}
              leftAvatar={<Avatar
                backgroundColor={this.getColor(Number(user))}
                >{(Number(user) + 1).toString()}</Avatar>}
              rightAvatar={<Avatar src={this.props.userScores[user].profile.picture}/>}
              />
          )
      } else if (user === position - 1 || user === position || user === position + 1) {
        userRankings.push(
          <ListItem
            key={user}
            style={{backgroundColor: 'white'}}
            primaryText={(this.props.userScores[user].score ? this.props.userScores[user].score.total : 'Unknown').toString()  + ' points'}
            leftAvatar={<Avatar
              backgroundColor={'#6b88b9'}
              >{(Number(user) + 1).toString()}</Avatar>}
            rightAvatar={<Avatar src={this.props.userScores[user].profile.picture}/>}
            />
        )
      }
    }
    return (
      <div>
        {topRankings}
        <div style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
        <MoreHoriz style={{height: 36, width: 36}}/>
        </div>
        {position > 3 ?
        <div>
          {userRankings}
        </div>
         : null}
      </div>
    )
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

Leaderboard.propTypes = {
  loading: PropTypes.bool.isRequired,
  userScores: PropTypes.array.isRequired,
};

export default createContainer(() => {

  const scoreHandler = Meteor.subscribe("userScores");

  return {
    loading:  !scoreHandler.ready(),
    userScores: Meteor.users.find({}, {sort: {'score.total': -1}}).fetch(),
  };
}, Leaderboard);
