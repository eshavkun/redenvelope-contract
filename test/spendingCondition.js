import EVMRevert from './helpers/EVMRevert';
import chai from 'chai';
import ethUtil from 'ethereumjs-util';
const SpendingCondition = artifacts.require('./SpendingCondition.sol');
const SimpleToken = artifacts.require('./mocks/SimpleToken');

const should = chai
  .use(require('chai-as-promised'))
  .should();


contract('SpendingCondition', (accounts) => {
  const alice = accounts[0];
  const alicePriv = '0x278a5de700e29faae8e40e366ec5012b5ec63d36ec77e8a2417154cc1d25383f';
  let token;
  let condition;

  before(async () => {
    token = await SimpleToken.new();
    condition = await SpendingCondition.new();
    // initialize contract
    token.transfer(condition.address, 1000);
  });

  it('should allow to fulfil condition', async () => {
    const codeBuf = Buffer.from(condition.constructor._json.deployedBytecode.replace('0x', ''), 'hex')
    const codeHash = ethUtil.ripemd160(codeBuf);
    const hash = Buffer.alloc(32);
    codeHash.copy(hash);
    const sig = ethUtil.ecsign(
      hash,
      Buffer.from(alicePriv.replace('0x', ''), 'hex'),
    );
    const tx = await condition.fulfil(`0x${sig.r.toString('hex')}`, `0x${sig.s.toString('hex')}`, sig.v, token.address).should.be.fulfilled;
    // check transaction for events
    assert.equal(tx.receipt.rawLogs[0].address, token.address);
    // assert.equal(tx.receipt.logs[0].topics[1], condition.address);
    // assert.equal(tx.receipt.logs[0].topics[2], accounts[1]);
    const remain = await token.balanceOf(condition.address);
    assert.equal(remain.toNumber(), 750);
  });

});
