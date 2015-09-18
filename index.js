module.exports = function(options) {

  var rpc = options.rpc;

  var txHexToJSON = require('bitcoin-tx-hex-to-json');  

  var Get = function(txids, callback) {

    function batchCall() {
      txids.forEach(function (txid) {
        rpc.getRawTransaction(txid);
      });
    }

    rpc.batch(batchCall, function(err, rawtxs) {
      var txs = rawtxs.map(function (rawtx) {
        return rawtx.result ? txHexToJSON(rawtx.result) : false;
      });
      callback(err, txs);
    });

  }

  var Transactions = {
    Get: Get
  }

  return {
    Transactions: Transactions
  }

}