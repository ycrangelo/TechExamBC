import axios from "axios";
import { BrowserProvider, Contract } from "ethers";
import { useEffect, useState } from "react";
import nftAbi from "./abi/TokenModuleAngeloNFT.json";

//imported components
import AddressInfo from "../src/component/AddressInfo";
import MintedTokens from "../src/component/MintedTokens";
import Transactions from "../src/component/Transactions";
import TransferModal from "../src/component/TransferModal";
import WalletConnect from "../src/component/WalletConnect";

// env
const ETHERSCAN_API_KEY = import.meta.env.VITE_ETHERSCAN_API_KEY;
const ETHERSCAN_API = import.meta.env.VITE_ETHERSCAN_API;
const BACKEND_API = import.meta.env.VITE_BACKEND_API;
const contractAddress: string = "0x3263925Cb57481aF41e397e875E51b58897F953E";

//inteface para sa json data from backend
interface Block {
  id: number;
  block_number: string;
}

interface GasPrice {
  id: number;
  gas_price_in_hex: string;
  gas_price_in_gwei: number;
}

interface AddressBalance {
  balance_in_wei: string;
  balance_in_eth: number;
}

interface AddrInfo {
  message: string;
  address: string;
  block: Block;
  gas_price: GasPrice;
  address_balance: AddressBalance;
}

function App() {
  // States
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [address, setAddress] = useState<string>("");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] =
    useState<boolean>(false);
  const [mintedTokens, setMintedTokens] = useState<any[]>([]);
  const [loadingMint, setLoadingMint] = useState<boolean>(false);
  const [data, setData] = useState<AddrInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [openTransferModal, setOpenTransferModal] = useState<boolean>(false);
  const [selectedNft, setSelectedNft] = useState<string>("");
  const [recipient, setRecipient] = useState<string>("");
  const [countTransac, setCountTransac] = useState<number>(0);

  const hasProvider = typeof window !== "undefined" && window.ethereum;

  // function for connecting wallet (metamask to)
  const connectWallet = async () => {
    try {
      if (!hasProvider) {
        setError("No wallet found. Please install MetaMask.");
        return;
      }
      setError("");
      setLoading(true);

      const browserProvider = new BrowserProvider(window.ethereum);
      setProvider(browserProvider);

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const addr = accounts[0];
      setAddress(addr);
      //calling functions for fetching the datas
      fetchTransactions(addr);
      fetchMintedErc721(addr);
      getAddrInfo(addr);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  };

  //for disconnecting the wallet
  const disconnectWallet = () => {
    setAddress("");
    setTransactions([]);
    setMintedTokens([]);
    setData(null);
    setError("");
  };

  // for fetching the transactions
  const fetchTransactions = async (addr: string) => {
    setLoadingTransactions(true);
    try {
      const res = await axios.get(ETHERSCAN_API, {
        params: {
          module: "account",
          action: "txlist",
          address: addr,
          startblock: 0,
          endblock: 99999999,
          page: 1,
          offset: 10, // 10 transactions only
          sort: "desc",
          apikey: ETHERSCAN_API_KEY,
        },
      });
      //cheking if the req is succesful
      if (res.data.status === "1") {
        setTransactions(res.data.result);
      }
    } catch (err: unknown) {
      setError(`Failed to get transactions ${err}`);
    } finally {
      setLoadingTransactions(false);
    }
  };

  // mint nft
  const fetchMintedErc721 = async (addr: string) => {
    setLoadingTransactions(true);
    try {
      const res = await axios.get(ETHERSCAN_API, {
        params: {
          module: "account",
          action: "tokennfttx",
          address: addr,
          contractaddress: contractAddress,
          startblock: 0,
          endblock: 99999999,
          sort: "asc",
          apikey: ETHERSCAN_API_KEY,
        },
      });
      //cheking if the req is succesful
      if (res.data.status === "1") {
        const owned = new Map<string, any>();
        res.data.result.forEach((token: any) => {
          const tokenId = token.tokenID;
          //checking if the current wallet address owned the nft( bucause maybe its from transfer, mint something like that)
          if (token.to.toLowerCase() === addr.toLowerCase()) {
            owned.set(tokenId, token); // received
          }
          if (token.from.toLowerCase() === addr.toLowerCase()) {
            owned.delete(tokenId); // sent away
          }
        });
        setMintedTokens(Array.from(owned.values()));
      } else {
        setError(res.data.message);
      }
    } catch (err: unknown) {
      setError(`Failed to fetch minted NFTs ${err}`);
    } finally {
      setLoadingTransactions(false);
    }
  };

  // getting the backend data
  const getAddrInfo = async (addr: string) => {
    setLoadingData(true);
    try {
      const res = await axios.get(`${BACKEND_API}/${addr}`);
      setData(res.data);
    } catch (err) {
      setError("Failed to fetch address info");
    } finally {
      setLoadingData(false);
    }
  };

  // minting the nft
  const mintNFT = async () => {
    if (!provider || !address) return;
    setLoadingMint(true);
    setError("");
    try {
      const signer = await provider.getSigner();
      //creating of instance of contract
      const contract = new Contract(contractAddress, nftAbi.abi, signer);
      //getting the id of nft
      const tokenIdBefore = await contract.nextTokenId();

      const mintTx = await contract.mint();
      //minting the nft
      await mintTx.wait();

      alert(`NFT minted successfully!${tokenIdBefore}`);
      setCountTransac(countTransac + 1);
    } catch (err: any) {
      setError(err.message || "Failed to mint NFT");
    } finally {
      setLoadingMint(false);
    }
  };

  // transferring nft to other address
  const openModal = (token: string) => {
    setSelectedNft(token);
    setOpenTransferModal(true);
  };
  const closeModal = () => setOpenTransferModal(false);

  const confirmTransfer = async () => {
    if (!selectedNft || !recipient) return;
    try {
      const signer = await provider!.getSigner();
      const from = await signer.getAddress();
      //creating of instance of contract
      const contract = new Contract(contractAddress, nftAbi.abi, signer);
      //function for transfering nft to other adress
      const transferTx = await contract[
        "safeTransferFrom(address,address,uint256)"
      ](from, recipient, BigInt(selectedNft));
      await transferTx.wait();

      alert(`NFT ${selectedNft} transferred successfully!`);
      setCountTransac(countTransac + 1);
      fetchMintedErc721(address);
      setRecipient("");
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Transfer failed");
    }
  };

  // fetchin again the data if there is transaction on the website
  useEffect(() => {
    if (!address) return;
    fetchTransactions(address);
    fetchMintedErc721(address);
    getAddrInfo(address);
  }, [countTransac]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6 gap-9">
      <div className="w-full max-w-xl bg-zinc-900 rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Ethereum Wallet Dashboard</h1>
        <WalletConnect
          address={address}
          loading={loading}
          connectWallet={connectWallet}
          disconnectWallet={disconnectWallet}
        />
        {address && <AddressInfo data={data} loadingData={loadingData} />}
        {address && (
          <button
            onClick={mintNFT}
            disabled={loadingMint}
            className="w-full bg-green-600 hover:bg-green-700 rounded-xl py-3 mb-4 font-semibold"
          >
            {loadingMint ? "Minting..." : "Mint NFT"}
          </button>
        )}
        {address && (
          <Transactions
            transactions={transactions}
            loadingTransactions={loadingTransactions}
          />
        )}
      </div>

      {address && (
        <MintedTokens
          mintedTokens={mintedTokens}
          loading={loadingTransactions}
          openModal={openModal}
        />
      )}
      <TransferModal
        open={openTransferModal}
        tokenId={selectedNft}
        recipient={recipient}
        setRecipient={setRecipient}
        confirmTransfer={confirmTransfer}
        closeModal={closeModal}
        loading={loading}
      />

      {error && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500/20 text-red-400 p-3 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}

export default App;
