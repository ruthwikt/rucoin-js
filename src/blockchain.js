const crypto = require('crypto')
const EC = require('elliptic').ec;
const ec = new EC('secp256k1')

class Block {
    constructor(timestamp, transactions, prevHash = '') {
        this.timestamp = timestamp
        this.transactions = transactions
        this.prevHash = prevHash
        this.hash = this.calculateHash()
        this.nonce = 0
    }

    calculateHash() {
        return crypto.createHash('sha256').update(this.prevHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).digest('hex')
    }

    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++
            this.hash = this.calculateHash()
        }

        console.log("Block Mined: " + this.hash)
    }

    hasValidTransactions() {
        for (const tx of this.transactions) {
            if (!tx.isValid()) {
                return false;
            }
        }

        return true;
    }
}

class Transaction {
    constructor(from, to, amount) {
        this.from = from
        this.to = to
        this.amount = amount
    }

    calculateHash() {
        return crypto.createHash('sha256').update(this.from + this.to + this.amount).digest('hex')
    }

    signTransaction(signingKey) {
        if (signingKey.getPublic('hex') !== this.from) {
            throw new Error("You cannot sign transactions for other wallets!")
        }

        const hashTx = this.calculateHash()
        const sig = signingKey.sign(hashTx, 'base64')
        this.signature = sig.toDER('hex')
    }

    isValid() {
        if (this.from === null) return true;

        if (!this.signature || this.signature.length === 0) {
            throw new Error('No signature in this transaction')
        }

        const publicKey = ec.keyFromPublic(this.from, 'hex')
        return publicKey.verify(this.calculateHash(), this.signature)
    }

}

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()]
        this.difficulty = 4
        this.pendingTransactions = []
        this.miningReward = 100
    }

    createGenesisBlock() {
        return new Block(Date.parse('2017-01-01'), [], '0');
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1]
    }

    minePendingTransactions(address) {
        const rewardTx = new Transaction(null, address, this.miningReward);
        this.pendingTransactions.push(rewardTx);
    
        const block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);
    
        console.log('Block successfully mined!');
        this.chain.push(block);
    
        this.pendingTransactions = [];
    }

    addTransaction(transaction) {
        if (!transaction.from || !transaction.to) {
            throw new Error('Transaction must include from and to address');
        }

        if (!transaction.isValid()) {
            throw new Error('Cannot add invalid transaction to chain');
        }

        if (transaction.amount <= 0) {
            throw new Error('Transaction amount should be higher than 0');
        }

        if (this.getBalanceOfAddress(transaction.from) < transaction.amount) {
            throw new Error('Not enough balance');
        }

        this.pendingTransactions.push(transaction);
        console.log('transaction added:', transaction)
    }

    getBalanceOfAddress(address) {
        let balance = 0;

        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.from === address) {
                    balance -= trans.amount;
                }

                if (trans.to === address) {
                    balance += trans.amount
                }
            }
        }

        return balance
    }

    isChainValid() {
        const realGenesis = JSON.stringify(this.createGenesisBlock());

        if (realGenesis !== JSON.stringify(this.chain[0])) {
            return false;
        }

        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const prevBlock = this.chain[i - 1];

            if (!currentBlock.hasValidTransactions()) {
                return false;
            }


            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.prevHash !== prevBlock.hash) {
                return false;
            }
        }

        return true;
    }
}

module.exports.Blockchain = Blockchain
module.exports.Transaction = Transaction