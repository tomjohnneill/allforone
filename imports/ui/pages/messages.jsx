import React , {PropTypes} from 'react';
import ReactDOM from 'react-dom'
import { createContainer } from 'meteor/react-meteor-data';
import {grey200, grey500, grey100, amber500, darkBlack, lightBlack, grey400} from 'material-ui/styles/colors';
import ArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import {Link, browserHistory} from 'react-router';
import IconButton from 'material-ui/IconButton';
import {Messages, Conversations} from '/imports/api/messages.js';
import {Pledges} from '/imports/api/pledges.js';
import {ListItem} from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import Send from 'material-ui/svg-icons/content/send';

var _ = lodash

const styles = {
  smallIcon: {
     width: 24,
     height: 40,
     color: grey500,
   },
   small: {
     width: 40,
     height: 40,
     padding: '0px'
   },
   width: {
  width: '60%',
  height: '100%',
  marginTop: '15px',
  },
  list: {
    float: 'left',
    width: '30%',
    overflowY: 'scroll',
  },
  box: {
    float: 'right',
    width: '70%',
    backgroundColor: grey200,
    paddingTop: '5px',
    paddingBottom: '5px',
    marginBottom: '56px',
    height: '500px',
    overflow: 'scroll',
    overflowX: 'hidden'
  },
  boxHeader : {
    float: 'right',
    width: '70%',
    backgroundColor: 'white',
    height: '48px',
    fontWeight: 'bold',
    alignItems: 'center',
    flexDirection: 'row',
    textAlign: 'left',
    paddingLeft: '20px',
    boxSizing: 'border-box',
    display: 'flex',
    backgroundColor: lightBlack,
    color: 'white',
    fontWeight: 'bold',
  },
  blocker: {
    width: '100%',
    float: 'left',
  },
  yourMessage: {
    float: 'right',
    marginLeft: '10px',
    marginRight:'10px',
    marginTop: '5px',
    marginBottom: '5px',
    maxWidth: '85%',
    backgroundColor: 'rgba(255,172,0,0.5)',
    textAlign: 'right',
    padding: '8px',
    borderRadius: '5px',
    wordWrap: 'break-word'
  },
  theirMessage: {
    float: 'left',
    marginLeft: '10px',
    marginRight:'10px',
    marginTop: '5px',
    marginBottom: '5px',
    maxWidth: '85%',
    backgroundColor: 'rgba(25,112,255,0.5)',
    padding: '8px',
    borderRadius: '5px',
    wordWrap: 'break-word'
  },
  area  : {
    width: '42%',
    minHeight: '50px',
    float: 'right',
    WebkitBoxSizing: 'border-box',
    MozBoxSizing: 'border-box',
    boxSizing: 'border-box',
    position: 'absolute',
    bottom: '0px',
    right: '20%',
    display: 'flex',
    alignItems: 'center',
    padding: '10px',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  textarea: {
    width: '100%',
    height: '28px',
    resize: 'none',
    borderRadius: '3px',
    fontFamily: 'Roboto, sans-serif',
    padding: '9.2px',
    marginRight: '10px',
    overflow: 'hidden',
  },
  button: {
    marginLeft: '10px',
    borderRadius: '3px',
    position: 'relative',
    float: 'right',
    marginRight: '10px',
    height: '28px',
    padding: '12px',
  },
  selected: {
    backgroundColor: grey400
  },
  dateText: {
    fontSize: '8px'
    , margin: '2px'
  }
}

function distinct(collection, field) {
  return _.uniq(collection.find({}, {
    sort: {[field]: 1}, fields: {[field]: 1}
  }).fetch().map(x => x[field]), true);
  }

function dateTimeFormat(now) {
  var time = now.getHours() + ':' + (now.getMinutes() < 10 ?
        '0' + now.getMinutes() : now.getMinutes())
  time = time + ((now.getHours()) >= 12 ? ' PM' : ' AM');
  var date = (now.getDate() < 10 ?
        '0' + now.getDate() : now.getDate()) + '/' +
        (now.getMonth() < 10 ?
              '0' + now.getMonth() : now.getMonth())
  return (
    date + ' ' + time
  )
}

export class Messaging extends React.Component {
  constructor(props) {
    super(props);
    this.state = {focused: ''}
  }

  handleConvoClick (id, group, sender, conversationId)  {
    this.setState({focused: {id: id, group: group, conversationId: conversationId}})
  }

  componentDidMount() {
  var objDiv = ReactDOM.findDOMNode(this.refs.box);
  console.log(objDiv)
  objDiv.scrollTop = objDiv.scrollHeight;
}

componentDidUpdate() {
  var objDiv = ReactDOM.findDOMNode(this.refs.box);
  console.log(objDiv)
  objDiv.scrollTop = objDiv.scrollHeight;
}

  handleBackClick = (e) => {
    e.preventDefault()
    this.setState({focused: ''})
  }

  handlePrint = (e) => {
    e.preventDefault()
    Meteor.call('returnConversations')
  }


  handleChange = (e, newValue) => {
    this.setState({message: newValue})
  }

  sendMessage = (e) => {
    Meteor.call('sendMessageReply', this.state.message, this.state.focused.id, this.state.focused.group, this.state.focused.conversationId)
    this.setState({message: ''})
  }

    handleKeyPress = (e) => {
      console.log('keypress')
      console.log(e.key)
      if (e.key === 'Enter') {
        e.preventDefault()
        this.sendMessage()
      }
    }


  render() {

    console.log(this.props)
    if (!this.props.loading) {
      console.log(this.props)
    }
    return (
      <div>
        {!this.props.loading && this.state.focused === '' ? this.props.conversations.map((obj) => (
          <ListItem leftAvatar={<Avatar src='/images/splash.jpg' />}
            primaryText={Pledges.findOne({_id: obj.pledgeId}) ? Pledges.findOne({_id: obj.pledgeId}).title + ' - ' + obj.group : ''}
            secondaryText={Messages.find({pledgeId: obj.pledgeId, group: obj.group}, {sort: {time: -1}, limit: 1}).fetch()[0].text}
            onTouchTap={this.handleConvoClick.bind(this, obj.pledgeId, obj.group, obj._id)}
            />
        )) : !this.props.loading && this.state.focused !== '' ?
        <div>
          <ListItem
            innerDivStyle={{paddingLeft: '96px'}}
            leftAvatar={<div style={{left: '0px'}}>
            <IconButton
                iconStyle={styles.smallIcon}
                style={styles.small}
              >
                <ArrowBack />
            </IconButton>
            <Avatar style={{verticalAlign: 'inherit'}} src='/images/splash.jpg' />

              </div>}
            primaryText={Pledges.findOne({_id: this.state.focused.id}).title}
            onTouchTap={this.handleBackClick}
            />

          <div>
          <div ref='box' style={{height: 'calc(100vh - 160px)', overflowY: 'scroll'}}>

            {Messages.find({pledgeId: this.state.focused.id, group: this.state.focused.group}).fetch().map((message) => (
              <div >
                <div style={styles.blocker}>
                <div style={message.sender === Meteor.userId() ? styles.yourMessage : styles.theirMessage}>
                  {message.text}
                  <p style = {styles.dateText}>{dateTimeFormat(message.time)}</p>
                </div>
              </div>


              </div>
            ))}


            </div>

            <div style={{backgroundColor: 'white', width: '100%'
              , height: 'auto', display: 'flex'
                  }}>
                  <div style={{flex: 1}}>
              <TextField key='message' onChange={this.handleChange}
                value={this.state.message}
                onKeyPress={this.handleKeyPress}
                multiLine={true} fullWidth={true}  />
              </div>
              <IconButton
                onTouchTap={this.sendMessage}
                  iconStyle={{width: 24,
                  height: 24,
                  color: grey500,}}
                  style={{height: 40, width: 40, padding: '0px'}}
                >
                  <Send />
              </IconButton>
            </div>
          </div>

        </div>
        : null
        }
      </div>
    )
  }
}

Messaging.propTypes = {
  messages: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
}

export default createContainer(({params}) => {
  const subscriptionHandler = Meteor.subscribe('myMessages')
  const messageHandler = Meteor.subscribe('myConversations')
  const pledgeHandler = Meteor.subscribe("myPledges")

  return {
    loading: !subscriptionHandler.ready() || !pledgeHandler.ready() || !messageHandler.ready(),
    messages: Messages.find({}).fetch(),
    conversations: Conversations.find({}).fetch(),
    slimMessages: Messages.find({}, {fields: {pledgeId: 1, group: 1}}).fetch(),
    pledges: distinct(Messages, 'pledgeId')
  }
}, Messaging)
