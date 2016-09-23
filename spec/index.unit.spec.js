'use strict';

//dependencies
const path = require('path');
const expect = require('chai').expect;
const redis = require('paywell-redis')();
const bill = require(path.join(__dirname, '..'))();
// const customerPhoneNumber = '0714999999';
// const vendorPhoneNumber = '0714888888';

describe('bill', function () {
  before(function (done) {
    redis.clear(done);
  });

  it('should be exportable', function () {
    expect(bill).to.exist;
    expect(bill).to.be.an.Object;
  });

  describe('paycode', function () {
    it('should be able to generate paycode');
  });

  describe('reference', function () {
    it('should be able to generate pay reference');
  });

  describe('create', function () {
    it('should be able to create bill');
    it('should be able to generate bill pay reference');
    it('should be able to generate bill onetime paycode');
    it('should be able to notify customer on new bill');
  });

  describe('get', function () {
    it('should be able to get bill');
  });

  describe('pay', function () {
    it('should be able to pay bill');
    it('should be able to pay bill by installments');
    it('should be able to notify bill about due');
    it('should be able to notify bill past due');
    it('should notify vendor once bill cleared');
  });

  describe('search', function () {
    it('should be able to search bill(s)');
  });

  after(function (done) {
    redis.clear(done);
  });

  after(function () {
    redis.quit();
  });
});