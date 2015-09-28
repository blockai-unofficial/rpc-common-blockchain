module.exports = function(options) {

  var rpc = options.rpc;

  var txHexToJSON = require('bitcoin-tx-hex-to-json');
  var bitcoin = require('bitcoinjs-lib'); 
  var txToJson = require('./tx-to-json');

  var GetTranasactions = function(txids, callback) {

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

  var Latest = function(callback) {
    callback(false, []);
  };

  var Outputs = function(txidvouts, callback) {

    function batchCall() {
      txidvouts.forEach(function (txidvout) {
        rpc.getRawTransaction(txidvout.txid);
      });
    }

    rpc.batch(batchCall, function(err, rawtxs) {
      var outputs = rawtxs.map(function (rawTx, i) {
        if (!rawTx.result) {
          return false;
        }
        var tx = txHexToJSON(rawTx.result);
        var rawOutput = tx.vout[txidvouts[i].vout];
        var output = {
          txid: tx.txid,
          txId: tx.txid,
          value: rawOutput.value,
          vout: rawOutput.n,
          scriptPubKey: rawOutput.scriptPubKey.hex
        }
        return output;
      });
      callback(err, outputs);
    });
  }

  var Propagate = function(txHex, callback) {
    rpc.sendRawTransaction(txHex, function(err, res) {
      callback(err, res);
    });
  }

  var Status = function() {

  };

  var Transactions = {
    Get: GetTranasactions,
    Latest: Latest,
    Outputs: Outputs,
    Propagate: Propagate,
    Status: Status
  }

  // https://bitcoin.org/en/developer-reference#importaddress
  var Addresses = {

  }

  var GetBlocks = function(blockIds, callback) {
    var blockId = blockIds[0];
    rpc.getBlock(blockId, function(err, jsonRes) {
      var block = jsonRes.result;
      rpc.getBlock(blockId, false, function(err, rawRes) {
        var blockHex = rawRes.result;
        block.blockHex = blockHex;
        block.blockId = blockId;

        var rawBlock = bitcoin.Block.fromHex(blockHex);
        var transactions = [];
        rawBlock.transactions.forEach(function(tx) {
          var txJSON = txToJson(tx);
          transactions.push(txJSON);
        });
        block.transactions = transactions;
        callback(err, block);
      });
    });
  }

  var GetBlockHash = function(blockHeight, callback) {
    rpc.getBlockHash(blockHeight, function(err, res) {
      var blockId = res.result;
      callback(err, blockId);
    });
  }

  var Blocks = {
    Get: GetBlocks,
    GetBlockHash: GetBlockHash
  }

  return {
    Transactions: Transactions,
    Blocks: Blocks
  }

}