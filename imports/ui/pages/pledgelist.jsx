import React , {PropTypes} from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import {grey200, grey500, grey100, amber500} from 'material-ui/styles/colors'
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import LinearProgress from 'material-ui/LinearProgress';
import Divider from 'material-ui/Divider';
import {Tabs, Tab} from 'material-ui/Tabs';
import { Session } from 'meteor/session';
import Dialog from 'material-ui/Dialog';
import {Link, browserHistory} from 'react-router';
import {Pledges} from '/imports/api/pledges.js';
import {List, ListItem} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Avatar from 'material-ui/Avatar';
import ArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import DocumentTitle from 'react-document-title';
import CircularProgress from 'material-ui/CircularProgress';
import FlatButton from 'material-ui/FlatButton';
import {GridList, GridTile} from 'material-ui/GridList';
import {dateDiffInDays} from '/imports/ui/pages/dynamicpledge.jsx';
import MediaQuery from 'react-responsive';

const styles = {
  number: {
    color: '#FF9800',
    fontSize: '20px',
  },
  bottomBit: {
    color: grey500,
    marginTop: '-5px',
    fontSize: '12px'
  },
}

export function changeImageAddress(file, size) {
  var str = file, replacement = '/' + size + '/';
  str = str.replace(/\/([^\/]*)$/,replacement+'$1');
  str = str.replace('idle-photos.s3-eu-west-2.amazonaws.com', Meteor.settings.public.Image_CDN)
  return(str + '?pass=this')
}

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
          <MediaQuery minDeviceWidth={700}>
        <div style={{paddingLeft: '48px', paddingRight: '48px', paddingBottom: '64px'}}>
          <Subheader style={{fontSize: '25px', letterSpacing: '-0.6px', lineHeight: '30px', color: '#484848',
          fontWeight: 700, marginTop: '48px', marginBottom: '24px', paddingLeft: '0px', fontFamily: 'Raleway'}}>
            Popular pledges
          </Subheader>

          <List>


              <GridList
                cols={4}

          cellHeight={350}
          padding={12}>
          {this.props.pledges.map((pledge) => (

              <GridTile
                key={pledge._id}

            children={
                <div onTouchTap={(e) => this.handleTap(pledge._id, pledge.slug)} style={{cursor: 'pointer', height: '100%', width: 'auto', display: 'flex', alignItems: 'center', flexDirection: 'column'}}>


                <img style={{width: '100%', height: '60%', maxWidth: '100%', objectFit: 'cover', backgroundColor: grey200}}
                  src={changeImageAddress(pledge.coverPhoto, 'autox250')} />

                <div style={{color: '#484848',
                fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', width: '100%', marginTop: '6px'}}>
                  <b style={{color: '#FF9800'}}>{pledge.pledgeCount}</b> people,  <b style={{color: '#FF9800'}}>{dateDiffInDays(new Date(),pledge.deadline)}</b> days to go...
                </div>

                {/*
                <div style={{display: 'flex', paddingTop: '6px', width: '100%'}}>
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1}}>
                      <div style={styles.number}>
                        {pledge.pledgeCount}
                      </div>
                      <div style={styles.bottomBit}>
                        /{pledge.target} people
                      </div>
                    </div>

                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1}}>
                      <div style={styles.number}>
                        {dateDiffInDays(new Date(),pledge.deadline)}
                      </div>
                      <div style={styles.bottomBit}>
                        days to go...
                      </div>
                    </div>
                  </div>
                  */}

                <LinearProgress style={{marginRight: '16px', marginLeft: '16px', marginTop: '10px', marginBottom: '6px'}} color={amber500} mode="determinate"
                     value={pledge.pledgedUsers.length/pledge.target*100} />
                <div style={{color: '#484848',
                fontWeight: 700, fontSize: '19px', lineHeight: '22px', maxHeight: '44px', letterSpacing: '-0.8px'
                , overflow: 'hidden', fontFamily: 'Raleway', textOverflow: 'ellipsis', width: '100%'}}>
                  {pledge.title}
                </div>

              </div>}
              />))
            }
          </GridList>
        </List>
      </div>


            </MediaQuery>
            <MediaQuery maxDeviceWidth={700}>
              <div style={{paddingLeft: '18px', paddingRight: '18px', paddingBottom: '64px'}}>
                <Subheader style={{fontSize: '25px', letterSpacing: '-0.6px', lineHeight: '30px', color: '#484848',
                fontWeight: 700, marginTop: '48px', marginBottom: '24px', paddingLeft: '0px', fontFamily: 'Raleway'}}>
                  Popular pledges
                </Subheader>

                <List>
            <GridList
              cols={2}

        cellHeight={220}
        padding={12}>
        {this.props.pledges.map((pledge) => (

          <GridTile
            key={pledge._id}

        children={
            <div onTouchTap={(e) => this.handleTap(pledge._id, pledge.slug)} style={{cursor: 'pointer', height: '100%', width: 'auto', display: 'flex', alignItems: 'center', flexDirection: 'column'}}>


            <img style={{width: '100%', height: '50%', maxWidth: '100%', objectFit: 'cover', backgroundColor: grey200}}
              src={changeImageAddress(pledge.coverPhoto, 'autox120')} />

            <div style={{color: '#484848',
            fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', width: '100%', marginTop: '6px'}}>
              <b style={{color: '#FF9800'}}>{pledge.pledgeCount}</b> people,  <b style={{color: '#FF9800'}}>{dateDiffInDays(new Date(),pledge.deadline)}</b> days to go...
            </div>

            {/*
            <div style={{display: 'flex', paddingTop: '6px', width: '100%'}}>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1}}>
                  <div style={styles.number}>
                    {pledge.pledgeCount}
                  </div>
                  <div style={styles.bottomBit}>
                    /{pledge.target} people
                  </div>
                </div>

                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1}}>
                  <div style={styles.number}>
                    {dateDiffInDays(new Date(),pledge.deadline)}
                  </div>
                  <div style={styles.bottomBit}>
                    days to go...
                  </div>
                </div>
              </div>
              */}

            <LinearProgress style={{marginRight: '16px', marginLeft: '16px', marginTop: '10px', marginBottom: '6px'}} color={amber500} mode="determinate"
                 value={pledge.pledgedUsers.length/pledge.target*100} />
            <div style={{color: '#484848',
            fontWeight: 700, fontSize: '19px', lineHeight: '22px', maxHeight: '66px', letterSpacing: '-0.8px'
            , overflow: 'hidden', fontFamily: 'Raleway', textOverflow: 'ellipsis', width: '100%'}}>
              {pledge.title}
            </div>

            </div>
            }
        />

          ))}
          </GridList>
            </List>
            </div>
          </MediaQuery>

        <div style={{height: '36px'}}/>

        <div style={{height: '36px', width: '100%'}}>

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
  const subscriptionHandler = Meteor.subscribe("approvedPledges");

  return {
    pledges: Pledges.find({title: {$ne: 'Untitled Pledge'}, approved: true,
          deadline: { $gte : new Date()}}, {sort: {pledgeCount: -1}}).fetch(),
    loading: !subscriptionHandler.ready()
  };
}, PledgeList);
