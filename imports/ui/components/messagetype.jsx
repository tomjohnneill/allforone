import React, {PropTypes} from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
import {grey200, grey500, grey100, amber500, blue200} from 'material-ui/styles/colors';
import Badge from 'material-ui/Badge';

export class MessageType extends React.Component {
  constructor(props) {
    super(props);
    this.state = {allforone: true}
  }

  handleConsoleLog = (e) => {
    e.preventDefault()
    console.log(this.props)
    console.log(Counts.get('emailCount'))
  }

  changeMessageType (type, e) {
    console.log('type' + type)
    console.log('e' + e)
    this.props.changeMessageType(type)
    this.setState({[type] : !this.state[type]})
  }

  render () {
    console.log(this.props)
    return (
      <div>
        {!this.props.loading ?
          <div>

            <div style={{backgroundColor:'white',display: 'flex',
              justifyContent: 'center',
            width: '100%', alignItems: 'center'}}>
            <div style={{}}>
              <Badge
                  badgeContent={this.props.messengerCount}
                  secondary={this.state.messenger}
                  onTouchTap={this.changeMessageType.bind(this, 'messenger')}
                  style={{padding: '0px', zIndex: 2}}
                  badgeStyle={{zIndex: 2, color: this.state.messenger ? 'white' : grey200}}
                >
                <IconButton tooltip='Use Facebook Messenger'
                  >
                 <FontIcon
                   color = {this.state.messenger ? '#006699' : grey200}
                   className="fa fa-facebook-official fa-2x" style={{color: '#006699'}}
                   />
               </IconButton>
             </Badge>
            </div>
            <div style={{marginLeft: '10px'}}>
              <Badge
                  badgeContent={this.props.oneSignalCount}
                  secondary={this.state.push}
                  onTouchTap={this.changeMessageType.bind(this, 'push')}
                  style={{padding: '0px', zIndex: 2}}
                  badgeStyle={{zIndex: 2, color: this.state.push ? 'white' : grey200}}
                >
              <IconButton tooltip='Use Push Notifications (not on iPhone)'
                >
                <FontIcon
                  color = {this.state.push ? '#006699' : grey200}
                  className="fa fa-bell fa-2x" style={{color: '#006699'}}
                      />
              </IconButton>
              </Badge>
            </div>
            <div style={{marginLeft: '10px'}}>
              <Badge
                  badgeContent={this.props.emailCount}
                  secondary={this.state.email}
                  onTouchTap={this.changeMessageType.bind(this, 'email')}
                  style={{padding: '0px', zIndex: 2}}
                  badgeStyle={{zIndex: 2, color: this.state.email ? 'white' : grey200}}
                >
                  <IconButton tooltip='Use Email'
                    >
                    <FontIcon
                      color = {this.state.email ? '#006699' : grey200}
                      className="fa fa-envelope-o fa-2x" style={{color: '#006699'}}
                     />
                   </IconButton>
                </Badge>
            </div>
            <div style={{marginLeft: '10px'}}
              >
              <Badge
                  badgeContent={this.props.smsCount}
                  secondary={this.state.sms}
                  onTouchTap={this.changeMessageType.bind(this, 'sms')}
                  style={{padding: '0px', zIndex: 2}}
                  badgeStyle={{zIndex: 2, color: this.state.sms ? 'white' : grey200}}
                >
              <IconButton tooltip='Use SMS'
                >
             <FontIcon tooltip='Use SMS'
               color = {this.state.sms ? '#006699' : grey200}
               className="fa fa-comment fa-2x" style={{color: '#006699'}}
                 />
               </IconButton>
               </Badge>
            </div>
            <div style={{marginLeft: '10px'}}
              >
              <Badge
                  badgeContent={this.props.allforoneCount}
                  secondary={this.state.allforone}
                  onTouchTap={this.changeMessageType.bind(this, 'allforone')}
                  style={{padding: '0px', zIndex: 2}}
                  badgeStyle={{zIndex: 2, color: this.state.allforone ? 'white' : grey200}}
                >
              <IconButton tooltip='Use All For One'
                >
             <FontIcon
               color = {this.state.allforone ? '#006699' : grey200}
               className="fa fa-home fa-2x" style={{color: '#006699'}}
                 />
               </IconButton>
               </Badge>
            </div>
            </div>
          </div>
          :
          <div>
            <div style={{backgroundColor:'white',display: 'flex',
              justifyContent: 'center',
            width: '100%', alignItems: 'center'}}>
            <div style={{}}>
              <Badge
                  badgeContent={0}
                  secondary={this.state.messenger}
                  onTouchTap={this.changeMessageType.bind(this, 'messenger')}
                  style={{padding: '0px', zIndex: 2}}
                  badgeStyle={{zIndex: 2, color: this.state.messenger ? 'white' : grey200}}
                >
                <IconButton tooltip='Use Facebook Messenger'
                  >
                 <FontIcon
                   color = {this.state.messenger ? '#006699' : grey200}
                   className="fa fa-facebook-official fa-2x" style={{color: '#006699'}}
                   />
               </IconButton>
             </Badge>
            </div>
            <div style={{marginLeft: '10px'}}>
              <Badge
                  badgeContent={0}
                  secondary={this.state.push}
                  onTouchTap={this.changeMessageType.bind(this, 'push')}
                  style={{padding: '0px', zIndex: 2}}
                  badgeStyle={{zIndex: 2, color: this.state.push ? 'white' : grey200}}
                >
              <IconButton tooltip='Use Push Notifications (not on iPhone)'
                >
                <FontIcon
                  color = {this.state.push ? '#006699' : grey200}
                  className="fa fa-bell fa-2x" style={{color: '#006699'}}
                      />
              </IconButton>
              </Badge>
            </div>
            <div style={{marginLeft: '10px'}}>
              <Badge
                  badgeContent={0}
                  secondary={this.state.email}
                  onTouchTap={this.changeMessageType.bind(this, 'email')}
                  style={{padding: '0px', zIndex: 2}}
                  badgeStyle={{zIndex: 2, color: this.state.email ? 'white' : grey200}}
                >
                  <IconButton tooltip='Use Email'
                    >
                    <FontIcon
                      color = {this.state.email ? '#006699' : grey200}
                      className="fa fa-envelope-o fa-2x" style={{color: '#006699'}}
                     />
                   </IconButton>
                </Badge>
            </div>
            <div style={{marginLeft: '10px'}}
              >
              <Badge
                  badgeContent={0}
                  secondary={this.state.sms}
                  onTouchTap={this.changeMessageType.bind(this, 'sms')}
                  style={{padding: '0px', zIndex: 2}}
                  badgeStyle={{zIndex: 2, color: this.state.sms ? 'white' : grey200}}
                >
              <IconButton tooltip='Use SMS'
                >
             <FontIcon tooltip='Use SMS'
               color = {this.state.sms ? '#006699' : grey200}
               className="fa fa-comment fa-2x" style={{color: '#006699'}}
                 />
               </IconButton>
               </Badge>
            </div>
            <div style={{marginLeft: '10px'}}
              >
              <Badge
                  badgeContent={0}
                  secondary={this.state.allforone}
                  onTouchTap={this.changeMessageType.bind(this, 'allforone')}
                  style={{padding: '0px', zIndex: 2}}
                  badgeStyle={{zIndex: 2, color: this.state.allforone ? 'white' : grey200}}
                >
              <IconButton tooltip='Use All For One'
                >
             <FontIcon
               color = {this.state.allforone ? '#006699' : grey200}
               className="fa fa-home fa-2x" style={{color: '#006699'}}
                 />
               </IconButton>
               </Badge>
            </div>
            </div>

          </div>
        }
      </div>

    )
  }
}

MessageType.propTypes = {
  loading: PropTypes.bool.isRequired,
}

export default createContainer ((props) => {
  var group = props.groupName === 'everyone' ? null : props.groupName
  const countHandler = Meteor.subscribe("messageTypeCounts", props.pledgeId, group)
  const allCountHandler = Meteor.subscribe("everyoneMessageTypeCounts", props.pledgeId)


  return {
    loading: !countHandler.ready(),
    oneSignalCount : props.groupName === 'everyone' ? Counts.get('allOneSignalCount') : Counts.get('oneSignalCount'),
    messengerCount: props.groupName === 'everyone' ? Counts.get('allMessengerCount') : Counts.get('messengerCount'),
    emailCount: props.groupName === 'everyone' ? Counts.get('allEmailCount') : Counts.get('emailCount'),
    smsCount : props.groupName === 'everyone' ? Counts.get('allSmsCount') : Counts.get('smsCount'),
    allforoneCount : props.groupName === 'everyone' ? Counts.get('allAllForOneCount') : Counts.get('allforoneCount'),
  };
}, MessageType)
