'use strict';


/**
 * @module
 * @copyright paywell Team at byteskode <www.byteskode.com>
 * @description bills for paywell virtual wallet
 * @since 0.1.0
 * @author lally elias<lallyelias87@gmail.com, lally.elias@byteskode.com>
 * @singleton
 * @public
 */

//TODO make use of event emitter

//dependencies
const _ = require('lodash');
// const async = require('async');
const redis = require('paywell-redis');
// const phone = require('phone');
const shortid = require('shortid');
// const uuid = require('uuid');
const warlock = require('node-redis-warlock');
// const kue = require('kue');

//TODO add error codes
//TODO ensure wallet currency / units
//TODO ensure precision / decimal points

//default receipt options
const defaults = {
  prefix: 'paywell',
  redis: {},
  collection: 'bills',
  queue: 'bills',
  country: 'TZ',
  shortid: {
    worker: 1,
    seed: 999
  },
  warlock: {
    ttl: 10000
  }
};


/**
 * @name defaults
 * @description default options/settings
 * @type {Object}
 * @private
 * @since 0.1.0
 */
exports.defaults = _.merge({}, defaults);


/**
 * @function
 * @name init
 * @description initialize receipt internals
 * @since 0.1.0
 * @public
 */
exports.init = function () {

  //initialize redis client
  if (!exports.redis) {
    exports.redis = redis(exports.defaults);
  }

  //initialize warlock
  if (!exports.warlock) {
    exports.warlock = warlock(exports.redis.client());
  }

  //initialize shortid
  shortid.worker(exports.defaults.shortid.worker);
  shortid.seed(exports.defaults.shortid.seed);

};


/**
 * @function
 * @name deserialize
 * @description traverse bill and try convert values to their respective
 *              js type i.e numbers etc
 * @param  {Object} bill valid bill
 * @return {Object}        object with all nodes converted to their respective
 *                         js types
 *
 * @since 0.3.0
 * @private
 */
exports.deserialize = function (bill) {

  //ensure bill
  bill = _.merge({}, bill);

  //convert dates
  bill = _.merge({}, bill, {
    createdAt: bill.createdAt ? new Date(bill.createdAt) : undefined,
    updatedAt: bill.updatedAt ? new Date(bill.updatedAt) : undefined,
    duedAt: bill.verifiedAt ? new Date(bill.verifiedAt) : undefined,
    paidAt: bill.activatedAt ? new Date(bill.activatedAt) : undefined,
  });

  return bill;
};