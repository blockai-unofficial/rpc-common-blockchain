var test = require('tape');
var txHexToJSON = require('bitcoin-tx-hex-to-json');  
var RpcClient = require('bitcoind-rpc');
var env = require('node-env-file');
env('./.env', { raise: false });

var rpcuser = process.env.rpcuser;
var rpcpassword = process.env.rpcpassword;
 
var config = {
  protocol: 'http',
  user: rpcuser,
  pass: rpcpassword,
  host: '127.0.0.1',
  port: '18332',
};

var rpc = new RpcClient(config);

var commonBlockchain = require("./")({
  rpc: rpc
});


// var txid0 = "fe23506aa169d839e786b3a14f1d3ba604a8c707e867685542b24b40ae0b46a5";
// var txid1 = "dff9a01089827e16317c7a09c2dff5678888c9f977ba77225dc3dc31c4f5c06a";
// var badtxid = "123";

// var txids = [txid0, txid1];

// test("Transactions.Get txids", function(t) {
//   commonBlockchain.Transactions.Get(txids, function(err, txs) {
//     console.log(err, txs);
//   });
// });

var txid = "fe23506aa169d839e786b3a14f1d3ba604a8c707e867685542b24b40ae0b46a5";

console.log("getRawTransaction", txid);

rpc.getRawTransaction(txid, function(err, ret) {
  console.log(err, ret);
});

return;

var testnetCommonBlockchainTests = require('abstract-common-blockchain/tests/testnet');

var testnetCommonBlockchain = require("./")({
  rpc: rpc
});

var testnetCommon = {
  setup: function(t, cb) {
    cb(null, testnetCommonBlockchain);
  },
  teardown: function(t, testnetCommonBlockchain, cb) {
    cb();
  }
}

testnetCommonBlockchainTests(test, testnetCommon);