import { Mongo } from 'meteor/mongo';

export const Pledges = new Mongo.Collection('pledges');
export const PledgeVisits = new Mongo.Collection('pledgevisits');
export const Details = new Mongo.Collection('details');
export const Responses = new Mongo.Collection('responses');
export const GroupCriteria = new Mongo.Collection('groupcriteria')
