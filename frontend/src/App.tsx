import axios from "axios";
import { BrowserProvider, Contract } from "ethers";
import { useEffect, useState } from "react";
import nftAbi from "./abi/TokenModuleAngeloNFT.json";

import AddressInfo from "../src/component/AddressInfo";
import MintedTokens from "../src/component/MintedTokens";
import Transactions from "../src/component/Transactions";
import TransferModal from "../src/component/TransferModal";
import WalletConnect from "../src/component/WalletConnect";

// .ENV VALUES
const ETHERSCAN_API_KEY = import.meta.env.VITE_ETHERSCAN_API_KEY;
const ETHERSCAN_API = import.meta.env.VITE_ETHERSCAN_API;
const BACKEND_API = import.meta.env.VITE_BACKEND_API;
const contractAddress: string = "0x3263925Cb57481aF41e397e875E51b58897F953E";

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
  // --- STATE ---
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [address, setAddress] = useState<string>("");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [mintedTokens, setMintedTokens] = useState<any[]>([]);
  const [data, setData] = useState<AddrInfo | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingTransactions, setLoadingTransactions] =
    useState<boolean>(false);
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [loadingMint, setLoadingMint] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [openTransferModal, setOpenTransferModal] = useState<boolean>(false);
  const [selectedNft, setSelectedNft] = useState<string>("");
  const [recipient, setRecipient] = useState<string>("");
  const [countTransac, setCountTransac] = useState<number>(0);

  const hasProvider = typeof window !== "undefined" && window.ethereum;

  // --- WALLET FUNCTIONS ---
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

      fetchTransactions(addr);
      fetchMintedErc721(addr);
      getAddrInfo(addr);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setAddress("");
    setTransactions([]);
    setMintedTokens([]);
    setData(null);
    setError("");
  };

  // --- TRANSACTIONS ---
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
          offset: 10,
          sort: "desc",
          apikey: ETHERSCAN_API_KEY,
        },
      });

      if (res.data.status === "1") {
        setTransactions(res.data.result);
      }
    } catch (err: unknown) {
      setError(`Failed to get transactions ${err}`);
    } finally {
      setLoadingTransactions(false);
    }
  };

  // --- MINTED ERC721 ---
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

      if (res.data.status === "1") {
        const owned = new Map<string, any>();
        res.data.result.forEach((token: any) => {
          const tokenId = token.tokenID;
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

  // --- BACKEND DATA ---
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

  // --- NFT MINT ---
  const mintNFT = async () => {
    if (!provider || !address) return;
    setLoadingMint(true);
    setError("");
    try {
      const signer = await provider.getSigner();
      const contract = new Contract(contractAddress, nftAbi.abi, signer);

      const tokenIdBefore = await contract.nextTokenId();
      const mintTx = await contract.mint();
      await mintTx.wait();

      alert(`NFT minted successfully!${tokenIdBefore}`);
      setCountTransac(countTransac + 1);
    } catch (err: any) {
      setError(err.message || "Failed to mint NFT");
    } finally {
      setLoadingMint(false);
    }
  };

  // --- NFT TRANSFER ---
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
      const contract = new Contract(contractAddress, nftAbi.abi, signer);

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

  // --- REFRESH DATA AFTER ACTIONS ---
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
