import React , {PropTypes} from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import {grey200, grey500, grey100, amber500} from 'material-ui/styles/colors'
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import LinearProgress from 'material-ui/LinearProgress';
import Divider from 'material-ui/Divider';
import {Tabs, Tab} from 'material-ui/Tabs';
import { Session } from 'meteor/session';
import FacebookProvider, { Comments } from 'react-facebook';
import Dialog from 'material-ui/Dialog';
import {Link, browserHistory} from 'react-router';
import {Pledges} from '/imports/api/pledges.js';
import {List, ListItem} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Avatar from 'material-ui/Avatar';
import ArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import DocumentTitle from 'react-document-title';
import CircularProgress from 'material-ui/CircularProgress';
import FlatButton from 'material-ui/FlatButton'

export class PledgeList extends React.Component{
  constructor(props) {
    super(props);
  }

  handleNewPledge = (e) => {
    console.log('handleNewPledge fired')
    if (e) {
      e.preventDefault()
    }
    console.log('handleNewPledge fired second')
    Meteor.call( 'newPledge', ( error, pledgeId ) => {
      if ( error ) {
        Bert.alert( error.reason, 'danger' );
      } else {
        console.log(pledgeId)
        Meteor.call('findPledgeSlug', pledgeId, (error, pledgeSlug) => {
          if (error) {
            Bert.alert(error.reason, "Can't find pledge slug")
          } else {
          browserHistory.push( `/pages/pledges/${ pledgeSlug }/${ pledgeId }/edit` );
          Bert.alert( 'All set! Get to typin\'', 'success' );
        }
        })
      }
    })
  }

  handleCreatePledge = (e) => {
    e.preventDefault()
    if (Meteor.userId() === null) {
      mixpanel.track("Clicked create account")
      Meteor.loginWithFacebook({ requestPermissions: ['email', 'public_profile', 'user_friends']},function(error, result) {
        if (error) {
            console.log("facebook login didn't work at all")
            Bert.alert(error.reason, 'danger')
        }
    })
  }
    else {
      this.handleNewPledge(e)
    }
  }

  handleTap = (id, slug, e) => {

    console.log(id)
    console.log(slug)
    console.log(e)
    Session.set('allforone', true)
    browserHistory.push('/pages/pledges/' + slug + '/' + id)

  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.user && nextProps.user.justAddedPledge) {
      this.handleNewPledge
    }
  }

  render() {
    console.log(this.props)

    if (this.props.user && this.props.user.justAddedPledge) {
      this.handleNewPledge
    }

    return (
      <div>

        {this.props.loading ? <div style={{height: '80vh', width: '100%',
                                              display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <CircularProgress/>
        </div> :
        <DocumentTitle title='Pledge List'>
        <div>
          <Subheader>Popular pledges, click for more details</Subheader>

          <List style={{backgroundColor: grey200 }}>

        {this.props.pledges.map((pledge) => (
          <div style={{margin: 10, backgroundColor: 'white'}} onTouchTap={(e) => this.handleTap(pledge._id, pledge.slug)}>
            <ListItem key  ={pledge._id}

              primaryText={pledge.title}
              secondaryText={'Time Period: ' + (pledge.duration ? pledge.duration: 'Unknown')}

              leftAvatar={pledge.coverPhoto === undefined ? <Avatar>{pledge.title.charAt(0)}</Avatar> : <Avatar src={pledge.coverPhoto}/>}/>
            <div style={{marginLeft: '72px', paddingBottom: '10px'}}>
              <div style={{marginRight: '16px'}}>
          <LinearProgress style={{marginRight: '16px'}} color={amber500} mode="determinate"
             value={pledge.pledgedUsers.length/pledge.target*100} />
           </div>
           <div style={{marginTop: '10px'}}>
            {pledge.pledgedUsers.length} out of {pledge.target}
            </div>
          </div>
          <Divider/>
          </div>
          ))}
        </List>
        <div style={{height: '36px'}}/>
        <div>
        <RaisedButton
          style={{position: 'fixed', bottom: '0px', zIndex: '100', maxWidth: '600px', width: '100%'
          , visibility: this.props.hidden ? 'hidden' : 'visible'}}
          secondary={true}
          label='Add a new pledge' onTouchTap={this.handleCreatePledge}/>
        </div>
        </div>
        </DocumentTitle>
      }
      </div>
    )
  }
}

PledgeList.propTypes = {
  pledges: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired
}

export default createContainer(() => {
  const subscriptionHandler = Meteor.subscribe("pledgeList");

  return {
    pledges: Pledges.find({title: {$ne: 'Untitled Pledge'}, deadline: { $gte : new Date()}}, {sort: {pledgeCount: -1}}).fetch(),
    loading: !subscriptionHandler.ready()
  };
}, PledgeList);
