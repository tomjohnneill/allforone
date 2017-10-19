import React , {PropTypes} from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import {Pledges, Details} from '/imports/api/pledges.js';
import {List, ListItem} from 'material-ui/List';
import ReactStars from 'react-stars';
import TextField from 'material-ui/TextField';
import {grey200, grey500, grey100, amber500, blue200} from 'material-ui/styles/colors';
import Avatar from 'material-ui/Avatar';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import Subheader from 'material-ui/Subheader';
import ArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import {Link, browserHistory} from 'react-router';
import IconButton from 'material-ui/IconButton';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import FontIcon from 'material-ui/FontIcon';


const styles = {
  box: {
    backgroundColor: grey200,
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
   small: {
     width: 36,
     height: 36,
     padding: '4px 4px 4px 20px'
   },
     toggle: {
    marginBottom: 16,
  },
  explanation: {
    fontSize: '8pt',
    color: grey500,
    paddingLeft: '16px',
    backgroundColor: 'white',
    paddingRight: '16px'
  }

}

/*
var plan = Stripe.plans.create({
  name: "Basic Plan",
  id: "basic-monthly",
  interval: "month",
  currency: "usd",
  amount: 0,
}, function(err, plan) {
// asynchronously called
});

var customer = Stripe.customers.create({
  email: "jenny.rosen@example.com",
}, function(err, customer) {
  // asynchronously called
});

Stripe.subscriptions.create({
  customer: "cus_4fdAW5ftNQow1a",
  items: [
    {
      plan: "basic-monthly",
    },
  ],
}, function(err, subscription) {
  // asynchronously called
});
*/

const INSTANCE = this;


export default class Support extends React.Component{

  constructor(props) {
    console.log(StripeCheckout)
    super(props);
    this.state = {processing: false}
  }

  componentWillMount() {
    const SELF = this;
    this.checkout = StripeCheckout.configure({
      key: Meteor.settings.public.stripe.PublishableKey,
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/1200px-Stripe_Logo%2C_revised_2016.svg.png',
      locale: 'auto',
      token(token) {
        const charge = {
          amount: token.amount || 500,
          currency: 'gbp',
          source: token.id,
          description: token.description || 'supporter',
          receipt_email: token.email,
        };
        console.log(token)
        Meteor.call('saveStripeToken', token, (err, customer) => {
          if (err) {
            Bert.alert(err.reason, 'danger')
          } else {
            console.log(customer)
            Meteor.call('saveStripeCustomer', customer)
          }
        })
      },
      closed() {
        SELF.setState({ processing: false });
      },
    });
  }

  handleBackClick = (e) => {
    e.preventDefault()
    browserHistory.push('/pages/pledges/' + this.props.params.pledge +'/' + this.props.params._id)
  }

  handleCreateCustomer = (e) => {
    e.preventDefault()
    Meteor.call('createStripeCustomer')
  }

  handleCreatePlan = (e) => {
    e.preventDefault()
    var plan = Stripe.plans.create({
      name: "Basic Plan",
      id: "basic-monthly",
      interval: "month",
      currency: "usd",
      amount: 0,
    }, function(err, plan) {
      if (err) {
        Bert.alert(err.reason, 'danger')
      } else {
        console.log(plan)
      }
    });
  }

  handleAssignCustomer = (e) => {
    e.preventDefault()
  }

  open =(e) => {
    e.preventDefault()
    this.setState({ processing: true });
    this.checkout.open({
      name: "Who's In",
      description: '£5 per month supporter',
      currency: 'gbp',
      amount: 500,
    });
  }

  render() {
    const { processing } = this.state;

    return (
    <div>


        <div>

          {processing ?
            <p className="alert alert-warning">
              <i className="fa fa-refresh fa-spin">
              </i> Processing payment...
            </p>
          :
            <div style={{display: 'flex', justifyContent: 'center'}}>
            <div style={{padding: '16px', width: '100%', maxWidth: '800px'}}>
              <p className="alert alert-warning">
                If you think our projects are a good idea, we'd really appreciate it if you'd help us cover our running costs for a few pounds per month.
              </p>
              <div style={{display: 'flex', width: '100%', justifyContent: 'center'}}>
              <RaisedButton primary={true} label ="Support Who's In" onTouchTap={this.open}/>
              </div>
            </div>
            </div>
          }

        </div>

    </div>
  )
  }
}
