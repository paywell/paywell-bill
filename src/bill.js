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
const wallet = require('paywell-wallet');
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

  //initialize wallet
  if (!exports.wallet) {
    //TODO add ability to pass wallet options
    exports.wallet = wallet();
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


/**
 * @function
 * @name paycode
 * @description generate a paycode that will be used by a wallet to clear a bill
 *              using wallet existing balance.
 *              
 *              This is only happen if a current wallet balance is enough
 *              balance to clear a bill.
 *              
 * @param  {Function} done a callback to be invoked on success or failure
 * @return {String|Error}        paycode or error
 * @since 0.1.0
 * @public
 */
exports.paycode = function (done) {
  //TODO should it be only number?
  //TODO store them in redis set to ensure uniqueness
  //TODO try use redis INCRBY to generate daily paycode
  //TODO shuffle with wallet phone number to ensure per wallet unique paycode
  exports.wallet.shortid(function (error, paycode) {
    done(error, paycode);
  });
};


/**
 * @function
 * @name reference
 * @description generate a pay reference that will be used by a wallet owner to 
 *              clear bill using external physical wallets i.e mobile money etc.
 *              
 *              This is only happen if a current wallet balance is not enough
 *              to clear a bill.
 *              
 * @param  {Function} done a callback to be invoked on success or failure
 * @return {String|Error}        pay reference or error
 * @since 0.1.0
 * @public
 */
exports.reference = function (done) {
  //TODO should it be only number?
  //TODO store them in redis set to ensure uniqueness
  //TODO try use redis INCRBY to generate daily paycode
  //TODO shuffle with wallet phone number to ensure per wallet unique reference
  exports.wallet.shortid(function (error, reference) {
    done(error, reference);
  });
};