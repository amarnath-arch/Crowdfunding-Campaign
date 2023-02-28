const {upgrades} = require('hardhat');

async function main(){

  const [deployer] = await ethers.getSigners();

  const Token = await ethers.getContractFactory("MyToken");
  const token = await upgrades.deployProxy(Token);
  console.log(`proxy of the Token contract deployed to: ${token.address}`)


  const CrowdFund = await ethers.getContractFactory("CrowdFund");

  let duration = 30 * 86400 * 1000;
  duration = duration.toString();

  const crowdFund = await upgrades.deployProxy(CrowdFund, [token.address,duration]);

  console.log(`proxy of the crowdFund contract deployed to: ${crowdFund.address}`)

}

main().
  then(()=>{ process.exit(0)})
  .catch(error =>{
      console.error(error);
      process.exit(1);
  })