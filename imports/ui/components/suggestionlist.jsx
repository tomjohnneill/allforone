import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import {grey200, grey500, grey100, amber500} from 'material-ui/styles/colors'
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import LinearProgress from 'material-ui/LinearProgress';
import Divider from 'material-ui/Divider';
import {Tabs, Tab} from 'material-ui/Tabs';
import {List, ListItem} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Avatar from 'material-ui/Avatar'
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import {Link, browserHistory} from 'react-router';
import {Pledges} from '/imports/api/pledges.js';
import {Suggestions} from '/imports/api/suggestions.js';
import ExpandMore from 'material-ui/svg-icons/navigation/expand-more';
import DocumentTitle from 'react-document-title';
import IconButton from 'material-ui/IconButton';
import {dateDiffInDays} from '/imports/ui/pages/dynamicpledge.jsx'
import MessengerPlugin from 'react-messenger-plugin';
import NotificationsActive from 'material-ui/svg-icons/social/notifications-active'
import CircularProgress from 'material-ui/CircularProgress';

export class SuggestionList extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    console.log(this.props)
    return (
      <div>
      {this.props.loading === true ? <div style={{height: '20vh', width: '100%',
                                            display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
      <CircularProgress/>
      </div> :
      <List>
        <div style={{display: 'flex'}}>


        </div>

          <ListItem
            primaryText='Starred Suggestions'
            primaryTogglesNestedList={true}
            style={{backgroundColor: grey200}}

            nestedListStyle={{marginLeft: '0px'}}
            nestedItems={
              this.props.suggestions.map((suggestion) => (
                (suggestion.title !== 'Untitled Pledge' && suggestion.stars && suggestion.stars.includes(this.props.userId)) ?
          <a href={suggestion.url}>
          <ListItem
            primaryText={suggestion.title}

            leftAvatar={suggestion.image === undefined ? <Avatar>{suggestion.title.charAt(0)}</Avatar> : <Avatar src={suggestion.image}/>}
            primaryTogglesNestedList={true}
            style={{marginLeft: '0px'}}

            innerDivStyle={{marginLeft: '0px'}}

          />
        </a>
       : null
     ))}/>

     <ListItem
       primaryText='Contributed Suggestions'
       primaryTogglesNestedList={true}
       style={{backgroundColor: grey200}}

       nestedListStyle={{marginLeft: '0px'}}
       nestedItems={
         this.props.suggestions.map((suggestion) => (
           (suggestion.contributor && suggestion.contributor.includes(this.props.userId)) ?
     <a href={suggestion.url}>
     <ListItem
       primaryText={suggestion.title}

       leftAvatar={suggestion.image === undefined ? <Avatar>{suggestion.title.charAt(0)}</Avatar> : <Avatar src={suggestion.image}/>}
       primaryTogglesNestedList={true}
       style={{marginLeft: '0px'}}

       innerDivStyle={{marginLeft: '0px'}}

     />
   </a>
  : null
))}/>
        <div style={{height: '16px'}}/>
        </List>}
    </div>
    )
  }
}

SuggestionList.propTypes = {
  loading: PropTypes.bool.isRequired,
  suggestions: PropTypes.array.isRequired,
};

export default createContainer((props) => {
  const suggestionHandler = Meteor.subscribe("suggestions", props.userId)



  return {
    loading: !suggestionHandler.ready(),
    suggestions: Suggestions.find().fetch(),
  };
}, SuggestionList);
