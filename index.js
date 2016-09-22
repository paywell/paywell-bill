'use strict';

//dependencies
const path = require('path');
const _ = require('lodash');
const bill = require(path.join(__dirname, 'src', 'bill'));

exports = module.exports = function (options) {
  //merge options
  bill.defaults = _.merge({}, bill.defaults, options);

  //initialize
  bill.init();

  //export
  return bill;
};