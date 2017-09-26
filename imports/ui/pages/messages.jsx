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
import FontIcon from 'material-ui/FontIcon';
import MoreVert from 'material-ui/svg-icons/navigation/more-vert';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import Popover from 'material-ui/Popover';
import Subheader from 'material-ui/Subheader';

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
    this.state = {focused: '', open: false}
  }

  handleConvoClick (id, group, conversationId, type, obj)  {
    this.setState({focused: {id: id, group: group, conversationId: conversationId, type: type}})
    console.log(obj)
    console.log(conversationId)
    browserHistory.push('/messages/' + conversationId)
    Meteor.call('seenMessage', conversationId)
  }

  componentDidMount() {
  var objDiv = ReactDOM.findDOMNode(this.refs.box);

  objDiv.scrollTop = objDiv.scrollHeight;
}

componentDidUpdate() {
  var objDiv = ReactDOM.findDOMNode(this.refs.box);

  objDiv.scrollTop = objDiv.scrollHeight;
}

  handleBackClick = (e) => {
    e.preventDefault()
    this.setState({focused: ''})
    browserHistory.push('/messages' )
  }

  handlePrint = (e) => {
    e.preventDefault()
    Meteor.call('returnConversations')
  }

  handleRequestClose = () => {
    this.setState({
      open: false
    });
  };

  handleChange = (e, newValue) => {
    this.setState({message: newValue})
  }

  handleMoreClick = (e) => {
    e.preventDefault()
    Meteor.call('recalculateGroupMembers', this.state.focused.group, this.state.focused.id)
  }

  sendMessage = (e) => {
    Meteor.call('sendMessageReply', this.state.message, this.state.focused.id
    , this.state.focused.group, this.state.focused.conversationId)
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

    handleGroupInfo = (e) => {
      e.preventDefault()
    }

    handleContactInfo  (senderId)  {

      browserHistory.push('/profile/' + senderId)
    }

    handleSettingsClick = (e) => {
      e.preventDefault()
      this.setState({
        open: true,
        anchorEl: e.currentTarget
      })
      Meteor.call('recalculateGroupMembers', this.state.focused.group, this.state.focused.id)
    }

    componentWillReceiveProps(nextProps) {
      if (!nextProps.loading) {
        if (this.props.params.conversationId) {
          var conversation = Conversations.findOne({_id: this.props.params.conversationId})
          this.setState({focused: {id: conversation.id,
             group: conversation.group
             , conversationId: conversation._id, type: conversation.type}})
        }
      }
    }

  render() {
    var sender, senderId, senderAvatar
    if (!this.props.loading) {
      var conversation = Conversations.findOne({_id: this.props.params.conversationId})
      if ((this.state.focused || this.props.params.conversationId) && this.state.type !== 'group') {
        var members = conversation.members
        for (var i = 0; i < members.length; i++) {
          console.log(members[i])
          console.log(Meteor.userId())
          if (members[i] !== Meteor.userId()) {
            console.log('Members[i]: ' + members[i])

            console.log('User that matches members[i]:' + Meteor.users.findOne({_id: members[i]})._id)
            sender = Meteor.users.findOne({_id: members[i]}) ? Meteor.users.findOne({_id: members[i]}).profile.name : null
            console.log('Sender: ' + sender)
            senderId = members[i]
            if (sender !== null) {
              senderAvatar = Meteor.users.findOne({_id: members[i]}).profile.picture
              break};
          }
        }
      }
      console.log(this.state)

      var whichAvatars = {}
      for (var i =0 ; i< this.props.conversations.length; i++) {
        if (this.props.conversations[i].type !== 'group') {
          var avatars = this.props.conversations[i].avatars ? this.props.conversations[i].avatars : []
          var members = this.props.conversations[i].members ? this.props.conversations[i].members : []
          for (var j =0; j< members.length ; j++) {
            if (members[j] !== Meteor.userId()) {
              if (avatars[0] && !avatars[0][members[j]] && members[j] !== Meteor.userId()) {
                whichAvatars[this.props.conversations[i]._id] = avatars[1] ? avatars[1][members[j]] : null
                break;
              } else {
                whichAvatars[this.props.conversations[i]._id] = avatars[0] ? avatars[0][members[j]] : null
                break;
              }
            }
          }
        }
      }
      
    }


    console.log('Sender: ' + sender)



    //console.log('PledgeId: ' + Conversations.findOne({_id: this.props.params.conversationId}))

    //Pledges.findOne({_id: Conversations.findOne({_id: this.props.params.conversationId}).pledgeId})

    return (
      <div style={{display: 'flex', justifyContent: 'center'}}>
      <div style={{maxWidth: '800px', width: '100%'}}>
        <Subheader style={{fontSize: '25px', letterSpacing: '-0.6px', lineHeight: '30px', color: '#484848',
        fontWeight: 700, marginTop: '24px', marginBottom: '24px', paddingLeft: '16px', fontFamily: 'Raleway'}}>
          Your messages
        </Subheader>
        {!this.props.loading && this.state.focused === '' && this.props.params.conversationId === undefined ? this.props.conversations.map((obj) => (

          <ListItem leftAvatar={
              obj.type == 'group' ?
              <Avatar icon={<FontIcon className="fa fa-users fa-2x" />}/>
              :
            <Avatar src={whichAvatars[obj._id] ? whichAvatars[obj._id] : '/images/splash.jpg' }/>
            }
            primaryText={Pledges.findOne({_id: obj.pledgeId}) ? Pledges.findOne({_id: obj.pledgeId}).title + ' - ' + obj.group : ''}
            secondaryText={Messages.find({conversationId: obj._id}, {sort: {time: -1}, limit: 1}).fetch()[0].text}
            onTouchTap={this.handleConvoClick.bind(this, obj.pledgeId, obj.group, obj._id, obj.type, obj)}
             rightAvatar={Counts.get(obj._id) > 0 ? <Avatar
               color='white'
                               backgroundColor='#FF9800'
                size={30}
>
                {Counts.get(obj._id)}</Avatar> : null}
            />
        )) : !this.props.loading && (this.state.focused !== '' || this.props.params.conversationId !== undefined) ?
        <div>
          <ListItem
            innerDivStyle={{paddingLeft: '96px'}}
            leftAvatar={<div onTouchTap={this.handleBackClick} style={{left: '0px'}}>
            <IconButton
                iconStyle={styles.smallIcon}
                style={styles.small}
              >
                <ArrowBack />
            </IconButton>
            <Avatar style={{verticalAlign: 'inherit'}} src={senderAvatar ? senderAvatar : '/images/splash.jpg'} />

              </div>}
            primaryText={
              this.state.focused.type === 'group'  && Pledges.findOne({_id: Conversations.findOne({_id: this.props.params.conversationId}).pledgeId}) ?

               Pledges.findOne({_id: Conversations.findOne({_id: this.props.params.conversationId}).pledgeId}).title :
              sender
            }

            rightIcon={<IconButton
              style={{padding: '0px'}}
              onTouchTap={this.handleSettingsClick} >
              <MoreVert/>
          </IconButton>}
            />

          <div>
          <div ref='box' style={{height: 'calc(100vh - 160px)', overflowY: 'scroll'}}>

            {Messages.find({conversationId: this.props.params.conversationId}).fetch().map((message) => (
              <div >
                <div style={styles.blocker}>
                <div style={message.sender === Meteor.userId() ? styles.yourMessage : styles.theirMessage}>
                  {this.state.focused.type === 'group' ? <p style = {styles.dateText}>{Meteor.users.findOne({_id: message.sender}).profile.name}</p> :null}
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

          <Popover
            open={this.state.open}
           anchorEl={this.state.anchorEl}
           anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
           targetOrigin={{horizontal: 'left', vertical: 'top'}}
           onRequestClose={this.handleRequestClose}
         >
           <Menu>
             {this.state.focused.type === 'group' ?
             <MenuItem primaryText="View Group Info"  onTouchTap={this.handleGroupInfo}/> :
               <MenuItem primaryText="View Contact Info"  onTouchTap={this.handleContactInfo.bind(this, senderId)}/>}
           </Menu>
         </Popover>

        </div>
        : null
        }
      </div>
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
  const pledgeHandler = Meteor.subscribe("myPledges");
  const countHandler = Meteor.subscribe("unreadMessages")
  const pledgeUserHandler = Meteor.subscribe("conversationUsers", params.conversationId);

  return {
    loading: !subscriptionHandler.ready() || !pledgeHandler.ready() || !messageHandler.ready() ||
    !pledgeUserHandler.ready() || !countHandler.ready(),
    messages: Messages.find({}).fetch(),
    conversations: Conversations.find({}, {sort: {lastMessage: -1}, limit: 15}).fetch(),
    slimMessages: Messages.find({}, {fields: {pledgeId: 1, group: 1}}).fetch(),
  }
}, Messaging)
