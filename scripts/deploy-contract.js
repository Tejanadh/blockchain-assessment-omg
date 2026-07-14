const { ethers } = require('hardhat');

/**
 * Deploy AssessmentToken to the active Hardhat network.
 *
 * Usage:
 *   npx hardhat run scripts/deploy-contract.js
 *   npx hardhat run scripts/deploy-contract.js --network sepolia
 */
async function main() {
  const [deployer] = await ethers.getSigners();
  const initialSupply = 1_000_000;

  const AssessmentToken = await ethers.getContractFactory('AssessmentToken');
  const token = await AssessmentToken.deploy(initialSupply);
  await token.waitForDeployment();

  const address = await token.getAddress();
  console.log('Deployer:', deployer.address);
  console.log('AssessmentToken deployed to:', address);
  console.log('Initial supply:', initialSupply, 'AST');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
