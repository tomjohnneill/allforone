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
    this.state = {open: false}
    console.log(Meteor.userId())
    if (Math.random() > 0.8) {Meteor.call('updateUserCount', this.props.params._id)}
  }

  componentDidMount(props) {
    Meteor.call('countUsers', this.props.params._id)
  }

  handleFacebook = (e) => {
      console.log(this.props)
      var title = this.props.params.pledge
      var _id = this.props.params._id
      console.log(title + '   ' + _id)
      e.preventDefault()
      if (Meteor.userId() === null) {
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

  addOg = () => {
    var title = { property: "og:title", content:  this.props.pledge.title };
    var type = { property: "og:type", content: "article" };
    var url = { property: "og:url", content: 'https://www.allforone.io/pages/pledges/' + this.props.pledge.slug + '/' + this.props.pledge._id };
    var image = { property: "og:image", content: this.props.pledge.coverPhoto === undefined ? '/images/splash.jpg' : this.props.pledge.coverPhoto };
    var siteName = { property: "og:site_name", content: "All For One" };
    var description = { property: "ladadafsoid oinasodf" };

    DocHead.addMeta(title);
    DocHead.addMeta(type);
    DocHead.addMeta(url);
    DocHead.addMeta(image);
    DocHead.addMeta(siteName);
    DocHead.addMeta(description);
  }

  componentDidMount(props) {
    this.addOg()
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.loading && nextProps.user !== undefined && nextProps.user.justAddedPledge) {

      this.addOg()


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
      this.addOg()
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
    console.log(this.props)
    console.log(this.props.params._id)





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
            <CardHeader
              style={{overflow: 'hidden'}}
                title={this.props.pledge.creator}
                subtitle={'Pledged ' + this.props.pledge.updated}

                textStyle={{maxWidth: '60%', paddingRight: '0px'}}
                avatar={this.props.pledge.creatorPicture}
                children={
                  this.props.pledge.creatorId === Meteor.userId() ?
                    <div style={{float: 'right'}}>
                      <IconButton onTouchTap={this.handleEditClick} tooltip="Edit your pledge">
                        <Edit />
                      </IconButton>

                    </div> : null
                }
              />
            <CardMedia
              overlay={<CardTitle title={this.props.pledge.title} subtitle={"Time: " + this.props.pledge.duration} />}
            >
              <img src={this.props.pledge.coverPhoto === undefined ? '/images/white.png' : this.props.pledge.coverPhoto} />
            </CardMedia>
            <CardTitle children={
                <div>
                  <LinearProgress color={amber500} mode="determinate" value={this.props.pledge.pledgeCount/this.props.pledge.target} />

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
            <Divider/>
            <div style={{color: grey500, padding: '16px'}}>
              All or nothing - either all {this.props.pledge.target} of us, or none of us do this.
            </div>
            <CardText  children = {
                 <Tabs tabItemContainerStyle={{height: '36px'}} contentContainerStyle={{backgroundColor: grey100, padding: '10px'}}>
                   <Tab label='What' buttonStyle={{height: '36px'}}>
                       <div dangerouslySetInnerHTML={this.whatMarkup()}/>
                   </Tab>
                   <Tab label='Why' buttonStyle={{height: '36px'}}>
                     <div dangerouslySetInnerHTML={this.whyMarkup()}/>
                   </Tab>
                   <Tab label='How' buttonStyle={{height: '36px'}}>
                     <div dangerouslySetInnerHTML={this.howMarkup()}/>
                   </Tab>
                   <Tab label='Who' buttonStyle={{height: '36px'}}>
                     <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', overflowX: 'scroll'}}>
                       {this.props.user !== undefined &&
                         this.props.user.friends !== undefined
                         && this.props.user.friends.length > 0 ?
                       <div>
                         {
                         this.props.user.friends.map((friend) => (
                           this.props.pledge.pledgedUsers.includes(Meteor.users.findOne({'services.facebook.id':friend.id}) ? Meteor.users.findOne({'services.facebook.id':friend.id})._id : 'abasc') ?
                           <Avatar key={friend.id} src={friend.picture.data.url} style={{marginLeft: '-10px'}}/>
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
                    title={"What if " + this.props.pledge.target +" people decided to change the world?"} description={"I just agreed to " +this.props.pledge.title.toLowerCase() + " for " + this.props.pledge.duration.toLowerCase() + " - as long as " + (this.props.pledge.target-this.props.pledge.pledgedUsers.length).toString() + " more people do the same. Care to join me?"}
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
              <div>
              <RaisedButton secondary={true} fullWidth={true} label="OK, I'll join in (using Facebook)" onTouchTap={this.handleFacebook} />
              <div style={{textAlign: 'center', margin: '10px'}}>or</div>
              <RaisedButton fullWidth={true} label="Nah, the planet is screwed" onTouchTap={this.handleDecline.bind(this)}/>
              </div>}
            </CardActions>
          </Card>
          <FacebookProvider appId={Meteor.settings.public.FacebookAppId}>
            <Comments href="'https://www.allforone.io/pages/pledges/' + this.props.pledge.slug + '/' + this.props.pledge._id" />
          </FacebookProvider>
          <Dialog
              title="The planet is screwed"
              modal={false}
              open={this.state.open}
              onRequestClose={this.handleClose.bind(this)}
            >
              I mean, I don't really disagree. Still, I'm a little disappointed.
            </Dialog>
        </div>
      </DocumentTitle >
      }
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
    user: Meteor.users.findOne({_id: Meteor.userId()})
  }
}, DynamicPledge)
