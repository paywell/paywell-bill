'use strict';

//dependenncies
const redis = require('paywell-redis')();

describe('bill', function () {
  before(function (done) {
    redis.clear(done);
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