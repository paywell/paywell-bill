paywell-bill
================

[![Build Status](https://travis-ci.org/paywell/paywell-bill.svg?branch=master)](https://travis-ci.org/paywell/paywell-bill)
[![Dependency Status](https://img.shields.io/david/paywell/paywell-bill.svg?style=flat)](https://david-dm.org/paywell/paywell-bill)
[![npm version](https://badge.fury.io/js/paywell-bill.svg)](https://badge.fury.io/js/paywell-bill)

bills for paywell virtual wallet

## Requirements
- [Redis 2.8.0+](http://redis.io/)
- [NodeJS 6.5.0+](https://nodejs.org/en/)

## Installation
```sh
$ npm install --save paywell-bill
```

## Usage
```js
const bill = require('paywell-bill')();

//create new bill
bill.create(options,done);

//get existing bill
bill.get(options,done);

//save or update existing bill
bill.save(_bill,done);

//pay bill using paycode
bill.pay(paycode,done);

//pay bill using pay reference
bill.pay(reference,done);

//fail bill
bill.fail(_bill, done);
```

## Bill Structure
```js
{
    vendor:String, //in E.164
    customer:String, //in E.164
    amount:Number,
    uuid:String,
    paycode:String,
    reference:String,
    createdAt:Date,
    duedAt:Date,
    paidAt:Date,
    failedAt:Date, //signal bill pay failure
    provider:{
        name:String,
        country:String,
        currency:String,
        paycode:String,
        shortcode:String,
        status:String
    }
}
```

## Concept
- A reference will be used to pay if wallet has no enough balance
    - should provide what is the current balance and what amount has remained for the bill to be cleared 
- A paycode will be used to pay if wallet has enough balance to pay

## Testing
* Clone this repository

* Install all development dependencies
```sh
$ npm install
```

* Then run test
```sh
$ npm test
```

## Contribute
It will be nice, if you open an issue first so that we can know what is going on, then, fork this repo and push in your ideas. Do not forget to add a bit of test(s) of what value you adding.

## Licence
The MIT License (MIT)

Copyright (c) 2015 byteskode, paywell, lykmapipo & Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. 