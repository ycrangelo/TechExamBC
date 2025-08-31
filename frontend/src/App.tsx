import axios from "axios";
import { BrowserProvider, Contract, formatEther } from "ethers";
import { useEffect, useState } from "react";
import nftAbi from "./abi/TokenModuleAngeloNFT.json";

// .ENV VALUES
const ETHERSCAN_API_KEY = import.meta.env.VITE_ETHERSCAN_API_KEY;
const ETHERSCAN_API = import.meta.env.VITE_ETHERSCAN_API;
const BACKEND_API = import.meta.env.VITE_BACKEND_API;
const contractAddress: string = "0x3263925Cb57481aF41e397e875E51b58897F953E";

export interface Block {
  id: number;
  block_number: string;
}
export interface GasPrice {
  id: number;
  gas_price_in_hex: string;
  gas_price_in_gwei: number;
}
export interface AddressBalance {
  balance_in_wei: string;
  balance_in_eth: number;
}
export interface AddrInfo {
  message: string;
  address: string;
  block: Block;
  gas_price: GasPrice;
  address_balance: AddressBalance;
}

function App() {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [address, setAddress] = useState<string>("");
  const [transactionMessage, setTransactionMessage] = useState<string>("");
  const [balance, setBalance] = useState<string>("");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingTransactions, setLoadingTransactions] =
    useState<boolean>(false);
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [data, setData] = useState<AddrInfo | null>(null);
  const [loadingMint, setLoadingMint] = useState<boolean>(false);

  const hasProvider = typeof window !== "undefined" && window.ethereum;

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

      const bal = await browserProvider.getBalance(addr);
      setBalance(formatEther(bal));

      fetchTransactions(addr);
      getAddrInfo(addr);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setAddress("");
    setBalance("");
    setTransactions([]);
    setError("");
    setData(null);
  };

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
        setTransactionMessage(res.data.message);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError("Failed to fetch transactions");
    } finally {
      setLoadingTransactions(false);
    }
  };

  const getAddrInfo = async (addr: string) => {
    setLoadingData(true);
    try {
      const response = await axios.get(`${BACKEND_API}/${addr}`);
      setData(response.data);
    } catch (err) {
      console.log("Error fetching address info:", err);
      setError("Failed to fetch address info");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    console.log("Updated data:", data);
  }, [data]);

  // Function to mint ERC721 NFT
  const mintNFT = async () => {
    if (!provider || !address) return;
    setLoadingMint(true);
    setError("");
    try {
      const signer = await provider.getSigner();
      const contract = new Contract(contractAddress, nftAbi.abi, signer);

      // Read nextTokenId BEFORE mint
      const tokenIdBefore = await contract.nextTokenId();

      // Assuming your contract has a simple "mint" function without parameters
      const mintContract = await contract.mint();
      await mintContract.wait();

      console.log(mintContract);
      console.log(`this is the token id :${tokenIdBefore}`);
      alert("NFT minted successfully!");
      //fetchTransactions(address); // refresh transactions after mint
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to mint NFT");
    } finally {
      setLoadingMint(false);
    }
  };
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-zinc-900 rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Ethereum Wallet Dashboard</h1>

        {!address ? (
          <button
            onClick={connectWallet}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl py-3 font-semibold"
          >
            {loading ? "Connecting..." : "Connect Wallet"}
          </button>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-sm text-gray-400">Address:</p>
              <p className="font-mono break-all">{address}</p>
            </div>

            <div className="mb-4 p-4 bg-zinc-800 rounded-xl">
              {loadingData ? (
                <p>Loading address info...</p>
              ) : data ? (
                <>
                  <p className="text-sm text-gray-400">
                    Current ETH Block Number:
                  </p>
                  <p>{data.block.block_number}</p>

                  <p className="text-sm text-gray-400">Gas Price (Gwei):</p>
                  <p>{data.gas_price.gas_price_in_gwei}</p>

                  <p className="text-sm text-gray-400">Wallet Balance (ETH):</p>
                  <p>{data.address_balance.balance_in_eth}</p>
                </>
              ) : (
                <p>No address info</p>
              )}
            </div>

            <button
              onClick={disconnectWallet}
              className="w-full bg-red-600 hover:bg-red-700 rounded-xl py-3 mb-6 font-semibold"
            >
              Disconnect
            </button>
            <button
              onClick={mintNFT}
              disabled={loadingMint}
              className="w-full bg-green-600 hover:bg-green-700 rounded-xl py-3 mb-4 font-semibold"
            >
              {loadingMint ? "Minting..." : "Mint NFT"}
            </button>

            <h2 className="text-xl font-bold mb-2">Last 10 Transactions</h2>
            {loadingTransactions ? (
              <p>Loading transactions...</p>
            ) : transactions.length > 0 ? (
              <ul className="space-y-2 max-h-64 overflow-y-auto text-sm">
                {transactions.map((tx, id) => (
                  <li key={id} className="bg-zinc-800 p-3 rounded-lg break-all">
                    <p>
                      <span className="font-semibold">Hash:</span> {tx.hash}
                    </p>
                    <p>
                      <span className="font-semibold">From:</span> {tx.from}
                    </p>
                    <p>
                      <span className="font-semibold">To:</span> {tx.to}
                    </p>
                    <p>
                      <span className="font-semibold">Value:</span>{" "}
                      {formatEther(tx.value)} ETH
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">No transactions found</p>
            )}
          </>
        )}

        {error && (
          <div className="mt-4 bg-red-500/20 text-red-400 p-3 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
