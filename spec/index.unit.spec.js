'use strict';

//dependenncies
const redis = require('paywell-redis')();

describe('bill', function () {
  before(function (done) {
    redis.clear(done);
  });

  describe('create', function () {
    it('should be able to create bill');
    it('should generate bill onetime paycode');
  });

  describe('get', function () {
    it('should be able to get bill');
  });

  describe('pay', function () {
    it('should be able to pay bill');
    it('should be able to pay bill by installments');
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