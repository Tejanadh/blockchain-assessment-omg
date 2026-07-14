const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('AssessmentToken', () => {
  let token;
  let owner;
  let recipient;

  beforeEach(async () => {
    [owner, recipient] = await ethers.getSigners();
    const AssessmentToken = await ethers.getContractFactory('AssessmentToken');
    token = await AssessmentToken.deploy(1_000_000);
    await token.waitForDeployment();
  });

  it('mints the initial supply to the deployer', async () => {
    const supply = await token.totalSupply();
    const balance = await token.balanceOf(owner.address);
    expect(balance).to.equal(supply);
  });

  it('transfers tokens between accounts', async () => {
    const amount = ethers.parseUnits('100', 18);
    await token.transfer(recipient.address, amount);
    expect(await token.balanceOf(recipient.address)).to.equal(amount);
  });

  it('allows owner to mint additional supply', async () => {
    const amount = ethers.parseUnits('50', 18);
    await token.mint(recipient.address, amount);
    expect(await token.balanceOf(recipient.address)).to.equal(amount);
    expect(await token.totalSupply()).to.equal(ethers.parseUnits('1000050', 18));
  });

  it('prevents non-owners from minting', async () => {
    const amount = ethers.parseUnits('10', 18);
    await expect(token.connect(recipient).mint(recipient.address, amount)).to.be.revertedWith('not owner');
  });

  it('burns tokens from the caller balance', async () => {
    const amount = ethers.parseUnits('25', 18);
    await token.burn(amount);
    expect(await token.balanceOf(owner.address)).to.equal(ethers.parseUnits('999975', 18));
  });
});