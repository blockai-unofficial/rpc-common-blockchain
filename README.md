# RPC Common Blockchain

A [Common Blockchain](https://github.com/blockai/abstract-common-blockchain) interface for the Bitcoin Core RPC.

```js
var RpcClient = require('bitcoind-rpc')

var config = {
  protocol: 'http',
  user: 'rpcuser',
  pass: 'rpcpassword',
  host: '127.0.0.1',
  port: '18332'
}

var rpc = new RpcClient(config)

var rpcCommonBlockchain = require('rpc-common-blockchain')({
  rpc: rpc
})
```
