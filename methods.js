const Web3 = require('web3')
var BigNumber = require('big-number');
var Tx = require('ethereumjs-tx').Transaction
var fs = require("fs")
var array = fs.readFileSync('accounts.txt', 'utf8').split('\n');
var numberOfAddresses = 10;
const web3 = new Web3('https://ropsten.infura.io/v3/0e40aca470c6412a9383b4cf4c56bb38')
const account1 = '0x803Bf3b044f0c50C8958323E5849CFCA7820C448'
const privateKey1 = Buffer.from('1078040a457b2c73708ea223d1207c27a26a4aa67fab8eec1ad43d21b8cf2f0b', 'hex')
const contractAddress = '0x4a3213bf1574fdcd886c55b575b286b221f85468'
const contractABI = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"standard","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approval","type":"event"}]
const contract = new web3.eth.Contract(contractABI, contractAddress)
const getTransactionCount = async(account) => {
return await web3.eth.getTransactionCount(account)
}
const sendTransaction = async(raw) => {
return await web3.eth.sendSignedTransaction(raw)
}
const transferFunds = async(account1, account2, amount) => {
let txCount = await getTransactionCount(account1)
console.log("txCount returned: " + txCount)
const txObject = {
nonce: web3.utils.toHex(txCount),
gasLimit: web3.utils.toHex(100000), // uses about 36,000 gas so add some buffer
gasPrice: web3.utils.toHex(web3.utils.toWei('30', 'gwei')),
to: contractAddress,
data: contract.methods.transfer(account2, amount).encodeABI()
}
const tx = new Tx(txObject, {chain:'ropsten', hardfork: 'petersburg'})
tx.sign(privateKey1)
const serializedTx = tx.serialize()
const raw = '0x' + serializedTx.toString('hex')
console.log("raw hex transaction: " + raw)
console.log("about to send transaction")
let minedTransaction = await sendTransaction(raw)
console.log("transaction hash returned: " + minedTransaction.transactionHash)
return `txHash is: ${minedTransaction.transactionHash}`
}
// async methods
const getBalanceOf = async(account) => {
let balanceOf = await contract.methods.balanceOf(account).call()
return `balance of account ${account} is ${balanceOf}`
}
const go = async() => {
var remainingBalance = await contract.methods.balanceOf(account1).call()
var bal = new BigNumber(remainingBalance)
console.log("Balance : ",remainingBalance)
var token_division = bal.div(20).div(numberOfAddresses)
for (let i= 0; i < array.length; i++) {
await transferFunds(account1,array[i],token_division)
}
}
module.exports = { transferFunds, getBalanceOf }
go()

