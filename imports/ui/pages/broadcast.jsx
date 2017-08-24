import React , {PropTypes} from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import {Pledges, Details} from '/imports/api/pledges.js';
import {Reviews} from '/imports/api/reviews.js';
import {List, ListItem} from 'material-ui/List';
import ReactStars from 'react-stars';
import TextField from 'material-ui/TextField';
import {grey200, grey500, grey100, amber500, blue200} from 'material-ui/styles/colors';
import Avatar from 'material-ui/Avatar';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import Subheader from 'material-ui/Subheader';
import ArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import {Link, browserHistory} from 'react-router';
import IconButton from 'material-ui/IconButton';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import FontIcon from 'material-ui/FontIcon';
import Dropzone from 'react-dropzone';
import MessageType from '/imports/ui/components/messagetype.jsx';


const styles = {
  box: {
    backgroundColor: grey200,
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
  },
  smallIcon: {
     width: 24,
     height: 24,
     color: 'white',
   },
   small: {
     width: 36,
     height: 36,
     padding: '4px 4px 4px 20px'
   },
     toggle: {
    marginBottom: 16,
  },
  explanation: {
    fontSize: '8pt',
    color: grey500,
    paddingLeft: '16px',
    backgroundColor: 'white',
    paddingRight: '16px'
  }

}


export class Broadcast extends React.Component{
  constructor(props) {
    super(props);
    console.log(this.props)
    this.state = {group: 'everyone'}
    this.changeMessageType = this.changeMessageType.bind(this)
  }


  componentWillReceiveProps(nextProps) {
  }

  handleBackClick = (e) => {
    e.preventDefault()
    browserHistory.push('/pages/pledges/' + this.props.params.pledge +'/' + this.props.params._id)
  }

  handleDropDownChange = (e, n, value) => {
    this.setState({group: value})
  }

  changeMessageType (type, e) {
    console.log('type' + type)
    console.log('e' + e)
    this.setState({[type] : !this.state[type]})
  }

  upload(acceptedFiles, rejectedFiles){
    var metaContext = {pledgeId: this.props.params._id};
    console.log(metaContext)
    this.setState({loader: true})
    var uploader = new Slingshot.Upload("messagePicture", metaContext);
    uploader.send(acceptedFiles[0], function (error, downloadUrl) { // you can use refs if you like
      if (error) {
        // Log service detailed response
        //console.error('Error uploading', uploader.xhr.response);
        Bert.alert(error, 'danger'); // you may want to fancy this up when you're ready instead of a popup.
      }
      else {
        this.setState({picture: downloadUrl})
      // Meteor.call('addPictureToMessage', downloadUrl, this.props.pledge._id)
      // you will need this in the event the user hit the update button because it will remove the avatar url
      this.setState({loader: false})

    }
    }.bind(this));
  }

  handleSendMessage = (e) => {
    e.preventDefault()
    Meteor.call('sendBroadcastMessage', this.state.group, this.props.params._id
    , this.state.messenger, this.state.push, this.state.email, this.state.sms,
    this.state.text, this.state.picture, (err, result) => {
      if (err) {
        Bert.alert(err.reason, 'danger')
      } else {
        Bert.alert('Message Queued', 'success')
      }
    })
  }

  handleTextChange = (e, newValue) => {
    this.setState({text: newValue})
  }

  render () {
    console.log(this.state)
    if (Meteor.roles) {
      console.log(Meteor.roles.find().fetch())
    }

    return (
      <div>
        <span onTouchTap={this.handleBackClick}>
        <div style={{display: 'flex' ,backgroundColor: grey500, color: 'white'}}>
                  <IconButton
            iconStyle={styles.smallIcon}
            style={styles.small}
          >
            <ArrowBack />
          </IconButton>

        <div style={{width: '100%', paddingLeft: '16px', backgroundColor: grey500, color: 'white', alignItems: 'center', display: 'flex'}}>

          BACK TO PLEDGE
        </div>
        </div>
      </span>

        <div>
        <Subheader style={{backgroundColor: 'white'}}>
          Send a custom message
        </Subheader>
        <div>
        {this.props.loading ? null :
        Meteor.userId() === this.props.pledge.creatorId || Roles.userIsInRole('admin', Roles.GLOBAL_GROUP) ?
        <div style={styles.box}>
          <div style={{backgroundColor: 'white'}}>
            <Subheader>
              Select your audience
            </Subheader>
            <DropDownMenu value={this.state.group} onChange={this.handleDropDownChange}>
              <MenuItem value='everyone' primaryText='Everyone'/>
            {this.props.pledge.pledgeRoles ? this.props.pledge.pledgeRoles.map((role) => (

                <MenuItem value={role} primaryText={role}/>

            )) : null}
            </DropDownMenu>
          </div>

          <div style={{backgroundColor: 'white'}}>
            <Subheader>
              Add a picture
            </Subheader>
            <Dropzone key={'photos'} onDrop={this.upload.bind(this)}  style={{}}>
                  {({ isDragActive, isDragReject }) => {
                    let styles = {
                      width: 'auto',
                      height: 100,
                      textAlign: 'center',
                      justifyContent: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      borderWidth: 1.5,
                      borderColor: grey500,
                      borderStyle: 'dashed',
                      borderRadius: 5,
                      color: grey500,
                      marginLeft: '16px',
                      marginRight: '16px'

                    }

                    const acceptedStyles = {
                      ...styles,
                      borderStyle: 'solid',
                      borderColor: '#6c6',
                      backgroundColor: '#eee'
                    }

                    const rejectStyles = {
                      ...styles,
                      borderStyle: 'solid',
                      borderColor: '#c66',
                      backgroundColor: '#eee'
                    }

                    if (isDragActive) {
                      return (
                        <div style={acceptedStyles}>
                          File will be accepted
                        </div>
                      )
                    }
                    if (isDragReject) {
                      return (
                        <div style={rejectStyles}>
                          File will be rejected
                        </div>
                      )
                    }
                    // Default case
                    return (
                      <div style={styles}>

                        {this.state.picture ? <img style={{height: '90px', width: 'auto'}} src={this.state.picture}/> :
                        <p>Drag and drop (or click) to upload</p>
                      }
                      </div>
                    )
                  }}
                </Dropzone>
          </div>

          <div style={{backgroundColor: 'white'}}>
            <Subheader>
              Add some message text
            </Subheader>
            <div style={{paddingLeft: '16px', paddingRight: '16px'}}>
              <TextField multiLine={true}
                hintText='Type a message...'
                 fullWidth={true} onChange={this.handleTextChange}
                rows={2} />
            </div>
          </div>

          <Subheader style={{backgroundColor: 'white'}}>
            Choose the type(s) of message
          </Subheader>
          <div style={styles.explanation}>
            We will only ever send a user at most 2 different kinds of message (usually a notification type, and an email), but choosing more options can enable you to reach more users.
          </div>
          <div style={{height: '16px', backgroundColor: 'white'}}/>

          <MessageType changeMessageType={this.changeMessageType}
            groupName={this.state.group} pledgeId={this.props.params._id} />

            <Subheader style={{backgroundColor: 'white'}}>
              Send your message
            </Subheader>
            <div style={styles.explanation}>
              This will queue your message for approval - typically within 24 hours. The message will be approved as long as it is not offensive or spammy.
            </div>

            <div style={{backgroundColor: 'white', display: 'flex'
              , justifyContent: 'center', width: '100%', paddingTop: '16px'}}>
              <RaisedButton label='Send Message' primary={true} onTouchTap={this.handleSendMessage}/>
            </div>

        </div>
        : <div style={{display: 'flex', backgroundColor: grey200, height: '250px', width: '100%', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{padding: '5px'}}>
              You do not have permission to access this page
            </div>
      </div>
      }

      </div>
      </div>

      </div>
    )
  }
}

Broadcast.propTypes = {
  pledge: PropTypes.object.isRequired,


};

export default createContainer(({params}) => {
  const subscriptionHandler = Meteor.subscribe("editor", params._id);
  const pledgeUserHandler = Meteor.subscribe("pledgeUsers", params._id);
  const roleHandler = Meteor.subscribe("pledgeRoles");

  return {
    loading: !subscriptionHandler.ready() || !pledgeUserHandler.ready(),
    pledge: Pledges.find({_id: params._id}).fetch()[0],
    users: Meteor.users.find({}).fetch(),
    roles: Meteor.roles.find({}).fetch(),
  };
}, Broadcast);
