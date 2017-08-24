import React, {Component} from 'react'
import {browserHistory} from 'react-router'

export default class StripeRedirect extends React.Component {
  constructor(props) {
    super(props);
    // Meteor.call('activateStripe', this.props.location.query.state)
    Meteor.call('findStripeConnectId', this.props.location.query.code, this.props.location.query.state)

  }

  componentDidMount() {
    browserHistory.push('/pages/pledges/pledge-title/' + this.props.location.query.state + '/payment-plans')
  }

  render() {
    return(
        <div style={{height: '50vh', width: '100%', textAlign: 'center', verticalAlign: 'center'}}>
      Redirecting...
    </div>
    )
  }
}
