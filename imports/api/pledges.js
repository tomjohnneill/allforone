import { Mongo } from 'meteor/mongo';

export const Pledges = new Mongo.Collection('pledges');
export const PledgeVisits = new Mongo.Collection('pledgevisits');
