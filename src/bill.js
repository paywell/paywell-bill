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
const async = require('async');
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


exports.key = function (referenceOrPaycode) {
  let key = referenceOrPaycode;
  key = exports.redis.key(exports.defaults.collection, referenceOrPaycode);
  return key;
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


/**
 * @function
 * @name get
 * @description get bill(s)
 * @param  {String|String[]|Object} options reference(s) or paycode(s) or phone number(s)
 * @param  {Function} done a callback to invoke on success or failure
 * @return {Object|Object[]}        collection or single bills
 * @since 0.1.0
 * @public
 */
exports.get = function (options, done) {
  //TODO throw error in case of missing bill
  //get specific bill(s)
  const client = exports.redis;

  async.waterfall([

    function ensureBillKey(next) {
      //prepare paycode(s) or reference(s) collection
      let keys = [].concat(options);
      //convert bill paycode or reference to bill keys
      keys = _.map(keys, function (_option) {
        return exports.key(_option);
      });
      next(null, keys);
    },

    function getBill(keys, next) {
      client.hash.get(keys, next);
    },

    function deserializeBill(bills, next) {

      //deserialize bills
      if (_.isArray(bills)) {
        bills = _.map(bills, function (bill) {
          bill = exports.deserialize(bill);
          return bill;
        });
      }

      //deserialize bill
      else {
        bills = exports.deserialize(bills);
      }

      next(null, bills);
    }
  ], function (error, bills) {
    done(error, bills);
  });

};


/**
 * @function
 * @name save
 * @description update existing bill
 * @param  {Object}   bill valid paywell bill
 * @param  {Function} done   a callback to invoke on success or failure
 * @return {Object}          bill or error
 * @since 0.1.0
 * @public
 */
exports.save = function (bill, done) {
  //TODO ensure _id exists
  //TODO obtain save lock
  //TODO store wallet bills in sorted set 

  //prepare save options
  const options = {
    collection: exports.defaults.collection,
    index: true,
    ignore: ['_id', 'payload']
  };

  //obtain redis client
  const client = exports.redis;

  //update timestamps
  const today = new Date();
  bill = _.merge({}, {
    updatedAt: today,
    createdAt: today
  }, bill);

  //persist bill
  client.hash.save(bill, options, function (error, _bill) {
    _bill = exports.deserialize(_bill);
    done(error, _bill);
  });
};


exports.create = function (options, done) {
  //TODO refactor
  //TODO withdraw in case customer has enough balance?
  //TODO should lock wallet during bill creation
  //ensure options
  options = _.merge({}, options);

  async.waterfall([

    function validateOptions(next) {
      // TODO implement validation
      next(null, options);
    },

    function ensureWallets(options, next) {
      async.parallel({
        customer: function getOrCreateCustomerWallet(after) {
          //TODO should we send activation SMS if not activated?
          exports.wallet.create(options.customer, after);
        },
        vendor: function getOrCreateVendorWallet(after) {
          //TODO should we send activation SMS if not activated?
          //TODO vendor wallet must already be verified
          exports.wallet.create(options.vendor, after);
        }
      }, function (error, wallets) {
        //TODO pick only specific fields from wallets
        //merge wallet details
        options = _.merge({}, options, wallets);
        next(error, options);
      });
    },

    function generatePayCodeOrReference(options, next) {
      //check if customer has enough balance
      const customerHasEnoughBalance = !!options.customer &&
        !!options.customer.balance &&
        options.customer.balance >= options.amount;

      //generate paycode
      if (customerHasEnoughBalance) {
        exports.paycode(function (error, paycode) {
          //extend options with paycode
          if (!!paycode) {
            options = _.merge({}, options, { paycode: paycode });
          }
          next(error, options);
        });
      }

      //generate pay reference
      else {
        exports.reference(function (error, reference) {
          //extend options with reference
          options = _.merge({}, options, { reference: reference });
          if (!!reference) {
            next(error, options);
          }
        });
      }
    },

    function generateBillId(options, next) {
      // generate bill redis key
      let key = options.paycode || options.reference;
      key = exports.key(key);
      //extend options with redis key
      options = _.merge({}, options, { _id: key });
      next(null, options);
    },

    function saveBill(bill, next) {
      //prepare save options
      const today = new Date();

      //set creation timestamp
      bill = _.merge({}, bill, {
        createdAt: today,
        updatedAt: today
      });

      //persist wallet
      exports.save(bill, next);

      //TODO send paycode or pay reference
    }

  ], function (error, bill) {
    done(error, bill);
  });
};


exports.pay = function (options, done) {
  //TODO obtain lock for both wallet and bill during pay
  //TODO handle bill with no amount(i.e topups)
  //TODO allow pay using paycode or reference
  //TODO what if payment is below due amount
  //TODO check if bill already paid
  //TODO refactor

  //ensure options
  options = _.merge({}, options);

  async.waterfall([

    function getBill(next) {
      exports.get(options.paycode || options.reference, next);
    },

    function payBill(_bill, next) {
      const today = new Date();

      //set paid date
      _bill = _.merge({}, _bill, {
        paidAt: today,
        updatedAt: today
      });

      //pay using paycode(wallet)
      if (_bill.paycode) {
        //TODO ensure same paycode?

        const withdraw = {
          phoneNumber: _bill.customer.phoneNumber,
          amount: _bill.amount
        };

        //TODO ensure single lock for both _bill and withdraw
        //withdraw from wallet
        exports.wallet.withdraw(withdraw, function (error /*, wallet*/ ) {
          if (error) {
            next(error);
          } else {
            //update _bill
            exports.save(_bill, next);
          }
        });
      }

      //pay using reference
      //TODO implement
      //TODO ensure there is topup or cash receipt
      //TODO should we deposit then withdraw? To keep track of
      //wallet deposit and withdraw
      else {
        exports.save(_bill, next);
      }
    },

    function finalizeBill(_bill, next) {
      // TODO notify vendor about payments (sms & callback url)
      // once bill full paid or partially paid
      next(null, _bill);
    }
  ], function (error, _bill) {
    done(error, _bill);
  });
};