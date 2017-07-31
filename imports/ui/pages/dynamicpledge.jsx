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
import ArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import IconButton from 'material-ui/IconButton';
import Subheader from 'material-ui/Subheader';
import {
  ShareButtons,
  ShareCounts,
  generateShareIcon
} from 'react-share';
const FacebookIcon = generateShareIcon('facebook');
const TwitterIcon = generateShareIcon('twitter');
import muiThemeable from 'material-ui/styles/muiThemeable';
import Edit from 'material-ui/svg-icons/image/edit';
import DocumentTitle from 'react-document-title';
import Avatar from 'material-ui/Avatar';
import FlatButton from 'material-ui/FlatButton';
import CircularProgress from 'material-ui/CircularProgress';
import {Helmet} from "react-helmet";
import { DocHead } from 'meteor/kadira:dochead';
import Chip from 'material-ui/Chip';
import FontIcon from 'material-ui/FontIcon';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';


 function querystring() {
  var k, pair, qs, v, _i, _len, _ref, _ref1;
  qs = {};
  _ref = window.location.search.replace("?", "").split("&");
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    pair = _ref[_i];
    _ref1 = pair.split("="), k = _ref1[0], v = _ref1[1];
    qs[k] = v;
  }
  return qs;
};

const {
  FacebookShareButton,
  TwitterShareButton,
} = ShareButtons;

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
  },
  smallIcon: {
    width: 24,
    height: 24,
    color: 'white',
  },
  mediumIcon: {
    width: 48,
    height: 48,
  },
  largeIcon: {
    width: 60,
    height: 60,
  },
  small: {
    width: 36,
    height: 36,
    padding: '4px 4px 4px 20px'
  },
  medium: {
    width: 96,
    height: 96,
    padding: 24,
  },
  large: {
    width: 120,
    height: 120,
    padding: 30,
  },
  chip: {
  margin: 4,
},
}

var _MS_PER_DAY = 1000 * 60 * 60 * 24;

// a and b are javascript Date objects
export function dateDiffInDays(a, b) {
  // Discard the time and time-zone information.
  var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}

export class DynamicPledge extends React.Component {
  constructor(props) {
    super(props);
    this.state = {open: false, adminDrawerOpen: false}
    console.log(Meteor.userId())
    Meteor.call('updateUserCount', this.props.params._id)
    console.log(querystring())
    console.log(Session.get('allforone'))
    var qs, tracking;

    // Parse query string
    qs = querystring();

    if (qs.sid) {
     tracking = {
       sid: qs.sid,
       cmp: qs.cmp  ? qs.cmp : null,
       s1: qs.s1 ? qs.s1 : null,
       s2: qs.s2 ? qs.s2 : null,
       s3: qs.s3 ? qs.s3 : null,
       s4: qs.s4 ? qs.s4 : null,
       s5: qs.s5 ? qs.s5 : null
     };
   } else {
     tracking = null
   }
    if (!Session.get(this.props.params._id)) {
      Meteor.call('logVisit', this.props.params._id, tracking, 'new', Session.get('allforone'), (err, res) => {
        if (err) {
          console.log(error)
        } else {
        console.log(res);
        Session.set(this.props.params._id, res)
        }
      });
    } else {
      Meteor.call('logVisit', this.props.params._id, tracking, 'returning', Session.get('allforone'))
    }
  }

  componentDidMount(props) {
    Meteor.call('countUsers', this.props.params._id)
  }

  handleTabClick = (tab) => {
    mixpanel.track("Clicked on " + tab + " tab")
  }

  handleFacebook = (e) => {
      console.log(this.props)
      var title = this.props.params.pledge
      var _id = this.props.params._id
      console.log(title + '   ' + _id)
      Meteor.call('logSignUpClick', Session.get(this.props.params._id))
      e.preventDefault()
      if (Meteor.userId() === null) {
        mixpanel.track("Clicked create account")
        Meteor.loginWithFacebook({ requestPermissions: ['email', 'public_profile', 'user_friends'], _id, title },function(error, result) {
          if (error) {
              console.log("facebook login didn't work at all")
              Bert.alert(error.reason, 'danger')
          }

          else {
            console.log(_id)
            Meteor.call('assignPledgeToUser', _id, title, function(error, result) {
              if (error) {
                Bert.alert(error.reason, 'danger' )
              } else {
                Bert.alert("Pledge pledged", 'success')
                Meteor.call('tagUserAsJustAdded', this.props.params._id, this.props.params.pledge)
                Meteor.call('findFriends')
                Meteor.call('triggerSocialScoreCalculate')
                Meteor.call('recalculateScore', Meteor.userId())
                browserHistory.push('/pages/profile/just-added/' + title +'/' + _id)
              }
            })
          }
      });
    } else {
      console.log('about to call assign pledge to user')
      console.log(_id)
      Meteor.call('assignPledgeToUser', _id, title, function(error, result) {
        if (error) {
          Bert.alert(error.reason, 'danger' )
        } else {

          Bert.alert('Pledge pledged', 'success')
          Meteor.call('recalculateScore', Meteor.userId())
          browserHistory.push('/pages/profile/just-added/' + title +'/' + _id)
        }
      })
    }
  }

  handleDecline(e) {
    e.preventDefault()
    this.setState({open: true})
  }

  handleClose() {
  this.setState({open: false});
};

  handleEditClick = (e) => {
    e.preventDefault()
    if (this.props.pledge.creatorId === Meteor.userId()) {
      browserHistory.push(`/pages/pledges/${ this.props.pledge.slug }/${ this.props.pledge._id }/edit` )
    }
  }

  handleUnpledge(_id, title, e) {
    e.preventDefault()
    Meteor.call('unpledgeFromPledge', _id, title)
  }

  whatMarkup() {
    return {__html: this.props.pledge.what.replace(/\n/g, "<br />")}
  }

  whyMarkup() {
    return {__html: this.props.pledge.why.replace(/\n/g, "<br />")}
  }

  howMarkup() {
    return {__html: this.props.pledge.how.replace(/\n/g, "<br />")}
  }

  handleAdminDrawer = (e) => {
    e.preventDefault()
    this.setState({adminDrawerOpen: !this.state.adminDrawerOpen})
  }

  handleAnalyticsClick = (e) => {
    this.setState({adminDrawerOpen: !this.state.adminDrawerOpen})
    browserHistory.push('/pages/pledges/' + this.props.pledge.slug + '/' + this.props.pledge._id + '/analytics')
  }

  handleProjectClick = (e) => {
    this.setState({adminDrawerOpen: !this.state.adminDrawerOpen})
    browserHistory.push('/pages/pledges/' + this.props.pledge.slug + '/' + this.props.pledge._id + '/project')
  }


  addOg = (nextProps) => {
    var title = { property: "og:title", content:  nextProps.pledge.title };
    var type = { property: "og:type", content: "article" };
    var url = { property: "og:url", content: 'https://www.allforone.io/pages/pledges/' + nextProps.pledge.slug + '/' + nextProps.pledge._id };
    var image = { property: "og:image", content: nextProps.pledge.coverPhoto === undefined ? 'https://www.allforone.io/images/splash.jpg' : nextProps.pledge.coverPhoto };
    var siteName = { property: "og:site_name", content: "All For One" };
    var description = { property: "og:description", content: "I just agreed to " +nextProps.pledge.title.toLowerCase() + " for " + nextProps.pledge.duration.toLowerCase() + " - as long as " + (nextProps.pledge.target-nextProps.pledge.pledgedUsers.length).toString() + " more people do the same. Care to join me?" };

    DocHead.addMeta(title);
    DocHead.addMeta(type);
    DocHead.addMeta(url);
    DocHead.addMeta(image);
    DocHead.addMeta(siteName);
    DocHead.addMeta(description);
  }

  addTwitterMeta = (nextProps) => {
    var card = { property: "twitter:card", content: "summary_large_image" };
    var site = {property: "twitter:site", content: "@allforonedotio"};
    var title = {property:"twitter:title", content: nextProps.pledge.title };
    var description = {property: "twitter:description", content:  "I just agreed to " +nextProps.pledge.title.toLowerCase() + " for " + nextProps.pledge.duration.toLowerCase() + " - as long as " + (nextProps.pledge.target-nextProps.pledge.pledgedUsers.length).toString() + " more people do the same. Care to join me?"}
    var image = {property: "twitter:image", content: nextProps.pledge.coverPhoto === undefined ? 'https://www.allforone.io/images/splash.jpg' : nextProps.pledge.coverPhoto}

    DocHead.addMeta(card);
    DocHead.addMeta(site);
    DocHead.addMeta(title);
    DocHead.addMeta(description);
    DocHead.addMeta(image);
  }

  handleFriendClick(_id, e) {
    e.preventDefault()
    mixpanel.track('Clicked on friend from who tab')
    var friend = Meteor.users.findOne({'services.facebook.id': _id})
    browserHistory.push('/profile/' + friend._id)
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.loading) {
      DocHead.removeDocHeadAddedTags()
      DocHead.setTitle(nextProps.pledge.title);
      this.addOg(nextProps)
      this.addTwitterMeta(nextProps)
    }
    if (!nextProps.loading && nextProps.user !== undefined && nextProps.user.justAddedPledge) {

      console.log('Executing on will receive props')
      Meteor.call('assignPledgeToUser', nextProps.params._id, nextProps.params.pledge, function(error, result) {
        if (error) {
          Bert.alert(error.reason, 'danger' )
        } else {
          Bert.alert("Pledge pledged", 'success')
          Meteor.call('removeJustAddedTag')
          Meteor.call('findFriends')
          Meteor.call('triggerSocialScoreCalculate')
          Meteor.call('recalculateScore', Meteor.userId())
          browserHistory.push('/pages/profile/just-added/' + nextProps.params.pledge +'/' + nextProps.params._id)
        }
      })
    }
  }

  componentWillUpdate(nextProps) {
    if (!nextProps.loading && nextProps.user !== undefined && nextProps.user.justAddedPledge) {

      console.log('Excecuting on componentWillUpdate')
      Meteor.call('assignPledgeToUser',nextProps.params._id, nextProps.params.pledge, function(error, result) {
        if (error) {
          Bert.alert(error.reason, 'danger' )
        } else {
          Bert.alert("Pledge pledged", 'success')
          Meteor.call('removeJustAddedTag')
          Meteor.call('findFriends')
          Meteor.call('triggerSocialScoreCalculate')
          Meteor.call('recalculateScore', Meteor.userId())
          browserHistory.push('/pages/profile/just-added/' + nextProps.params.pledge +'/' + nextProps.params._id)
        }
      })
    }
  }

  render () {

    console.log(querystring())

    if (!this.props.loading) {
      console.log("I just agreed to " +this.props.pledge.title.toLowerCase() + " for " + this.props.pledge.duration.toLowerCase() + " - as long as " + (this.props.pledge.target-this.props.pledge.pledgedUsers.length).toString() + " more people do the same. Care to join me?")
      console.log(this.props.pledge.coverPhoto ? this.props.pledge.coverPhoto : 'https://www.allforone.io/splash.jpg')
      console.log('https://www.allforone.io/pages/pledges/' + this.props.pledge.slug + '/' + this.props.pledge._id)
    }

    return (
      <div>
        <Link to='/pages/pledges'>
        <div style={{display: 'flex' ,backgroundColor: grey500, color: 'white'}}>
                  <IconButton
            iconStyle={styles.smallIcon}
            style={styles.small}
          >
            <ArrowBack />
          </IconButton>

        <div style={{width: '100%', paddingLeft: '16px', backgroundColor: grey500, color: 'white', alignItems: 'center', display: 'flex'}}>

          BACK TO PLEDGES
        </div>
        </div>
        </Link>

        {this.props.loading ? <div style={{height: '80vh', width: '100%',
                                              display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <CircularProgress/>
        </div> :
          <DocumentTitle title={this.props.pledge.title}>
        <div style={styles.box}>
          <Card>
            {this.props.pledge.creatorId === Meteor.userId() || Roles.userIsInRole(Meteor.userId(), 'admin') ?
              <div>
            <CardHeader
              style={{overflow: 'hidden'}}
                title={this.props.pledge.creator}
                subtitle={'Pledged ' + this.props.pledge.updated}

                textStyle={{maxWidth: '60%', paddingRight: '0px'}}
                avatar={this.props.pledge.creatorPicture}
                children={
                    <div style={{float: 'right'}}>
                      <IconButton onTouchTap={this.handleEditClick} tooltip="Edit your pledge">
                        <Edit />
                      </IconButton>

                    </div>
                }
              />
            <RaisedButton style={{marginBottom: '16px'}} fullWidth={true}
              primary={true}
              label='Admin Tools' onTouchTap={this.handleAdminDrawer} />
            </div>:
              <div style={{padding: '10px'}}>
                <Chip

                >
                  <Avatar src={this.props.pledge.creatorPicture} />
                  by {this.props.pledge.creator}
                </Chip></div>}
            <CardMedia
              overlay={<CardTitle title={this.props.pledge.title} subtitle={"Time: " + this.props.pledge.duration} />}
            >
              <img src={this.props.pledge.coverPhoto === undefined ? '/images/white.png' : this.props.pledge.coverPhoto} />
            </CardMedia>
            <CardTitle children={
                <div>
                  {
                    this.props.pledge.summary ?
                    <p style={{marginBottom: '16px'}}>
                    {this.props.pledge.summary}
                  </p>
                  : null}

                    <br/>
                  <LinearProgress  color={amber500} mode="determinate" value={this.props.pledge.pledgeCount/this.props.pledge.target*100} />


                  <div style={styles.cardTitle}>
                    <div style={styles.bigTitle}>
                      Commitments:
                    <div style={styles.smallTitle}>
                      <div style={styles.currentCommitments}><b>{this.props.pledge.pledgeCount}</b> people</div>
                      <div style={styles.targetCommitments}>out of {this.props.pledge.target}</div>
                    </div>
                    </div>
                    <div style={styles.bigTitle}>
                      Deadline:
                      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <b>{dateDiffInDays(new Date(),this.props.pledge.deadline)} days</b>
                      </div>
                    </div>
                  </div>
                </div>
              }/>
              {this.props.pledge.pledgedUsers.includes(Meteor.userId()) ?
                <div>
                <Subheader >Share your pledge</Subheader>
                  <div style={{display: 'flex', justifyContent: 'center'}}>
                  <FacebookShareButton
                    style={{cursor: 'pointer'}}
                    children = {<div>
                      <FacebookIcon size={36} round={true}/>
                  </div>}
                    url = {'https://www.allforone.io/pages/pledges/' + this.props.pledge.slug + '/' + this.props.pledge._id}
                    title={this.props.pledge.title} description={"I just agreed to " +this.props.pledge.title.toLowerCase() + " for " + this.props.pledge.duration.toLowerCase() + " - as long as " + (this.props.pledge.target-this.props.pledge.pledgedUsers.length).toString() + " more people do the same. Care to join me?"}
                    picture = {this.props.pledge.coverPhoto ? this.props.pledge.coverPhoto : 'https://www.allforone.io/splash.jpg'}
                    />
                  <div style={{width: '10px'}}></div>
                  <TwitterShareButton
                    style={{cursor: 'pointer'}}
                    children = {<TwitterIcon size={36} round={true}/>}
                    url = {'https://www.allforone.io/pages/pledges/' + this.props.pledge.slug + '/' + this.props.pledge._id}
                    title={"If another " + (this.props.pledge.target-this.props.pledge.pledgedUsers.length).toString() + ' people join me, I am ' + this.props.pledge.title + ' for ' + this.props.pledge.duration }
                    />
                </div>

                <div style={{display: 'flex', justifyContent: 'center', marginTop: '10px'}}>
                <FlatButton   label='Unpledge from pledge' onTouchTap={this.handleUnpledge.bind(this, this.props.pledge._id, this.props.pledge.slug)}/>
                </div>
              </div>

              :
              <div style={{display: 'flex', justifyContent: 'center'}}>
                <div style={{width: '60%'}}>
                  {Meteor.userId() === null ?
                    <div>
                  <RaisedButton
                    icon={<FontIcon color='white' style={{marginRight: '16px'}} className="fa fa-facebook-official fa-2x" />}
                     primary={true} fullWidth={true} label="Join Now" onTouchTap={this.handleFacebook} />
                   <div style={{fontSize: '8pt', textAlign: 'center', color:grey500, marginTop: '8px'}}>

                      This does not allow us to post to Facebook without your permission
                    </div>
                    </div>:
                  <RaisedButton primary={true} fullWidth={true} label="Join Now" onTouchTap={this.handleFacebook} /> }
                </div>
            </div>}

            <div style={{color: grey500, padding: '16px'}}>
              All or nothing - either all {this.props.pledge.target} of us, or none of us do this.
            </div>
            <Divider/>
            <br/>
            {this.props.pledge.impact ?
                <div style={{paddingLeft: '16px'}}>
                  <b>Total Impact: </b> {this.props.pledge.impact}
                </div> :
                <div/>
            }

            <CardText  children = {
                 <Tabs onChange={this.handleTabClick} tabItemContainerStyle={{height: '36px'}} contentContainerStyle={{backgroundColor: grey100, padding: '10px'}}>
                   <Tab value='what' label='What' buttonStyle={{height: '36px'}}>
                       <div dangerouslySetInnerHTML={this.whatMarkup()}/>
                   </Tab>
                   <Tab value='why' label='Why' buttonStyle={{height: '36px'}}>
                     <div dangerouslySetInnerHTML={this.whyMarkup()}/>
                   </Tab>
                   <Tab value = 'how' label='How' buttonStyle={{height: '36px'}}>
                     <div dangerouslySetInnerHTML={this.howMarkup()}/>
                   </Tab>
                   <Tab value='who' label='Who' buttonStyle={{height: '36px'}}>
                     <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', overflowX: 'scroll'}}>
                       {this.props.user !== undefined &&
                         this.props.user.friends !== undefined
                         && this.props.user.friends.length > 0 ?
                       <div>
                         {
                         this.props.user.friends.map((friend) => (
                           this.props.pledge.pledgedUsers.includes(Meteor.users.findOne({'services.facebook.id':friend.id}) ? Meteor.users.findOne({'services.facebook.id':friend.id})._id : 'abasc') ?
                           <IconButton style={{marginLeft: '-10px'}} tooltip={friend.first_name + ' ' + friend.last_name}>
                              <Avatar key={friend.id} src={friend.picture.data.url} onTouchTap={this.handleFriendClick.bind(this, friend.id)}/>
                           </IconButton>
                           : null
                         ))
                       }
                       </div>
                         : this.props.user === undefined  ?
                      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        Click join to see which (if any) of your friends have committed
                      </div>
                        :
                       <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                       Sorry, none of your friends have signed up just yet
                     </div>}
                     </div>
                   </Tab>
                 </Tabs>
              }>

            </CardText>
            <CardActions>

            </CardActions>
          </Card>

        </div>
      </DocumentTitle >
      }
      {/*
      <div>
      <FacebookProvider appId={Meteor.settings.public.FacebookAppId}>
        <Comments href={'https://www.allforone.io' +browserHistory.getCurrentLocation().pathname} />
      </FacebookProvider>
      </div>
      */}
      <Drawer
        onRequestChange={(open) => this.setState({adminDrawerOpen: open})}
        docked={false}
        open={this.state.adminDrawerOpen}>
        <Subheader>Admin Tools</Subheader>
        <Divider/>
          <MenuItem onTouchTap={this.handleAnalyticsClick} >Analytics</MenuItem>
          <MenuItem onTouchTap={this.handleAdminDrawer} disabled={true}>Mailing List Management</MenuItem>
          <MenuItem onTouchTap={this.handleAdminDrawer} disabled={true}>Send Notifications</MenuItem>
          <MenuItem onTouchTap={this.handleAdminDrawer} disabled={true}>Payments</MenuItem>
          <MenuItem onTouchTap={this.handleProjectClick} >Project Management</MenuItem>
        </Drawer>

      </div>
    )
  }
}

DynamicPledge.propTypes = {
  pledge: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
}

export default createContainer(({params}) => {
  const subscriptionHandler = Meteor.subscribe('editor', params._id);
  const userHandler = Meteor.subscribe('userData', params._id);
  const userFriends = Meteor.subscribe('userFriends')

  return {
    loading: !subscriptionHandler.ready(),
    pledge: Pledges.findOne({_id: params._id}),
    user: Meteor.users.findOne({_id: Meteor.userId()}, {fields: {_id: 1, 'friends': 1, 'justAddedPledge': 1}})
  }
}, DynamicPledge)
