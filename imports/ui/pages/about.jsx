import React , {PropTypes} from 'react';
import ReactDOM from 'react-dom';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';
import {grey200, grey500, grey100, amber500} from 'material-ui/styles/colors'

const styles={
  text: {
    fontSize: '10pt'
  },
  subheader: {
    paddingLeft: '0px',
    fontSize: '14pt',
    color: '#006699',
    fontFamily: 'Love Ya Like A Sister',
    paddingTop: '20px'
  },
  title: {
    textAlign: 'center',
    paddingTop: '10px',
    fontSize: '24pt',
    fontWeight: 'bold',
    marginBottom: '-24px',
    fontFamily: 'Love Ya Like A Sister'

  }
}

export const About = () => (
  <div style={{paddingLeft  : '16px', paddingRight: '16px'}}>
    <div style={styles.title}>
      About All For One
    </div>
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <img style={{width: '70%', zIndex: '-5', marginBottom: '-20px'}} src='/images/splash.jpg'/>
    </div>

    <Subheader style={styles.subheader}>
      The problem
    </Subheader>
    <div style={styles.text}>
      Most of the world's big problems can't be solved by any one individual.
      Any change you make to your life to try and make the world a better place is
      almost immediately balanced out by the 7 billion other people in the world who
      haven't changed. Making changes on your own achieves little to nothing.
      <br/><br/>
      But, people are ultimately social animals. If you make a change, and tell
      your friends about it, you're likely to persuade your friends to change as well.
      <br/><br/>
      What's more, we're more likely to do something if we think someone has already
      done us a favour. If you don't, you feel like you're scrounging off somebody else's
      actions, and no one likes that.
    </div>
    <Subheader style={styles.subheader}>
      So what is the solution here
    </Subheader>
    <div style={styles.text}>
      On this site, you'll find a set of pledges. Each pledge has a target goal.
      <br/><br/>
      If enough people sign up to the pledge, everyone signed up will do exactly what
      the pledge says. If the pledge doesn't reach its target within the deadline, no
      one will change anything.
      <br/><br/>
      This way, your decision to make a change is multiplied by the number of people
      you can persuade to sign up. Rather than a small individual contribution, you can
      make a potentially massive impact.
    </div>

    <Subheader style={styles.subheader}>
      Making your own pledge
    </Subheader>
    <div style={styles.text}>
      You're more than welcome to create your own pledge. In fact it would be amazing
      if you did. There are just a few things you should consider.
      <br/><br/>
      You can make a pledge about anything, but it has to be targetting a big problem -
      and a problem that can't be solved by an individual. Climate change is the most
      obvious example for this.
      <br/><br/>
      Pledges aren't for surreptitiously bragging to your friends about how great you
      are, so please no pledges about becoming a better person. While it's good to
      get more exercise, you don't need to persuade other people for that to have an
      impact - that's your own personal isssue, so don't make that a pledge.
    </div>


    <Subheader style={styles.subheader}>
      Scores and leaderboard
    </Subheader>
    <div style={styles.text}>
      The scores are based on the number of pledges you have signed up to, how
      popular the pledges are and the number of friends you have who are also signed
      up.
      <br/><br/>
      The best way to increase your score is to sign up to more pledges and share
      your pledges with all your friends (and get them to sign up.)
    </div>

    <Subheader style={styles.subheader}>
      Community
    </Subheader>
    <div style={styles.text}>
      The community tab has two sections: one for general chat, and one specific
      to the pledges.
      <br/><br/>
      Anyone with an account can start new threads or comment in the general section.
      You need to sign up to the pledge to see the pledge specific communities.
      The community is meant to be a way of providing advice, tips or sharing information
      to other people who have signed up to your pledges.
    </div>

  </div>
)
