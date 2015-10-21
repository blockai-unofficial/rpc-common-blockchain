module.exports = function (options) {
  var rpc = options.rpc

  var txHexToJSON = require('bitcoin-tx-hex-to-json')
  var bitcoin = require('bitcoinjs-lib')

  var GetTranasactions = function (txids, callback) {
    function batchCall () {
      txids.forEach(function (txid) {
        rpc.getRawTransaction(txid, 1)
      })
    }

    rpc.batch(batchCall, function (err, rawtxs) {
      var txs = rawtxs.map(function (rawtx) {
        var tx = rawtx.result ? txHexToJSON(rawtx.result.hex) : {}
        tx.blockhash = rawtx.result.blockhash
        tx.blocktime = rawtx.result.blocktime
        tx.confirmations = rawtx.result.confirmations
        return tx
      })
      callback(err, txs)
    })
  }

  var Latest = function (callback) {
    callback(false, [])
  }

  var Outputs = function (txidvouts, callback) {
    function batchCall () {
      txidvouts.forEach(function (txidvout) {
        rpc.getRawTransaction(txidvout.txid)
      })
    }

    rpc.batch(batchCall, function (err, rawtxs) {
      var outputs = rawtxs.map(function (rawTx, i) {
        if (!rawTx.result) {
          return false
        }
        var tx = txHexToJSON(rawTx.result)
        var rawOutput = tx.vout[txidvouts[i].vout]
        var output = {
          txid: tx.txid,
          txId: tx.txid,
          value: rawOutput.value,
          vout: rawOutput.n,
          scriptPubKey: rawOutput.scriptPubKey.hex
        }
        return output
      })
      callback(err, outputs)
    })
  }

  var PropagateTransaction = function (txHex, callback) {
    rpc.sendRawTransaction(txHex, function (err, res) {
      callback(err, res)
    })
  }

  var Status = function (txids, callback) {
    function batchCall () {
      txids.forEach(function (txid) {
        rpc.getRawTransaction(txid, 1)
      })
    }

    rpc.batch(batchCall, function (err, rawtxs) {
      var txs = rawtxs.map(function (rawtx) {
        return {
          txid: rawtx.result.txid,
          txId: rawtx.result.txid,
          blockId: rawtx.result.blockhash
        }
      })
      callback(err, txs)
    })
  }

  var Transactions = {
    Get: GetTranasactions,
    Latest: Latest,
    Outputs: Outputs,
    Propagate: PropagateTransaction,
    Status: Status
  }

  var Unspents = function (addresses, callback) {
    var outputAddressesObject = {}
    addresses.forEach(function (addr) {
      outputAddressesObject[addr] = []
    })
    rpc.listUnspent(0, 9999999, addresses, function (err, res) {
      var rawOutputs = res.result
      rawOutputs.forEach(function (output) {
        outputAddressesObject[output.address].push({
          address: output.address,
          txid: output.txid,
          txId: output.txid,
          scriptPubKey: output.scriptPubKey,
          vout: output.vout,
          amount: output.amount * 100000000,
          value: output.amount * 100000000,
          confirmations: output.confirmations
        })
      })
      var outputAddresses = []
      for (var address in outputAddressesObject) {
        outputAddresses.push(outputAddressesObject[address])
      }
      callback(err, outputAddresses)
    })
  }

  var Summary = function (addresses, callback) {
    function batchCall () {
      addresses.forEach(function (address) {
        rpc.getReceivedByAddress(address, 0)
      })
    }

    rpc.batch(batchCall, function (err, rawAddresses) {
      var _addresses = rawAddresses.map(function (rawAddress, i) {
        var address = {
          balance: rawAddress.result,
          address: addresses[i]
        }
        return address
      })
      callback(err, _addresses)
    })
  }

  var AddressTransactions = function (addresses, callback) {
    var address = addresses[0]
    // rpc.importAddress(address, address, true, function (err, res) {
    // console.log(err, res)
    rpc.listTransactions(address, 10, 0, true, function (err, res) {
      console.log(err, res)
      callback(false, [[{}]])
    })
  // })
  }

  var Addresses = {
    Unspents: Unspents,
    Summary: Summary,
    Transactions: AddressTransactions
  }

  var GetBlocks = function (blockIds, callback) {
    var blockId = blockIds[0]
    rpc.getBlock(blockId, function (err, jsonRes) {
      if (err) {} // TODO
      var block = jsonRes.result
      rpc.getBlock(blockId, false, function (err, rawRes) {
        var blockHex = rawRes.result
        block.blockHex = blockHex
        block.blockId = blockId

        var rawBlock = bitcoin.Block.fromHex(blockHex)
        var transactions = []
        rawBlock.transactions.forEach(function (tx) {
          var txJSON = txHexToJSON(tx.toHex())
          txJSON.blockId = blockId
          transactions.push(txJSON)
        })
        block.transactions = transactions
        callback(err, [block])
      })
    })
  }

  var GetBlockHash = function (blockHeight, callback) {
    rpc.getBlockHash(blockHeight, function (err, res) {
      var blockId = res.result
      callback(err, blockId)
    })
  }

  var LatestBlock = function (callback) {
    rpc.getBestBlockHash(function (err, res) {
      var blockId = res.result
      GetBlocks([blockId], function (err, blocks) {
        callback(err, blocks[0])
      })
    })
  }

  var PropagateBlock = function (blockHex, callback) {
    rpc.submitBlock(blockHex, function (err, res) {
      callback(err, res)
    })
  }

  var BlockTransactions = function (blockIds, callback) {
    GetBlocks(blockIds, function (err, blocks) {
      var transactions = blocks.map(function (block) {
        return block.transactions
      })
      callback(err, transactions)
    })
  }

  var Blocks = {
    Get: GetBlocks,
    GetBlockHash: GetBlockHash,
    Latest: LatestBlock,
    Propagate: PropagateBlock,
    Transactions: BlockTransactions
  }

  return {
    Transactions: Transactions,
    Blocks: Blocks,
    Addresses: Addresses
  }
}
