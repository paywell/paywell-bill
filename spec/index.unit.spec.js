'use strict';

//dependenncies
const redis = require('paywell-redis')();

describe('bill', function () {
  before(function (done) {
    redis.clear(done);
  });

  describe('create', function () {
    it('should be able to create bill');
  });

  describe('get', function () {
    it('should be able to get bill');
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