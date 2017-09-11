import React , {PropTypes} from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import {grey200, grey500, grey100, amber500, grey300} from 'material-ui/styles/colors'
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import LinearProgress from 'material-ui/LinearProgress';
import Divider from 'material-ui/Divider';
import {Tabs, Tab} from 'material-ui/Tabs';
import { Session } from 'meteor/session';
import Dialog from 'material-ui/Dialog';
import {Link, browserHistory} from 'react-router';
import {Pledges, Details} from '/imports/api/pledges.js';
import ArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import IconButton from 'material-ui/IconButton';
import Subheader from 'material-ui/Subheader';
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
import MessengerPlugin from 'react-messenger-plugin';
import Form from '/imports/ui/components/form.jsx';
import OrgFeedback from '/imports/ui/components/organisationfeedback.jsx';
import ShowChart from 'material-ui/svg-icons/editor/show-chart';
import ThumbsUpDown from 'material-ui/svg-icons/action/thumbs-up-down';
import Notifications from 'material-ui/svg-icons/social/notifications';
import Payment from 'material-ui/svg-icons/action/payment';
import Assignment from 'material-ui/svg-icons/action/assignment';
import People from 'material-ui/svg-icons/social/person-outline';
import Group from 'material-ui/svg-icons/social/group';
import Loadable from 'react-loadable';

const Loading = () => (
  <div/>
)

const SocialShareLoadable = Loadable({
  loader: () => import('/imports/ui/components/socialshare.jsx'),
  loading: Loading
});

const SupportLoadable = Loadable({
  loader: () => import('/imports/ui/components/support.jsx'),
  loading: Loading
});

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
  number: {
    color: '#1251BA',
    fontSize: '20px',

  },
  bottomBit: {
    color: grey500,
    marginTop: '-5px'
  },
  chip: {
  margin: 4,
},
explanation: {
  fontSize: '8pt',
  color: grey500
}
}


const PaymentPlansLoadable = Loadable({
  loader: () => import('/imports/ui/pages/paymentplans.jsx'),
  loading: Loading
});

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
    this.state = {open: false, adminDrawerOpen: false, selectedIndex: 0}

    Meteor.call('updateUserCount', this.props.params._id)

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

  descriptionMarkup() {
    return {__html: this.props.pledge.description ?
      this.props.pledge.description.replace('<img', '<img style="width:100%;height:auto"') : this.props.pledge.what}
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

  handleConsoleLog = (e) => {
    setTimeout(() => {
       this.setState({selectedIndex: this.refs.tabs.state.selectedIndex})
   }, 100);
  }

  handleFeedbackClick = (e) => {
    this.setState({adminDrawerOpen: !this.state.adminDrawerOpen})
    browserHistory.push('/pages/pledges/' + this.props.pledge.slug + '/' + this.props.pledge._id + '/pledged-users')
  }

  handleUserInputClick = (e) => {
    this.setState({adminDrawerOpen: !this.state.adminDrawerOpen})
    browserHistory.push('/pages/pledges/' + this.props.pledge.slug + '/' + this.props.pledge._id + '/form-builder')
  }

  handleUserListClick = (e) => {
    this.setState({adminDrawerOpen: !this.state.adminDrawerOpen})
    browserHistory.push('/pages/pledges/' + this.props.pledge.slug + '/' + this.props.pledge._id + '/user-list')
  }

  handleGroupsClick = (e) => {
    this.setState({adminDrawerOpen: !this.state.adminDrawerOpen})
    browserHistory.push('/pages/pledges/' + this.props.pledge.slug + '/' + this.props.pledge._id + '/user-groups')
  }

  handleBroadcastClick = (e) => {
    this.setState({adminDrawerOpen: !this.state.adminDrawerOpen})
    browserHistory.push('/pages/pledges/' + this.props.pledge.slug + '/' + this.props.pledge._id + '/broadcast')
  }

  handlePaymentsClick = (e) => {
    this.setState({adminDrawerOpen: !this.state.adminDrawerOpen})
    browserHistory.push('/pages/pledges/' + this.props.pledge.slug + '/' + this.props.pledge._id + '/payment-plans')
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
        }
      })
    }
  }




  render () {
    var tabLength = 2
    if (!this.props.loading) {
      console.log(this.props.details)
      if (this.props.pledge.stripe && this.props.pledge.stripe.plans) {
        tabLength += 1
      }
      if (this.props.details && this.props.details.length > 0) {
        console.log(this.props.details)
        tabLength += 1
      }
    }
    console.log('Tab Length: ' + tabLength)

    var inkBarLeft = this.refs.tabs ? this.refs.tabs.state.selectedIndex : 0 * 50 + 20

    return (
      <div>
        <Link to='/pages/pledges'>
        <div style={{display: 'flex' ,backgroundColor: grey300, color: 'white'}}>
                  <IconButton
            iconStyle={styles.smallIcon}
            style={styles.small}
          >
            <ArrowBack />
          </IconButton>

        <div style={{width: '100%', paddingLeft: '16px', backgroundColor: grey300, color: 'white', alignItems: 'center', display: 'flex'}}>

          BACK TO PLEDGES
        </div>
        </div>
        </Link>

        {this.props.loading ? <div style={{height: '80vh', width: '100%',
                                              display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <CircularProgress/>
        </div> :
          <DocumentTitle title={this.props.pledge.title}>

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
            <FlatButton style={{marginBottom: '16px'}} fullWidth={true}
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

            >
              <img src={this.props.pledge.coverPhoto === undefined ? '/images/white.png' : this.props.pledge.coverPhoto} />
            </CardMedia>
            <CardTitle
              style={{overflowX:'hidden'}}
              title={this.props.pledge.title}
              subtitle={this.props.pledge.summary}
              children={
                <div>
                  <div style={{height: '16px'}}/>
                  <LinearProgress  color={amber500} mode="determinate" value={this.props.pledge.pledgeCount/this.props.pledge.target*100} />
                  <div style={{display: 'flex', paddingTop: '16px'}}>
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1}}>
                      <div style={styles.number}>
                        {this.props.pledge.pledgeCount}
                      </div>
                      <div style={styles.bottomBit}>
                        /{this.props.pledge.target} people
                      </div>
                    </div>

                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1}}>
                      <div style={styles.number}>
                        {dateDiffInDays(new Date(),this.props.pledge.deadline)}
                      </div>
                      <div style={styles.bottomBit}>
                        days to go...
                      </div>
                    </div>
                  </div>
                </div>

              }/>
              {this.props.pledge.pledgedUsers.includes(Meteor.userId()) ?
                <div>
                  {this.props.user.userMessengerId  ? <div>
                  <Subheader >Share your pledge</Subheader>
                    <SocialShareLoadable pledge={this.props.pledge}/>
                  </div> :
                  <div >

                    <div style={{overflowX: 'hidden',display: 'flex',
                      alignItems: 'center', justifyContent: 'center', paddingTop: '6px', flexDirection: 'column'}}>
                      <div style={{marginLeft: '103px', marginBottom: '20px', marginTop: '5px'}}>
                  <MessengerPlugin
                    appId={Meteor.settings.public.FacebookAppId}
                    pageId={Meteor.settings.public.FacebookPageId}
                    size='large'
                    color='blue'
                    passthroughParams={Meteor.userId()}
                  />

                </div>
                <div style={styles.explanation}>
                  <p style={{textAlign: 'center'}}>
                    Click this button to receive a message when the pledge reaches its target
                  </p>
                </div>
                </div>
              </div>
              }


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

            {/*
            <div style={{color: 'rgba(0, 0, 0, 0.54)', padding: '16px', fontSize: '14px'}}>
              All or nothing - either all {this.props.pledge.target} of us, or none of us do this.
            </div>
            */}
            <Divider/>


            <Tabs
              ref='tabs'
              style={{overflowX: 'hidden'}}
              onChange={this.handleConsoleLog}
              tabTemplateStyle={{backgroundColor: 'white'}}
              inkBarStyle={{left: (this.state.selectedIndex) * (100/tabLength) + 5 + '%', backgroundColor: '#1251BA'
                , zIndex: 2, width: 100/tabLength - 10 +  '%'}}
              children={<Divider/>}
              >
              <Tab
                buttonStyle={{textTransform: 'none', color: 'rgba(0, 0, 0, 0.54)', backgroundColor: 'white',
                                }}
                label='The Story'>
                <CardText  children = {
                    <div>
                         <div dangerouslySetInnerHTML={this.descriptionMarkup()}/>
                           <div className="fb-like" href={this.props.pledge.facebookURL}
                          width='200px'  layout="standard" action="like" size="small" showFaces="true" share="false"></div>
                    </div>
                  }>

                </CardText>
              </Tab>
              {this.props.details && this.props.details.length > 0 ?
              <Tab
                buttonStyle={{textTransform: 'none', color: 'rgba(0, 0, 0, 0.54)', backgroundColor: 'white',
                                }}
                label='Actions'>

                <Divider/>
                <div style={{marginBottom: '200px'}}>

                    <Form pledgeId={this.props.params._id}  handleFacebook={this.handleFacebook} pledgedUsers={this.props.pledge.pledgedUsers}/>

                </div>



              </Tab> : null}
              <Tab
                buttonStyle={{textTransform: 'none', color: 'rgba(0, 0, 0, 0.54)', backgroundColor: 'white',
                                }}
                label='Feedback'>
                <div>

                    <OrgFeedback
                      pledgedUsers={this.props.pledge.pledgedUsers}
                      pledgeId={this.props.params._id} pledgeCreatorId={this.props.pledge.creatorId}/>

                </div>
              </Tab>

              {this.props.pledge.stripe && this.props.pledge.stripe.plans ?
              <Tab
                buttonStyle={{textTransform: 'none', color: 'rgba(0, 0, 0, 0.54)', backgroundColor: 'white',
                                }}
                label='Support'>
                <div>

                    <SupportLoadable
                      plans={this.props.pledge.stripe ? this.props.pledge.stripe.plans : []}
                      pledgeId={this.props.params._id}/>

                </div>
              </Tab> : null}
            </Tabs>


            <CardActions>

            </CardActions>
          </Card>


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
        <Subheader style={{backgroundColor: grey200, fontSize: '20px' ,color: 'rgba(0, 0, 0, 0.87)'}}>Admin Tools</Subheader>
        <Divider/>
          <MenuItem leftIcon={<ShowChart/>} onTouchTap={this.handleAnalyticsClick} >Analytics</MenuItem>
          <MenuItem leftIcon={<ThumbsUpDown/>} onTouchTap={this.handleFeedbackClick} >Feedback</MenuItem>
          <MenuItem leftIcon={<Group/>} onTouchTap={this.handleGroupsClick} >User Groups</MenuItem>
          <MenuItem leftIcon={<FontIcon
                    className="fa fa-bullhorn"
                  />} onTouchTap={this.handleBroadcastClick} >Broadcast</MenuItem>
          <MenuItem leftIcon={<Notifications/>} onTouchTap={this.handleAdminDrawer} disabled={true}>Send Notifications</MenuItem>
          <MenuItem leftIcon={<FontIcon
                    className="fa fa-question-circle-o"
                  />} onTouchTap={this.handleUserInputClick}>Get User Input</MenuItem>
                <MenuItem leftIcon ={<Payment/>} onTouchTap={this.handlePaymentsClick}>Payments</MenuItem>
          <MenuItem leftIcon={<Assignment/>} onTouchTap={this.handleProjectClick} >Project Management</MenuItem>
          <MenuItem leftIcon={<People/>} onTouchTap={this.handleUserListClick} >Pledged Users List</MenuItem>
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
  const userFriends = Meteor.subscribe('userFriends');
  const detailHandler = Meteor.subscribe('details', params._id);
  const reviewHandler = Meteor.subscribe('pledgeReviews', params._id);

  return {
    loading: !subscriptionHandler.ready() || !reviewHandler.ready() || !detailHandler.ready(),
    pledge: Pledges.findOne({_id: params._id}),
    details: Details.find({pledgeId: params._id}).fetch(),
    user: Meteor.users.find({_id: Meteor.userId()}, {fields: {_id: 1, 'friends': 1, 'justAddedPledge': 1, 'userMessengerId': 1}}).fetch()[0]
  }
}, DynamicPledge)
