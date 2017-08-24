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
import {Link, browserHistory} from 'react-router'

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

export class Pledge extends React.Component {
  constructor(props) {
    super(props);
    this.state = {open: false}
  }

  handleFacebook(e) {
      e.preventDefault()
      if (Meteor.userId() === null) {
        Meteor.loginWithFacebook({ requestPermissions: ['email', 'public_profile', 'user_friends']} ,err => {
          if (err) {
              console.log("facebook login didn't work at all")
              throw new Meteor.Error("Facebook login failed");
          }

          else {
            this.forceUpdate()
            Meteor.call('assignPledgeToUser', this.props.params.pledge)
            browserHistory.push('/pages/profile')
          }
      });
    } else {
      /*Meteor.call('assignPledgeToUser', this.props.params.pledge)*/

      browserHistory.push('/pages/profile/just-added/' + 'random-filler')
    }
  }

  handleDecline(e) {
    e.preventDefault()
    this.setState({open: true})
  }

  handleClose() {
  this.setState({open: false});
};

  render () {
    Meteor.call('countUsers', function(error, result) {
    // store the returned value in e.g. a session variable<br />
    Session.set('userCount', result);
  })
    console.log(Session.get('userCount'))

    return (
      <div>
        <div style={styles.box}>
          <Card>
            <CardHeader
                title="My pledge"
                subtitle="Tom Neill"
                avatar="/images/mugshot.jpg"
              />
            <CardMedia
              overlay={<CardTitle title="Giving up meat" subtitle="Time: 2 weeks" />}
            >
              <img src="/images/steak.jpg" />
            </CardMedia>
            <CardTitle children={
                <div>
                  <LinearProgress color={amber500} mode="determinate" value={Session.get('userCount')/1000} />

                  <div style={styles.cardTitle}>
                    <div style={styles.bigTitle}>
                      Commitments:
                    <div style={styles.smallTitle}>
                      <div style={styles.currentCommitments}><b>{Session.get('userCount')}</b> person</div>
                      <div style={styles.targetCommitments}>out of 1000</div>
                    </div>
                    </div>
                    <div style={styles.bigTitle}>
                      Deadline:
                      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        30 days
                      </div>
                    </div>
                  </div>
                </div>
              }/>
            <Divider/>
            <div style={{color: grey500, padding: '16px'}}>
              All or nothing - either all 1000 of us, or none of us do this.
            </div>
            <CardText  children = {
                 <Tabs tabItemContainerStyle={{height: '36px'}} contentContainerStyle={{backgroundColor: grey100, padding: '10px'}}>
                   <Tab label='What' buttonStyle={{height: '36px'}}>
                     Right now, I eat a whole lot of meat, probably at least twice a day.<br/><br/>
                     Apparently, cutting out meat from my diet could save 50% of the carbon emissions from my food. Over the course of a year, that would be a saving of 1.5 tonnes of CO2 (or just over 20% of the average Brit's emissions).<br/><br/>
                     But, in a country of 65 million, and a world of 7 billion, this is basically pointless.<br/><br/>
                   So, if 999 other people join up, all 1000 of us will stop eating meat for a month. If not, we can all sit back and watch the world burn.<br/>
                   </Tab>
                   <Tab label='Why' buttonStyle={{height: '36px'}}>
                     At the currently increasing rate of carbon emissions, we are likely headed for a world that is 4 degrees warmer by 2100.<br/><br/>
                   The long and short of that is: we run out of food, the world's largest cities will constant flood risks, the world will enter permanent recession, the poor will get poorer, water shortages will increase
                   , ecosystems will collapse, typhoons and hurricanes will devastate coastal regions, tropical diseases will spread towards the poles, the Arctic will be gone, Southern Europe could be half desert and it will rain even more in Britain.
                   <br/><br/>
                   The only way to avoid this is stop burning as many fossil fuels. And quickly.
                   <br/><br/>
                   One of the best ways to reduce the amount of CO2 we pump into the atmosphere is to stop eating meat.

                   </Tab>
                   <Tab label='How' buttonStyle={{height: '36px'}}>
                     People often suggest to me that I should stop eating meat to save the climate. Usually, my response is to point out how insignificant this is, considering global warming is (obviously) a global problem. <br/><br/>
                     Some people might be willing to make these sacrifices anyway, but to be honest, I'm not.<br/><br/>
                     The only way I would decide to stop eating meat is if it was part of a much bigger number of people doing the same - so the impact is multiplied into something significant.<br/><br/>
                   So, if you're like me, maybe join in? If there's less than 1000 people, none of us will change our lives at all - so you know it's not going to waste your time. By the way, this doesn't count if you're already veggie.<br/><br/>
                  Just click the big button below, and link this to your Facebook. It won't post anything on your profile, but if you decide to, you might be able to persuade a few more people to sign up.<br/>

                   </Tab>
                   <Tab label='Who' buttonStyle={{height: '36px'}}>
                     <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                       Click join to see which (if any) of your friends have committed
                     </div>
                   </Tab>
                 </Tabs>
              }>

            </CardText>
            <CardActions>
              <RaisedButton secondary={true} fullWidth={true} label="OK, I'll join in" onTouchTap={this.handleFacebook.bind(this)} />
              <div style={{textAlign: 'center', margin: '10px'}}>or</div>
              <RaisedButton fullWidth={true} label="Nah, the planet is screwed" onTouchTap={this.handleDecline.bind(this)}/>
            </CardActions>
          </Card>
          <FacebookProvider appId={Meteor.settings.public.FacebookAppId}>
            <Comments href="http://localhost:3000/pledge" />
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
      </div>
    )
  }
}
