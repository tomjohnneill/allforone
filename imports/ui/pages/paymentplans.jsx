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
import {Card, CardTitle} from 'material-ui/Card'

const styles = {
  box: {
    backgroundColor: grey200
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
    paddingLeft: '0px',
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


export class PaymentPlans extends React.Component{


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
    Meteor.call('addPlanToPledge', this.state.amount, this.state.planName, this.props.params._id)

  }

  handleAssignCustomer = (e) => {
    e.preventDefault()
  }

  open =(e) => {
    e.preventDefault()
    this.setState({ processing: true });
    this.checkout.open({
      name: 'All For One',
      description: '£5 per month supporter',
      currency: 'gbp',
      amount: 500,
    });
  }

  handleAmountChange = (e, newValue) => {
    this.setState({amount: newValue})
  }

  handlePlanNameChange = (e, newValue) => {
    this.setState({planName: newValue})
  }

  render() {
    const { processing } = this.state;

    return (
    <div>
      <span onTouchTap={this.handleBackClick}>
      <div style={{display: 'flex' ,backgroundColor: grey500, color: 'white'}}>
                <IconButton
          iconStyle={styles.smallIcon}
          style={styles.small}
        >
          <ArrowBack />
        </IconButton>

      <div style={{width: '100%', paddingLeft: '16px', backgroundColor: grey500, color: 'white', alignItems: 'center', display: 'flex'}}>

        BACK TO PLEDGE
      </div>
      </div>
    </span>
    <div style={styles.box}>
      <Subheader style={{backgroundColor: 'white'}}>
        Subscription payments
      </Subheader>

      {        !this.props.loading && (!this.props.pledge.stripe || !this.props.pledge.stripe.stripe_user_id ) &&
        (Meteor.userId() === this.props.pledge.creatorId || Roles.userIsInRole('admin', Roles.GLOBAL_GROUP)
        || Roles.userIsInRole('administrator', this.props.params._id)) ?
      <div style={{backgroundColor: 'white' , height: '200px', width: '100%', display: 'flex',
      alignItems: 'center', justifyContent: 'center'}}>
    <a href={"https://connect.stripe.com/oauth/authorize?response_type=code&client_id=" + Meteor.settings.public.stripe.client_id + "&scope=read_write&state=" + this.props.params._id +
          "&redirect_uri=" + Meteor.settings.public.ROOT_URL+ '/stripe-redirect'}
    className="stripe-connect light-blue"><span>Connect with Stripe</span></a>
        </div>
        :
      !this.props.loading && (Meteor.userId() === this.props.pledge.creatorId || Roles.userIsInRole('admin', Roles.GLOBAL_GROUP)
        || Roles.userIsInRole('administrator', this.props.params._id)) ?
      <div>

      <Card style={{marginLeft: '5px', marginRight: '5px', marginTop: '10px', padding: '10px'}}>
        <CardTitle style={{paddingBottom: '0px', paddingLeft: '6px', paddingTop: '6px'}}
          title='Your plans'/>
        {!this.props.loading && this.props.pledge.stripe &&
          (Meteor.userId() === this.props.pledge.creatorId || Roles.userIsInRole('admin', Roles.GLOBAL_GROUP)
          || Roles.userIsInRole('administrator', this.props.params._id)) &&
          this.props.pledge.stripe.plans ? this.props.pledge.stripe.plans.map((plan) => (
          <ListItem primaryText={plan.name} leftIcon={<Avatar/>} rightIcon={<div style={{color: grey500}}>{'£' + plan.amount/100 }</div>}/>
        )) :
          <div style={{textAlign: 'center', verticalAlign: 'center', margin: '10px'
            , backgroundColor: grey200, height: '50px'
            , boxSizing: 'border-box', color: grey500,
          display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div>
              Currently you do not have any subscription plans
            </div>
          </div>
      }
      </Card>



        <Card style={{marginLeft: '5px', marginRight: '5px', marginTop: '20px', paddingBottom: '16px', position: 'relative'}}>
          <CardTitle title='Add a new plan' children={
              <div style={styles.explanation}>
                Choose a monthly subscription amount for your supporters. Choosing a few different options makes it more likely your supporters will subscribe.
              </div>
            }/>
          <Subheader>
            Name your plan
          </Subheader>
          <div style={{paddingLeft: '24px'}}>
            <TextField onChange={this.handlePlanNameChange} hintText='Plan Name'/>
          </div>
          <Subheader>
            Set the monthly payment
          </Subheader>
          <div style={{display: 'flex', paddingLeft: '24px', marginBottom: '30px'}}>
            <div style={{height: '48px', position: 'relative'}}>
              <div style={{bottom: '10px', position: 'absolute'}}>£
                </div>
              </div>
          <div style={{width: '30px', marginLeft: '16px'}}>
            <TextField onChange={this.handleAmountChange} fullWidth={true}/>
        </div>
        </div>
        <div style={{position: 'absolute', bottom: '10px', right: '10px', marginTop: '40px', display: 'flex'}}>
          <FlatButton label='Cancel'/>
          <RaisedButton primary={true} onTouchTap={this.handleCreatePlan} label='Add Plan'/>
        </div>
      </Card>
    </div>
      :
      !this.props.loading ?

      <div style={{display: 'flex', backgroundColor: grey200, height: '250px', width: '100%', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{padding: '5px'}}>
            You do not have permission to access this page
          </div>
    </div>
    :
      null }
      </div>

      </div>
  )
  }
}

PaymentPlans.propTypes = {
  pledge: PropTypes.object.isRequired,


};

export default createContainer(({params}) => {
  const subscriptionHandler = Meteor.subscribe("editor", params._id);
  const pledgeUserHandler = Meteor.subscribe("userData");
  const roleHandler = Meteor.subscribe("pledgeRoles");

  return {
    loading: !subscriptionHandler.ready() || !pledgeUserHandler.ready() || !roleHandler.ready(),
    pledge: Pledges.find({_id: params._id}).fetch()[0],
    users: Meteor.users.find({}).fetch(),
    roles: Meteor.roles.find({}).fetch(),
  };
}, PaymentPlans);
