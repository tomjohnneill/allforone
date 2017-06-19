import React , {PropTypes} from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import {grey200, grey500, grey100, amber500} from 'material-ui/styles/colors'
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import LinearProgress from 'material-ui/LinearProgress';
import Divider from 'material-ui/Divider';
import {Tabs, Tab} from 'material-ui/Tabs';
import { Session } from 'meteor/session';
import FacebookProvider, { Comments } from 'react-facebook';
import Dialog from 'material-ui/Dialog';
import {Link, browserHistory} from 'react-router';
import {Pledges} from '/imports/api/pledges.js';
import {Threads} from '/imports/api/threads.js';
import {List, ListItem} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Avatar from 'material-ui/Avatar';
import ArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import IconButton from 'material-ui/IconButton';
import TrendingFlat from 'material-ui/svg-icons/action/trending-flat';
import CircularProgress from 'material-ui/CircularProgress';

const styles = {
  box: {
    backgroundColor: grey200,
    marginTop: '10px',
    marginBottom: '10px',
    padding: '10px'
  },
  iconOff: {
  filter:  'gray', WebkitFilter:  'grayscale(1)'

    , opacity:  '0.4'
},
}

export class ThreadList extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
        open: false,
      };
  }

  handleClose = () => {
  this.setState({open: false});
};

  handleNewThread = (e) => {
    e.preventDefault()
    if (Meteor.userId() === null) {
      Bert.alert('You need to join a pledge before you can do that', 'danger')
    } else {
    Meteor.call( 'newThread', '', ( error, threadId ) => {
      if ( error ) {
        Bert.alert( error.reason, 'danger' );
      } else {
        Meteor.call('findThreadSlug',  threadId, (error, threadSlug) => {
          if (error) {
            Bert.alert(error.reason, "Can't find thread slug")
          } else {
          browserHistory.push( `/pages/community/${ threadSlug }/${ threadId }/edit` );
          Bert.alert( 'All set! Get to typin\'', 'success' );
        }
        })
      }
    })
  }
  }

  handleTap = (id, slug, e) => {
    browserHistory.push('/pages/community/' + slug + '/' + id)

  }

  handlePledgeThreadClick (id, slug, event){
    event.preventDefault()
    this.setState({open: true, id: id, slug: slug})
  }

  goToPledge = (e) => {
    e.preventDefault()
    this.setState(open: false)
    browserHistory.push(`/pages/pledges/${this.state.slug}/${this.state.id}`)
  }

  handleNewPledgeThread = (pledgeId, e) => {
    e.preventDefault()
    Meteor.call( 'newThread',pledgeId, ( error,  threadId ) => {
      if ( error ) {
        Bert.alert( error.reason, 'danger' );
      } else {
        console.log(threadId)
        Meteor.call('findThreadSlug', threadId, (error, threadSlug) => {
          if (error) {
            Bert.alert(error.reason, "Can't find thread slug")
          } else {
          browserHistory.push( `/pages/community/${ threadSlug }/${ threadId }/edit` );
          Bert.alert( 'All set! Get to typin\'', 'success' );
        }
        })
      }
    })
  }

  render() {

    return (
      <div>
        {this.props.loading ? <div style={{height: '80vh', width: '100%',
                                              display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <CircularProgress/>
        </div> :
        <div style={styles.box}>
          <Card>
          <List style={{backgroundColor: 'white'}}>
          <Subheader>General Chat</Subheader>
          {this.props.threads.length === 0 ?
            <div style={{display: 'flex', alignItems: 'center', marginBottom: '10px', justifyContent: 'center', backgroundColor: grey100, padding: '20px', fontSize: '14px'}}>
              <div>Nothing here just yet</div></div> :
        this.props.threads.map((thread) => (
            <ListItem key ={thread._id}
              primaryText={thread.title}
              style={{backgroundColor: 'white'}}
              onTouchTap={(e) => this.handleTap(thread._id, thread.slug)}
              leftAvatar={<Avatar src={thread.creatorPicture}/>}/>
          ))
        }
          <FlatButton label='new thread' secondary={true} fullWidth={true} onTouchTap={this.handleNewThread}/>
          </List>
          </Card>
          <Card style={{marginTop: '20px'}}>
          <List style={{backgroundColor: 'white'}}>
          <Subheader>Popular communities</Subheader>
            {this.props.pledges.map((pledge) => (
              <ListItem key ={pledge._id}
                primaryText={pledge.title}

                primaryTogglesNestedList={Meteor.userId() !== undefined && pledge.pledgedUsers.includes(Meteor.userId())}
                onTouchTap={Meteor.userId() === undefined || !pledge.pledgedUsers.includes(Meteor.userId()) ? this.handlePledgeThreadClick.bind(this, pledge._id, pledge.slug) : null}
                leftAvatar={pledge.coverPhoto === undefined ? <Avatar>{pledge.title.charAt(0)}</Avatar> : <Avatar
                style={Meteor.userId() === undefined || !pledge.pledgedUsers.includes(Meteor.userId()) ? styles.iconOff: null}
                  src={pledge.coverPhoto}/>
            }
                style={{backgroundColor: Meteor.userId() === undefined || !pledge.pledgedUsers.includes(Meteor.userId()) ?
                  grey200 : 'white'}}
                nestedItems={[
                  <div>
                  {this.props.pledgeThreads.map((thread) => (
                    (thread.pledge === pledge._id) ?
                      <ListItem key ={thread._id}
                        primaryText={thread.title}
                        leftAvatar={<TrendingFlat/>}
                        secondaryText={thread.content}
                        secondaryTextLines={2}
                        onTouchTap={(e) => this.handleTap(thread._id, thread.slug)}
                      />
                      : null
                    ))}
                  <FlatButton label='Start new thread' secondary={true} onTouchTap={this.handleNewPledgeThread.bind(this, pledge._id)} fullWidth={true}/>
                  </div>
                ]}
                />
            ))}


        </List>
        </Card>

        </div>
      }
      <Dialog
          title="Sorry about this"
          actions={<FlatButton secondary={true} label='Go to pledge' onTouchTap={this.goToPledge}/>}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose}
        >
          You can't access this community because you have not made this pledge. Want to join in?
        </Dialog>
      </div>
    )
  }
}

ThreadList.propTypes = {
  threads: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  pledgeThreads: PropTypes.array,
}

export default createContainer(() => {
  const subscriptionHandler = Meteor.subscribe("threadList");
  const pledgeThreadHandler = Meteor.subscribe("pledgeThreadList");
  const myPledgeHandler = Meteor.subscribe("myPledges");

  return {
    threads: Threads.find({'pledge': null, title: {$ne : 'Untitled thread'}}, {sort: {updated: -1}}).fetch(),
    pledgeThreads: Threads.find({'pledge': {$ne : null}, title: {$ne : 'Untitled thread'}}).fetch(),
    pledges: Pledges.find({title: {$ne: 'Untitled Pledge'}}).fetch(),
    loading: !subscriptionHandler.ready() || !myPledgeHandler.ready()
  };
}, ThreadList);
