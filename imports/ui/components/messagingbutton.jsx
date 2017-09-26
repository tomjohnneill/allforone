import React, {PropTypes} from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
import {grey200, grey500, grey100, amber500, blue200} from 'material-ui/styles/colors';
import Badge from 'material-ui/Badge';
import MessageIcon from 'material-ui/svg-icons/communication/message';

export class MessagingButton extends React.Component {
  constructor(props) {
    super(props);

  }

  render() {
    return (
      <div>
      {this.props.unreadMessages > 0 && Meteor.userId() !== null ?
      <Badge
          badgeContent={this.props.unreadMessages}
          secondary={true}
          onTouchTap={this.props.handleClick}
          style={{padding: '0px', zIndex: 2}}
          badgeStyle={{zIndex: 2, color:'white'}}
        >
        <IconButton
          >
          <MessageIcon color={'#484848'}/>
         </IconButton>
       </Badge> :
       <IconButton
         onTouchTap={this.props.handleClick}
         >
         <MessageIcon color={'#484848'}/>
        </IconButton>}
       </div>
    )
  }
}

export default createContainer(() => {
  const countHandler = Meteor.subscribe("allUnreadMessages")

  return {
    loading: !countHandler.ready(),
    unreadMessages: Counts.get('theseUnreadMessages')
  };
}, MessagingButton);
