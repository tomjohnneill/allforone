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
import {Threads} from '/imports/api/threads.js';
import MoreHoriz from 'material-ui/svg-icons/navigation/more-horiz';
import CircularProgress from 'material-ui/CircularProgress';
import Lock from 'material-ui/svg-icons/action/lock';
import AssignmentTurnedIn from 'material-ui/svg-icons/action/assignment-turned-in';
import Badge from 'material-ui/Badge'
import BorderColor from 'material-ui/svg-icons/editor/border-color'
import Comment from 'material-ui/svg-icons/communication/comment';
import Popover from 'material-ui/Popover'

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

export class Badges extends Component {
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
    console.log(this.props.myCreatedPledges)
    var primary = '#006699'
    var secondary = '#996699'
    var user = this.props.user
    var createdPledges = []

    var threadLength = 0
    var threadsCreated = 0
    if (user.subscribedThreads) {
      threadLength = user.subscribedThreads.length
      for (var i in user.subscribedThreads) {
        var threadSub = Threads.findOne({_id: user.subscribedThreads[i]})
        if (threadSub.creatorId === Meteor.userId()) {
          threadsCreated += 0
        }
      }
    }


    return (
      <div>
        <Avatar onTouchTap ={this.handleBadgeClick.bind(this, 'Signed up to one pledge')} style={styles.avatar}>
          {this.props.user.committedPledges ?  <AssignmentTurnedIn color={primary}/> : <AssignmentTurnedIn color={primary} style={styles.iconOff}/>}
        </Avatar>
        <Avatar onTouchTap ={this.handleBadgeClick.bind(this, 'Signed up to 5 pledges')} style={styles.avatar}>
          {this.props.user.committedPledges && this.props.user.committedPledges.length > 4 ?
            <AssignmentTurnedIn color={secondary}/>
           :
            <AssignmentTurnedIn style={styles.iconOff} color={secondary}/>
          }
        </Avatar>
        <Avatar  onTouchTap ={this.handleBadgeClick.bind(this, 'Signed up to 10 pledges')} style={styles.avatar}>
          {this.props.user.committedPledges && this.props.user.committedPledges.length > 9 ?
            <AssignmentTurnedIn color={amber500}/>
           :
            <AssignmentTurnedIn style={styles.iconOff} color={amber500}/>
          }
        </Avatar>
        <Avatar onTouchTap ={this.handleBadgeClick.bind(this, 'Created one pledge')} style={styles.avatar}>
          {this.props.myCreatedPledges  ?
            <BorderColor color={primary}/>
           :
            <BorderColor  style={styles.iconOff} color={primary}/>
          }
        </Avatar>
        <Avatar onTouchTap ={this.handleBadgeClick.bind(this, 'Created 5 pledges')} style={styles.avatar}>
          {this.props.myCreatedPledges && this.props.myCreatedPledges.length >4 ?
            <BorderColor color={secondary}/>
           :
            <BorderColor style={styles.iconOff} color={secondary}/>
          }
        </Avatar>
        <Avatar onTouchTap ={this.handleBadgeClick.bind(this, 'Created 10 pledges')} style={styles.avatar}>
          {this.props.myCreatedPledges && this.props.myCreatedPledges.length > 9 ?
            <BorderColor color={amber500}/>
           :
            <BorderColor style={styles.iconOff} color={amber500}/>
          }
        </Avatar>

        <Avatar style={styles.avatar}>
          <Lock/>
        </Avatar>
        <Avatar style={styles.avatar}>
          <Lock/>
        </Avatar>
        <Avatar style={styles.avatar}>
          <Lock/>
        </Avatar>
        <Avatar style={styles.avatar}>
          <Lock/>
        </Avatar>
        <Avatar style={styles.avatar}>
          <Lock/>
        </Avatar>
        <Avatar style={styles.avatar}>
          <Lock/>
        </Avatar>
        <Avatar style={styles.avatar}>
          <Lock/>
        </Avatar>




          <Popover
              open={this.state.open}

              anchorEl={this.state.anchorEl}
              anchorOrigin={{horizontal: 'middle', vertical: 'bottom'}}
              targetOrigin={{horizontal: 'middle', vertical: 'top'}}
              onRequestClose={this.handleRequestClose}
            >
            <div style={{padding: '5px', backgroundColor: grey200, margin: '5px'}}>
                {this.state.text}
            </div>
          </Popover>
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

Badges.propTypes = {
  loading: PropTypes.bool.isRequired,
  user: PropTypes.object.isRequired,
  myCreatedPledges: PropTypes.array.isRequred,
  threads: PropTypes.array.isRequired
};

export default createContainer(() => {

  const scoreHandler = Meteor.subscribe("userData");
  const threadHandler = Meteor.subscribe("threadComments");

  return {
    loading:  !scoreHandler.ready() || !threadHandler.ready(),
    user:  Meteor.users.findOne({_id: Meteor.userId()}),
    myCreatedPledges: Pledges.find({creatorId: Meteor.userId()}).fetch(),
    threads: Threads.find().fetch()
  };
}, Badges);
