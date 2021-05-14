/*
Public Key: 040aaa605786844fd2de06c85c5006d8eb1a0ad65c5c3cd678edef0a168cf19d754b0c75401ad99551d086045d0e541ab56b5fa6273b7e5a5edf365fab0d933a09

Private Key: e2cc01206047c27c24271b7655e76e96ad86c789dbeba73e2042d175b97e7779
*/
const EC = require('elliptic').ec;
const ec = new EC('secp256k1')
const { Blockchain, Transaction } = require('./blockchain')

const myKey = ec.keyFromPrivate('e2cc01206047c27c24271b7655e76e96ad86c789dbeba73e2042d175b97e7779');

const myWalletAddress = myKey.getPublic('hex');

let rucoin = new Blockchain()
rucoin.minePendingTransactions(myWalletAddress);

trans1 = new Transaction(myWalletAddress, "Ruthwik", 10)
trans1.signTransaction(myKey)
rucoin.addTransaction(trans1)

rucoin.minePendingTransactions(myWalletAddress);

console.log(rucoin.getBalanceOfAddress(myWalletAddress))

