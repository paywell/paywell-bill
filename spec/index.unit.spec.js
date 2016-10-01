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

    describe('without enough balance', function () {

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
            expect(error).to.not.exist;
            expect(_bill).to.exist;
            expect(_bill._id).to.exist;
            expect(_bill.reference).to.exist;
            expect(_bill.amount).to.exist;
            expect(_bill.customer).to.exist;
            expect(_bill.customer).to.be.an.Object;
            expect(_bill.vendor).to.exist;
            expect(_bill.vendor).to.be.an.Object;
            expect(_bill.customer.balance)
              .to.be.below(myBill.amount);
            expect(_bill.createdAt).to.exist;
            done(error, _bill);
          });
        });

      after(function (done) {
        redis.clear(done);
      });
    });

    describe('with enough balance', function () {

      before(function (done) {
        redis.clear(done);
      });

      before(function (done) {
        bill.wallet.create(customerPhoneNumber, done);
      });

      before(function (done) {
        bill.wallet.create(vendorPhoneNumber, done);
      });

      before(function (done) {
        bill.wallet.deposit({
          phoneNumber: customerPhoneNumber,
          amount: 400
        }, function (error, _wallet) {
          done(error, _wallet);
        });
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
            expect(error).to.not.exist;
            expect(_bill).to.exist;
            expect(_bill._id).to.exist;
            expect(_bill.paycode).to.exist;
            expect(_bill.amount).to.exist;
            expect(_bill.customer).to.exist;
            expect(_bill.customer).to.be.an.Object;
            expect(_bill.vendor).to.exist;
            expect(_bill.vendor).to.be.an.Object;
            expect(_bill.customer.balance)
              .to.be.above(myBill.amount);
            expect(_bill.createdAt).to.exist;
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
      'should support FIFO withdraw'
    );
    it(
      'should ensure states as time of bill persisted with bill'
    );

    after(function (done) {
      redis.clear(done);
    });
  });

  describe('get', function () {
    const myBill = {
      vendor: vendorPhoneNumber,
      customer: customerPhoneNumber,
      amount: 100,
    };
    let paycodeOrReference;
    before(function (done) {
      redis.clear(done);
    });

    before(function (done) {
      bill.create(myBill, function (error, _bill) {
        paycodeOrReference = _bill.reference || _bill.paycode;
        done(error, _bill);
      });
    });

    it(
      'should be able to get bill using paycode or reference',
      function (done) {
        bill.get(paycodeOrReference, function (error, _bill) {
          expect(error).to.not.exist;
          expect(_bill).to.exist;
          expect(_bill._id).to.exist;
          expect(_bill.customer).to.exist;
          expect(_bill.vendor).to.exist;
          expect(_bill.amount).to.exist;
          expect(_bill.amount).to.be.equal(myBill.amount);
          expect(_bill.reference).to.be.equal(paycodeOrReference);
          done(error, _bill);
        });
      });

    it(
      'should be able to get bills of a given wallet using phone number'
    );

    after(function (done) {
      redis.clear(done);
    });
  });

  describe('pay', function () {
    before(function (done) {
      redis.clear(done);
    });

    describe('without enough wallet balance', function () {
      let reference;
      before(function (done) {
        redis.clear(done);
      });

      before(function (done) {
        bill.wallet.create(customerPhoneNumber, done);
      });

      before(function (done) {
        bill.wallet.create(vendorPhoneNumber, done);
      });

      before(function (done) {
        const myBill = {
          vendor: vendorPhoneNumber,
          customer: customerPhoneNumber,
          amount: 100,
        };
        bill.create(myBill, function (error, _bill) {
          reference = _bill.reference;
          done(error, _bill);
        });
      });

      it(
        'should be able to pay bill with pay reference',
        function (done) {
          bill.pay({ reference }, function (error, _bill) {
            expect(error).to.not.exist;
            expect(_bill).to.exist;
            expect(_bill.paidAt).to.exist;
            done(error, _bill);
          });
        });

      after(function (done) {
        redis.clear(done);
      });
    });

    describe('with enough wallet balance', function () {
      let paycode;
      before(function (done) {
        redis.clear(done);
      });

      before(function (done) {
        bill.wallet.create(customerPhoneNumber, done);
      });

      before(function (done) {
        bill.wallet.create(vendorPhoneNumber, done);
      });

      before(function (done) {
        bill.wallet.deposit({
          phoneNumber: customerPhoneNumber,
          amount: 400
        }, function (error, _wallet) {
          done(error, _wallet);
        });
      });

      before(function (done) {
        const myBill = {
          vendor: vendorPhoneNumber,
          customer: customerPhoneNumber,
          amount: 100,
        };
        bill.create(myBill, function (error, _bill) {
          paycode = _bill.paycode;
          done(error, _bill);
        });
      });

      it(
        'should be able to pay bill with paycode',
        function (done) {
          bill.pay({ paycode }, function (error, _bill) {
            expect(error).to.not.exist;
            expect(_bill).to.exist;
            expect(_bill.paidAt).to.exist;
            done(error, _bill);
          });
        });

      after(function (done) {
        redis.clear(done);
      });
    });

    it(
      'should be ensure paycode or pay reference can used only once in case bill has due amount'
    );
    it('should be able to pay bill by installments');
    it('should be able to notify bill about due');
    it('should be able to notify bill past due');
    it('should notify vendor once bill cleared');

    after(function (done) {
      redis.clear(done);
    });

  });

  describe('pay', function () {
    before(function (done) {
      redis.clear(done);
    });

    describe('without enough wallet balance', function () {
      let reference;
      before(function (done) {
        redis.clear(done);
      });

      before(function (done) {
        bill.wallet.create(customerPhoneNumber, done);
      });

      before(function (done) {
        bill.wallet.create(vendorPhoneNumber, done);
      });

      before(function (done) {
        const myBill = {
          vendor: vendorPhoneNumber,
          customer: customerPhoneNumber,
          amount: 100,
        };
        bill.create(myBill, function (error, _bill) {
          reference = _bill.reference;
          done(error, _bill);
        });
      });

      it(
        'should be able to pay bill with pay reference',
        function (done) {
          bill.pay({ reference }, function (error, _bill) {
            expect(error).to.not.exist;
            expect(_bill).to.exist;
            expect(_bill.paidAt).to.exist;
            done(error, _bill);
          });
        });

      after(function (done) {
        redis.clear(done);
      });
    });

    describe('with enough wallet balance', function () {
      let paycode;
      before(function (done) {
        redis.clear(done);
      });

      before(function (done) {
        bill.wallet.create(customerPhoneNumber, done);
      });

      before(function (done) {
        bill.wallet.create(vendorPhoneNumber, done);
      });

      before(function (done) {
        bill.wallet.deposit({
          phoneNumber: customerPhoneNumber,
          amount: 400
        }, function (error, _wallet) {
          done(error, _wallet);
        });
      });

      before(function (done) {
        const myBill = {
          vendor: vendorPhoneNumber,
          customer: customerPhoneNumber,
          amount: 100,
        };
        bill.create(myBill, function (error, _bill) {
          paycode = _bill.paycode;
          done(error, _bill);
        });
      });

      it(
        'should be able to pay bill with paycode',
        function (done) {
          bill.pay({ paycode }, function (error, _bill) {
            expect(error).to.not.exist;
            expect(_bill).to.exist;
            expect(_bill.paidAt).to.exist;
            done(error, _bill);
          });
        });

      after(function (done) {
        redis.clear(done);
      });
    });

    it(
      'should be ensure paycode or pay reference can used only once in case bill has due amount'
    );
    it('should be able to pay bill by installments');
    it('should be able to notify bill about due');
    it('should be able to notify bill past due');
    it('should notify vendor once bill cleared');

    after(function (done) {
      redis.clear(done);
    });

  });

  describe('fail', function () {
    let bill_;
    before(function (done) {
      redis.clear(done);
    });

    before(function (done) {
      bill.wallet.create(customerPhoneNumber, done);
    });

    before(function (done) {
      bill.wallet.create(vendorPhoneNumber, done);
    });

    before(function (done) {
      const myBill = {
        vendor: vendorPhoneNumber,
        customer: customerPhoneNumber,
        amount: 100,
      };
      bill.create(myBill, function (error, _bill) {
        bill_ = _bill;
        done(error, _bill);
      });
    });

    it('should be able to set failedAt timestamp', function (done) {
      bill.fail(bill_, function (error, _bill) {
        expect(error).to.not.exist;
        expect(_bill).to.exist;
        expect(_bill.failedAt).to.exist;
        expect(_bill.failedAt).to.be.a.Date;
        done(error, _bill);
      });
    });

    after(function (done) {
      redis.clear(done);
    });

  });

  describe('status', function () {
    it('should be able to set bill status');
    it('should be able to trace bill using status');
  });

  describe('search', function () {
    it('should be able to search bill(s)');
  });

  describe('analytics', function () {
    it('should be able to update total bill count so far');
    it('should be able to update total bill paid count');
    it('should be able to update total bill paid count');
  });

  after(function (done) {
    redis.clear(done);
  });

  after(function () {
    redis.quit();
  });
});