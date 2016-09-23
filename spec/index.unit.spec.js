'use strict';

//dependencies
const path = require('path');
const expect = require('chai').expect;
const redis = require('paywell-redis')();
const bill = require(path.join(__dirname, '..'))();
const customerPhoneNumber = '0714999999';
const vendorPhoneNumber = '0714888888';

describe('bill', function () {
  before(function (done) {
    redis.clear(done);
  });

  it('should be exportable', function () {
    expect(bill).to.exist;
    expect(bill).to.be.an.Object;
  });

  describe('paycode', function () {
    it(
      'should be able to generate paycode',
      function (done) {
        expect(bill.paycode).to.be.a.Function;
        bill.paycode(function (error, paycode) {
          expect(error).to.not.exist;
          expect(paycode).to.exist;
          expect(paycode).to.have.length(8);
          done(error, paycode);
        });
      });
  });

  describe('reference', function () {
    it(
      'should be able to generate pay reference',
      function (done) {
        expect(bill.reference).to.be.a.Function;
        bill.reference(function (error, reference) {
          expect(error).to.not.exist;
          expect(reference).to.exist;
          expect(reference).to.have.length(8);
          done(error, reference);
        });
      });
  });

  describe('create', function () {
    before(function (done) {
      redis.clear(done);
    });

    describe('no enough balance', function () {

      before(function (done) {
        redis.clear(done);
      });

      it(
        'should be able to create bill',
        function (done) {
          const myBill = {
            vendor: vendorPhoneNumber,
            customer: customerPhoneNumber,
            amount: 100,
          };
          bill.create(myBill, function (error, _bill) {
            console.log(error);
            console.log(_bill);
            done(error, _bill);
          });
        });

      after(function (done) {
        redis.clear(done);
      });
    });

    it('should ensure verified vendor wallet before create bill');
    it('should ensure customer wallet before create bill');
    it('should be able to generate bill pay reference');
    it('should be able to generate bill onetime paycode');
    it('should be able to notify customer on new bill');
    it(
      'should support FIFO withdraw to prevent latest bill to get paycode'
    );
    it(
      'should ensure states as time of bill persisted with bill'
    );

    after(function (done) {
      redis.clear(done);
    });
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