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
import { Session } from 'meteor/session';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import {Link, browserHistory} from 'react-router';
import {Pledges} from '/imports/api/pledges.js';
import Leaderboard from '/imports/ui/components/leaderboard.jsx';
import SocialLeaderboard from '/imports/ui/components/socialleaderboard.jsx';
import Badges from '/imports/ui/components/badges.jsx';
import SuggestionList from '/imports/ui/components/suggestionlist.jsx';
import ExpandMore from 'material-ui/svg-icons/navigation/expand-more';
import DocumentTitle from 'react-document-title';
import IconButton from 'material-ui/IconButton';
import {dateDiffInDays} from '/imports/ui/pages/dynamicpledge.jsx'
import NotificationsActive from 'material-ui/svg-icons/social/notifications-active'
import CircularProgress from 'material-ui/CircularProgress';
import Loadable from 'react-loadable';

const Loading = () => (
  <div/>
)

const SocialShareLoadable = Loadable({
  loader: () => import('/imports/ui/components/socialshare.jsx'),
  loading: Loading
});


const styles = {
  box: {
    backgroundColor: grey200,
    marginTop: '10px',
    marginBottom: '10px',
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
  }

}

export class ProfilePledges extends Component {
  constructor(props) {
    super(props)
  }


  handleMoreDetail(id, slug, event) {
    event.preventDefault()
    Session.set('allforone', true)
    browserHistory.push(`/pages/pledges/${ slug }/${id}`)
  }

  handleNewPledge = (e) => {
    e.preventDefault()
    Meteor.call( 'newPledge', ( error, pledgeId ) => {
      if ( error ) {
        Bert.alert( error.reason, 'danger' );
      } else {
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

  render() {
    if (this.props.loading) {
      return (
        <div style={{height: '80vh', width: '100%',
                                              display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <CircularProgress/>
        </div>
      )
    } else {
    return (
      <div>
      <Subheader>Your pledges</Subheader>
        <List>
          <div style={{display: 'flex'}}>


          </div>

            <ListItem
              primaryText='Committed Pledges'
              primaryTogglesNestedList={true}
              style={{backgroundColor: grey200}}

              nestedListStyle={{marginLeft: '0px'}}
              nestedItems={
                this.props.pledges.map((pledge) => (
                  (pledge.title !== 'Untitled Pledge' && pledge.pledgedUsers.includes(Meteor.userId())) ?
            <ListItem
              primaryText={pledge.title}
              secondaryText={pledge.duration === 'Once' ? 'Just Once' : 'For ' + pledge.duration}
              leftAvatar={pledge.coverPhoto === undefined ? <Avatar>{pledge.title.charAt(0)}</Avatar> : <Avatar src={pledge.coverPhoto}/>}
              primaryTogglesNestedList={true}
              style={{marginLeft: '0px'}}

              innerDivStyle={{marginLeft: '0px'}}
              nestedItems={[
                <ListItem

                  innerDivStyle={{marginLeft: '0px'}}
                  children={
                  <div>
                    <div onTouchTap={this.handleMoreDetail.bind(this, pledge._id, pledge.slug)}>
                    <LinearProgress color={amber500} mode="determinate" value={pledge.pledgedUsers.length/pledge.target*100} />

                    <div style={styles.cardTitle}>
                      <div style={styles.bigTitle}>
                        Commitments:
                      <div style={styles.smallTitle}>
                        <div style={styles.currentCommitments}><b>{pledge.pledgedUsers.length}</b> people</div>
                        <div style={styles.targetCommitments}>out of {pledge.target}</div>
                      </div>
                      </div>
                      <div style={styles.bigTitle}>
                        Deadline:
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                          {pledge.deadline ? dateDiffInDays(new Date(),pledge.deadline) : 'Some'} days
                        </div>
                      </div>
                    </div>
                    </div>


                    <Subheader style={{ marginTop: '10px'}}>Share your pledge</Subheader>


                      <div style={{display: 'flex', justifyContent: 'center', marginLeft: '-34px'}}>
                          <SocialShareLoadable pledge={pledge}/>
                        </div>
                    </div>


                }/>
              ]}
            />
         : null
       ))}/>

            <ListItem
              primaryText='Created Pledges'
              primaryTogglesNestedList={true}
              style={{backgroundColor: grey200}}
              nestedListStyle={{marginLeft: '0px'}}
              nestedItems={
            this.props.pledges.map((pledge) => (
              (pledge.creatorId === Meteor.userId()) ?
          <ListItem
                primaryText={pledge.title}
                secondaryText={pledge.duration === 'Once' ? 'Just Once' : 'For ' + pledge.duration}
                leftAvatar={pledge.coverPhoto === undefined ? <Avatar>{pledge.title.charAt(0)}</Avatar> : <Avatar src={pledge.coverPhoto}/>}
                primaryTogglesNestedList={true}
                key={pledge.title}
                innerDivStyle={{marginLeft: '0px'}}
                nestedItems={[
                  <ListItem

                    innerDivStyle={{marginLeft: '0px'}}
                    key={pledge._id + pledge.slug}
                    children={
                    <div>
                    <div onTouchTap={this.handleMoreDetail.bind(this, pledge._id, pledge.slug)}>
                      <LinearProgress color={amber500} mode="determinate" value={pledge.pledgedUsers.length/pledge.target*100} />

                      <div style={styles.cardTitle}>
                        <div style={styles.bigTitle}>
                          Commitments:
                        <div style={styles.smallTitle}>
                          <div style={styles.currentCommitments}><b>{pledge.pledgedUsers.length}</b> people</div>
                          <div style={styles.targetCommitments}>out of {pledge.target}</div>
                        </div>
                        </div>
                        <div style={styles.bigTitle}>
                          Deadline:
                          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            {pledge.deadline ? dateDiffInDays(new Date(),pledge.deadline) : 'Some'} days
                          </div>
                        </div>
                      </div>

                    </div>
                      <Subheader style={{marginLeft: '-34px', marginTop: '10px'}}>Share your pledge</Subheader>


                        <div style={{display: 'flex', justifyContent: 'center', marginLeft: '-34px'}}>
                          <SocialShareLoadable pledge={pledge}/>
                        </div>
                      </div>


                  }/>
                ]}
              />
            : null ) )}
            />
          <div style={{height: '16px'}}/>
          <FlatButton label='Create New Pledge' onTouchTap={this.handleNewPledge} secondary={true} fullWidth={true}/>
          </List>
          </div>

    )
  }
  }

}

ProfilePledges.propTypes = {
  loading: PropTypes.bool.isRequired,
  pledges: PropTypes.array.isRequired,
}

export default createContainer(() => {
  const pledgeHandler = Meteor.subscribe("myPledges");

  return {
    loading: !pledgeHandler.ready(),
    pledges: Pledges.find().fetch(),
  };
}, ProfilePledges);
