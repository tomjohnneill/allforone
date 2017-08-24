import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import {grey200, grey500, grey100, amber500} from 'material-ui/styles/colors'
import CircularProgress from 'material-ui/CircularProgress';
import {List, ListItem} from 'material-ui/List';

export default class Support extends Component {
  constructor(props) {
    super(props);
    this.state = {planId: ''}
  }

  componentWillMount() {
    const SELF = this;
    var planId = this.state.planId
    var saveStripeToken = this.saveStripeToken.bind(this)
    var pledgeId = this.props.pledgeId
    this.checkout = StripeCheckout.configure({
      key: Meteor.settings.public.stripe.PublishableKey,
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/1200px-Stripe_Logo%2C_revised_2016.svg.png',
      locale: 'auto',
      token (token) {
        const charge = {
          amount: token.amount || 500,
          currency: 'gbp',
          source: token.id,
          description: token.description || 'supporter',
          receipt_email: token.email,
        };
        console.log(token)
        saveStripeToken(token, planId, pledgeId)
      },
      closed() {
        SELF.setState({ processing: false });
      },
    });
  }

  saveStripeToken (token, planId, pledgeId) {
    Meteor.call('savePledgeStripeToken', token, this.state.planId, pledgeId, (err, customer) => {
      if (err) {
        Bert.alert(err.reason, 'danger')
      } else {
        console.log(customer)
        Meteor.call('saveStripeCustomer', customer)
      }
    })
  }

  open (plan) {
    this.setState({ processing: true });
    this.setState({planId: plan.id})
    this.checkout.open({
      name: plan.name,
      description: '£' + plan.amount / 100 + ' per month supporter',
      currency: 'gbp',
      amount: plan.amount,
    });
  }

  render() {
    console.log(this.props)
    return (
      <div>
      {this.props.loading === true ? <div style={{height: '20vh', width: '100%',
                                            display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
      <CircularProgress/>
      </div> :
      <List style={{padding: '16px'}}>

        {this.props.plans ? this.props.plans.map((plan) => (
          <ListItem
            primaryText={plan.name}
            primaryTogglesNestedList={true}
            style={{backgroundColor: grey200}}
            rightIcon = {<div>{plan.amount}</div>}
            nestedListStyle={{marginLeft: '0px'}}
            onTouchTap={this.open.bind(this, plan)}
           />
       )) : null}

        <div style={{height: '16px'}}/>
        </List>}
    </div>
    )
  }
}
