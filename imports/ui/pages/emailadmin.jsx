import React , {PropTypes} from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import {grey200, grey500, grey100, amber500} from 'material-ui/styles/colors'
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import LinearProgress from 'material-ui/LinearProgress';
import {List, ListItem} from 'material-ui/List';
import Toggle from 'material-ui/Toggle';
import Divider from 'material-ui/Divider';
import {Tabs, Tab} from 'material-ui/Tabs';
import { Session } from 'meteor/session';
import FacebookProvider, { Comments } from 'react-facebook';
import Dialog from 'material-ui/Dialog';
import {Link, browserHistory} from 'react-router';
import {Pledges} from '/imports/api/pledges.js';
import ArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import IconButton from 'material-ui/IconButton';
import Subheader from 'material-ui/Subheader';
import {
  ShareButtons,
  ShareCounts,
  generateShareIcon
} from 'react-share';
const FacebookIcon = generateShareIcon('facebook');
const TwitterIcon = generateShareIcon('twitter');
import muiThemeable from 'material-ui/styles/muiThemeable';
import Edit from 'material-ui/svg-icons/image/edit';
import DocumentTitle from 'react-document-title';
import Avatar from 'material-ui/Avatar';
import FlatButton from 'material-ui/FlatButton';
import CircularProgress from 'material-ui/CircularProgress';
import {Helmet} from "react-helmet";
import { DocHead } from 'meteor/kadira:dochead';

const {
  FacebookShareButton,
  TwitterShareButton,
} = ShareButtons;


const styles = {
  box: {
    marginTop: '10px',
    marginBottom: '10px',
    padding: '10px'
  },
}


export class EmailAdmin extends React.Component {
  constructor(props) {
    super(props);
    this.state={pledges: []}
  }

  handleAddPledge(id, e, input)  {
    var pledges = this.state.pledges
    if (input) {
      pledges.push(id)
    } else {
      pledges.splice(pledges.indexOf(id), 1)
    }
    this.setState({pledges: pledges})
  }

  handleSendEmail = (e) => {
    e.preventDefault()
    Meteor.call('sendMorePledgesEmail', this.state.pledges, (error, response) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert('Email Queued', 'success');
      }
    })
  }


  render () {
    console.log(this.state)
    return (
      <div>


        {this.props.loading ? <div style={{height: '80vh', width: '100%',
                                              display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <CircularProgress/>
        </div> :
          <DocumentTitle title={this.props.pledge.title}>
        <div style={styles.box}>
          <List>
            <Subheader>Pledges</Subheader>
            {this.props.pledges.map((pledge) => (
              <ListItem primaryText={pledge.title} rightToggle={<Toggle onToggle={this.handleAddPledge.bind(this, pledge._id)}/>}/>
            ))}
          </List>
          <div style={{height: '40px'}}/>
          <FlatButton label='Send Email' onTouchTap={this.handleSendEmail}/>
      </div>
    </DocumentTitle>}
  </div>
    )
  }
}

EmailAdmin.propTypes = {
  pledge: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
}

export default createContainer(() => {
  const userHandler = Meteor.subscribe('userData');
  const userFriends = Meteor.subscribe('userFriends');
  const subscriptionHandler = Meteor.subscribe("pledgeList");

  return {
    loading: !subscriptionHandler.ready() || !userHandler.ready(),
    pledge: Pledges.find().fetch(),
    user: Meteor.users.find({}),
    pledges: Pledges.find({title: {$ne: 'Untitled Pledge'}, deadline: { $gte : new Date()}}, {sort: {pledgeCount: -1}}).fetch(),
  }
}, EmailAdmin)
