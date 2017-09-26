
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Pledges } from '/imports/api/pledges.js';
import { Projects } from '/imports/api/projects.js';
import { PledgeVisits } from '/imports/api/pledges.js';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import { request } from "meteor/froatsnook:request";

Meteor.methods({
  createStripeCustomer: function() {
    var Stripe = StripeAPI(Meteor.settings.private.stripe.secretKey)
    var userId = this.userId
    Stripe.customers.create({
      metadata: {allForOneId: this.userId}
    }, function(err, customer) {
      if (err) {
        console.log(err)
      } else {
        console.log(customer)
        Meteor.users.update({_id: userId}, {$set: {stripeCustomerId: customer.id}})
      }
    });
  }
})

Meteor.methods({
  createBasicMonthlyPlan: function() {
    var Stripe = StripeAPI(Meteor.settings.private.stripe.secretKey)
    var plan = Stripe.plans.create({
      name: "Basic Plan",
      id: "basic-monthly",
      interval: "month",
      currency: "usd",
      amount: 0,
    }, function(err, plan) {
      if (err) {
        console.log(err)
      } else {
        console.log(plan)
      }
    });
  }
})

Meteor.methods({
  createSubscriptionPlan: function(amount, planName) {
        if (Roles.userIsInRole(this.userId, ['administrator','admin'], pledgeId)) {
      var Stripe = StripeAPI(Meteor.settings.private.stripe.secretKey)
      var cleanPlanName = getSlug(planName, {custom: {"'":""}})
      console.log(cleanPlanName)
      var plan = Stripe.plans.create({
        name: planName,
        id: cleanPlanName,
        interval: "month",
        currency: "gbp",
        amount: amount * 100,
      }, function(err, plan) {
        if (err) {
          console.log(err)
        } else {
          console.log(plan)
        }
      });
    }
  }
})

Meteor.methods({
  'saveStripeToken': function(token) {
    var Stripe = StripeAPI(Meteor.settings.private.stripe.secretKey)
    var userId = this.userId
    console.log(token)
    Stripe.customers.create({
      metadata: {allForOneId: this.userId},
      email: token.email,
      source: token.id,
      plan: 'basic-monthly'
    }, Meteor.bindEnvironment(function(err, customer) {
      if (err && err.type === 'StripeCardError') {
          // The card has been declined
          throw new Meteor.Error("stripe-charge-error", err.message);
        } else {
          console.log(customer)
          if (userId) {
            Meteor.users.update({_id: userId}, {$set: {stripeCustomerId: customer.id}})
            if (!Meteor.user().profile.email) {
              Meteor.users.update({_id: userId}, {$set :{'profile.email': token.email}})
            }
          }
        }
    }))
  }
})

Meteor.methods({
  'savePledgeStripeToken': function(token, planId, pledgeId) {
    var Stripe = StripeSync(Meteor.settings.private.stripe.secretKey)
    var userId = this.userId
    var stripe_user_id = Pledges.findOne({_id: pledgeId}).stripe.stripe_user_id
    console.log(token)

    try{
      var customer = Stripe.customers.create({
        metadata: {allForOneId: this.userId},
        email: token.email,
        source: token.id,
        plan: planId
    },{stripe_account: stripe_user_id})
    console.log(customer)
    Meteor.users.update({_id: this.userId}, {$set: {stripeCustomerId: customer.id}})
    Meteor.users.update({_id: userId}, {$set :{'profile.email': token.email}})
    Pledges.update({_id: pledgeId}, {$addToSet: {'stripe.subscribers' : this.userId}})
      }
      catch(error){
          console.log(error)
      }
  }
})

Meteor.methods({
  'findStripeConnectId' : function(code, pledgeId) {
    console.log(code)
    console.log(pledgeId)
    var Stripe = StripeAPI(Meteor.settings.private.stripe.secretKey)
    var options = {
      url: 'https://connect.stripe.com/oauth/token',
      form: {
        grant_type: "authorization_code",
        client_id: Meteor.settings.public.stripe.client_id,
        code: code,
        client_secret:Meteor.settings.private.stripe.secretKey
      }
    }
    var res = request.postSync(options)
    console.log(res.response.statusCode)
    console.log(res.body)
    if (res.response.statusCode == 200) {
      console.log(res.body)
      var info = JSON.parse(res.body);
      Pledges.update({_id: pledgeId}, {$set: {'stripe.stripe_user_id' : info.stripe_user_id}})
    }
  }
})

Meteor.methods({
  'addPlanToPledge' : function(amount, planName, pledgeId) {
    if (Roles.userIsInRole(this.userId, ['administrator','admin'], pledgeId)) {
      var stripe_user_id = Pledges.findOne({_id: pledgeId}).stripe ?
        Pledges.findOne({_id: pledgeId}).stripe.stripe_user_id : Meteor.user().stripeCustomerId
      var Stripe = StripeSync(Meteor.settings.private.stripe.secretKey)
      var adjustedAmount = amount * 100
      var cleanPlanName = getSlug(planName, {custom: {"'":""}})

      var mySubscription = {
      customerInfo: {
          stripe_account: stripe_user_id
      },
      plan: {
          amount: adjustedAmount,
          interval: "month",
          name: planName,
          id: cleanPlanName
        }
      };

      try{
        var plan = Stripe.plans.create({

        amount: mySubscription.plan.amount,
        interval: mySubscription.plan.interval,
        name: mySubscription.plan.name,
        currency: "gbp",
        id: mySubscription.plan.id
      },{stripe_account: stripe_user_id})
      Pledges.update({_id: pledgeId}, {$addToSet: {'stripe.plans' : mySubscription.plan}})
        }
        catch(error){
            throw new Meteor.Error(1001, error.message);
        }

    }

  }
})

Meteor.methods({
  saveStripeCustomer: function(customer) {

  }
})
