import axios from "axios";
import { BrowserProvider, formatEther } from "ethers";
import { useEffect, useState } from "react";

// .ENV VALUES
const ETHERSCAN_API_KEY = import.meta.env.VITE_ETHERSCAN_API_KEY;
const ETHERSCAN_API = import.meta.env.VITE_ETHERSCAN_API;
const BACKEND_API = import.meta.env.VITE_BACKEND_API;

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
  const [provider, setProvider] = useState(null);
  const [address, setAddress] = useState<string>("");
  const [transactionMessage, setTransactionMessage] = useState<string>("");
  const [balance, setBalance] = useState<string>("");
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<AddrInfo | null>();

  const hasProvider = typeof window !== "undefined" && window.ethereum;
  // console.log(BACKEND_API)
  // console.log(address)
  // console.log("malaki tite");
  // connect wallet
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
      // console.log(`this is the add: ${addr}`);
      const balance = await browserProvider.getBalance(addr);
      setBalance(formatEther(balance));

      fetchTransactions(addr);
      getAddrInfo(addr);
      //console.log(`this is hte link${BACKEND_API}/${address}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  };

  // just clear usestates
  const disconnectWallet = () => {
    setAddress("");
    setBalance("");
    setTransactions([]);
    setError("");
  };

  // Etherscan
  const fetchTransactions = async (addr: string) => {
    try {
      const res = await axios.get(ETHERSCAN_API, {
        params: {
          module: "account",
          action: "txlist",
          address: addr,
          startblock: 0,
          endblock: 20,
          page: 1,
          offset: 10, // gano ka dami
          sort: "desc", // pagka sunodusnod
          apikey: ETHERSCAN_API_KEY,
        },
      });
      console.log(`ito transact ${res.data.message}`);
      if (res.data.status === "1") {
        setTransactions(res.data.result);
        setTransactionMessage(res.data.message);
        // console.log(`ito transact ${transactions}`);
        //  console.log("dito sa yes");
      } else {
        setError(res.data.message);
        // console.log(`ito transact ${transactions}`);
        setTransactionMessage(res.data.message);
        // console.log("dito sa no");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError(transactionMessage);
    }
  };

  const getAddrInfo = async (adres: string) => {
    try {
      const response = await axios.get(`${BACKEND_API}/${adres}`);
      setData(response.data);
      console.log(`${BACKEND_API}/${adres}`);
      console.log("nasa loob ako ng get address");
    } catch (e) {
      console.log("has an error");
      console.log(e);
    }
  };

  useEffect(() => {
    console.log("Updated data:", data);
  }, [data]);

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
            {/* Wallet Info */}
            <div className="mb-4">
              <p className="text-sm text-gray-400">Address:</p>
              <p className="font-mono break-all">{address}</p>
            </div>
          
            {data && (
              <div className="mb-4 p-4 bg-zinc-800 rounded-xl">
                <p className="text-sm text-gray-400">Current ETH Block Number:</p>
                <p>{data.block.block_number}</p>

                <p className="text-sm text-gray-400">Gas Price (Gwei):</p>
                <p>{data.gas_price.gas_price_in_gwei}</p>

                <p className="text-sm text-gray-400">Wallet Balance (ETH):</p>
                <p>{data.address_balance.balance_in_eth}</p>
              </div>
            )}

            <button
              onClick={disconnectWallet}
              className="w-full bg-red-600 hover:bg-red-700 rounded-xl py-3 mb-6 font-semibold"
            >
              Disconnect
            </button>

            {/* Transactions */}
            <h2 className="text-xl font-bold mb-2">Last 10 Transactions</h2>
            {transactions.length > 0 ? (
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
