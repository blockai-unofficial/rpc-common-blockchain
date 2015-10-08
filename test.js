var test = require('tape')
var RpcClient = require('bitcoind-rpc')
var env = require('node-env-file')
env('./.env', { raise: false })

var rpcuser = process.env.rpcuser
var rpcpassword = process.env.rpcpassword

var config = {
  protocol: 'http',
  user: rpcuser,
  pass: rpcpassword,
  host: '127.0.0.1',
  port: '18332'
}

var rpc = new RpcClient(config)

var testnetCommonBlockchainTests = require('abstract-common-blockchain/tests/testnet')

var testnetCommonBlockchain = require('./')({
  rpc: rpc
})

var testnetCommon = {
  setup: function (t, cb) {
    cb(null, testnetCommonBlockchain)
  },
  teardown: function (t, testnetCommonBlockchain, cb) {
    cb()
  }
}

testnetCommonBlockchainTests(test, testnetCommon)
