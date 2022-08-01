import { loadStdlib } from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';
import { ask } from '@reach-sh/stdlib';

if (process.argv.length < 3 || ['seller', 'buyer'].includes(process.argv[2])==false) {
 console.log(`Usage: reach run index [seller, buyer]`);
 process.exit(0);
}
const role = process.argv[2];

console.log(`Your Role is ${role}`);

const stdlib = loadStdlib(process.env);

console.log(`The consensus network is ${stdlib.connector}`);

const suStr = stdlib.standardUnit;
const auStr = stdlib.atomicUnit;

const toSu = (au) => stdlib.formatCurrency(au);
const toAu = (su) => stdlib.parseCurrency(su);

const iBalance = toAu(1000);

const showBalance = async (acc) => console.log(`your balance is ${toSu(await stdlib.balanceOf(acc))} ${suStr}`);

const commonInteract = (role) => {
 reportCancellation: () => {
  console.log(`${role == 'buyer' ? 'You': 'The buyer'} cancelled the order.`);
 };
 reportPayment: (payment) => {
  console.log(`${role == 'buyer' ? 'you' : 'The buyer'} paid ${toSu(payment)} ${suStr} to the contract.`);
 };
 reportTransfer: (payment) => {
  console.log(`The contract paid ${toSu(payment)} ${suStr} to ${role == 'seller' ? 'you' : 'the seller.'}`);
 };
};

if (role === 'seller') {
 const sellerInteract = {
  ...commonInteract,
  price: toAu(5),
   wisdom: await ask.ask(`Enter a wise phrase or press Enter for default:`, (s) => {
  let w = !s ? 'Build Healthy Communities.' : s;
 console.log(w);
 return w
 }),
  reportReady: async (price) => {
   console.log(`Your wisdom is for sale at ${toSu(price)} ${suStr}`);
   console.log(`Contract Info: ${JSON.stringify(await ctc.getInfo())}`);
  }

 };
 const acc = await stdlib.newTestAccount(iBalance);
 const ctc = acc.contract(backend);
 await ctc.participants.Seller(sellerInteract);
 await showBalance(acc);
} else {
 const buyerInteract = {
  ...commonInteract(role),
  confirmPurchase: async (price) => await ask.ask(`Do you want to purchase wisdom for ${toSu(price)} ${suStr}`, ask.yesno),
  reportWisdom: (wisdom) => {console.log(`Your wisdom is ${wisdom}`);},
 };
 const acc = await stdlib.newTestAccount(iBalance);
 const info = await ask.ask(`Paste contract info:`, (s) => JSON.parse(s));
 const ctc = acc.contract(backend, info);
 ctc.p.Buyer(buyerInteract);
 await showBalance(acc);
}
ask.done()
