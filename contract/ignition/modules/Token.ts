import { buildModule } from "@nomicfoundation/hardhat-ignition/modules"

export default buildModule("TokenModule",(m) => {
  
  const nft = m.contract("MyNFT")//name of the contract

  return { nft }
});


