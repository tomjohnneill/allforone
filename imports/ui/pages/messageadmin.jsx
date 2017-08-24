import React , {PropTypes} from 'react';
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
import Dialog from 'material-ui/Dialog';
import {Link, browserHistory} from 'react-router';
import {Messages} from '/imports/api/messages.js';
import ArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import IconButton from 'material-ui/IconButton';
import Subheader from 'material-ui/Subheader';
import muiThemeable from 'material-ui/styles/muiThemeable';
import Edit from 'material-ui/svg-icons/image/edit';
import DocumentTitle from 'react-document-title';
import Avatar from 'material-ui/Avatar';
import FlatButton from 'material-ui/FlatButton';
import CircularProgress from 'material-ui/CircularProgress';
import {Helmet} from "react-helmet";
import { DocHead } from 'meteor/kadira:dochead';

const styles = {
  box: {
    marginTop: '10px',
    marginBottom: '10px',
    padding: '10px'
  },
}


export class MessageAdmin extends React.Component {
  constructor(props) {
    super(props);
    this.state={pledges: []}
    console.log(this.props)
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

  handleApproveMessages = (e) => {
    e.preventDefault()
    Meteor.call('approveMessage', this.state.pledges, (error, response) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert('Messages approved', 'success');
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
        Hello there
        </div> :
        <div style={styles.box}>
          <List>
            <Subheader>Messages</Subheader>
            {this.props.messages.map((message) => (
              <ListItem primaryText={message.text} rightToggle={<Toggle onToggle={this.handleAddPledge.bind(this, message._id)}/>}/>
            ))}
          </List>
          <div style={{height: '40px'}}/>
          <FlatButton label='Send Email' onTouchTap={this.handleApproveMessages}/>
      </div>}
  </div>
    )
  }
}

MessageAdmin.propTypes = {
  loading: PropTypes.bool.isRequired,
}

export default createContainer(() => {
  const subscriptionHandler = Meteor.subscribe("newBroadcastMessages");

  return {
    loading: !subscriptionHandler.ready() ,
    messages : Messages.find({}).fetch()
  }
}, MessageAdmin)
