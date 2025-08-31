
import 'dotenv/config'
import axios from 'axios';
import pkg from "@prisma/client";
const { PrismaClient } = pkg;

export async function getInfo(req,res){

  const prisma = new PrismaClient()
  try{
    const addr = req.params.address;
    console.log(addr);
    //console.log( `this is the api key :${process.env.ETHER_SCAN_API_KEY}`)
    //Windowsconsole.log("nandito ako umiibig sayo")
    const resBlockNum = await axios.get(
      process.env.ETHER_SCAN_LINK,{
       params:{
         chainid:1,
         module:"proxy",
         action:"eth_blockNumber",
         apikey:process.env.ETHER_SCAN_API_KEY        
       } 
      }
    )
    //console.log(resBlockNum)

    const resGasPrice = await axios.get(
      process.env.ETHER_SCAN_LINK,{
        params:{
          chainid:1,
          module:"proxy",
          action:"eth_gasPrice",
          apikey:process.env.ETHER_SCAN_API_KEY
        }
      }
    )
   //console.log(resGasPrice)

    const resAddrBalance = await axios.get(
      process.env.ETHER_SCAN_LINK,{
        params:{
          chainid:1,
          module:"account",
          action:"balance",
          address:addr,
          tag:"latest",
          apikey:process.env.ETHER_SCAN_API_KEY
        }
      }
    )
    console.log(resAddrBalance)
    console.log("hello tite")

   const convertToWei = parseInt(resGasPrice.data.result,16);
   const convertToGwei = convertToWei / 1e9;
   const convertToEth = resAddrBalance.data.result / 1e18

   const findAddress = await prisma.addrWalet.findFirst({
     where:{
       address: addr
     }
   })
   let  logAddr;
   if(findAddress == null){
     logAddr = await prisma.addrWalet.create({
       data:{
         address:addr,
         balance:convertToEth
       }
     })
   }else{
     logAddr = await prisma.addrWalet.updateMany({
       where:{
         address: addr
       },
       data:{
         balance: convertToEth
       }
     })
   }

   
    res.status(200)
       .set('Content-Type','application/json')
       .json({
        message:"success",
        address:addr,
        block:{
          id: resBlockNum.data.id,
          block_number: resBlockNum.data.result
        },
        gas_price:{
          id:resGasPrice.data.id,
          gas_price_in_hex: resGasPrice.data.result,
          gas_price_in_gwei: convertToGwei,
        },
        address_balance: {
          balance_in_wei: resAddrBalance.data.result,
          balance_in_eth:convertToEth 
        }
    });
    
  }catch(e){
    console.log(e);
    res.status(500).json({error:`error at : ${e}`})
  };
};
