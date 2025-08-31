import axios from "axios";
import { BrowserProvider, Contract, formatEther } from "ethers";
import { useEffect, useState } from "react";
import nftAbi from "./abi/TokenModuleAngeloNFT.json";

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
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [address, setAddress] = useState<string>("");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingTransactions, setLoadingTransactions] =
    useState<boolean>(false);
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [data, setData] = useState<AddrInfo | null>(null);
  const [loadingMint, setLoadingMint] = useState<boolean>(false);
  const [mintedTokens, setMintedTokens] = useState<any[]>([]);
  const [openTransferModal, setOpenTransferModel] = useState<boolean>(false);
  const [selectedNft, setSelectedNft] = useState<string>("");
  const [recipient, setRecipient] = useState("");
  const [countTracsac, setCountTransac] = useState<number>(0);

  const hasProvider = typeof window !== "undefined" && window.ethereum;

  const openModal = (token: string) => {
    setSelectedNft(token);
    setOpenTransferModel(true);
  };
  const closeModal = () => {
    setOpenTransferModel(false);
  };
  const confirmTransfer = async () => {
    if (!selectedNft || !recipient) return;
    await transferNft(selectedNft, recipient);
    setRecipient("");
    closeModal();
  };

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
      console.log(`ito yung adress ${accounts[0]}`);
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
        console.log("data result:");
        console.log(res.data.message);
      }
    } catch (err: unknown) {
      setError(`failed to get transactions ${err}`);
    } finally {
      setLoadingTransactions(false);
    }
  };

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
          sort: "asc", // important: chronological order
          apikey: ETHERSCAN_API_KEY,
        },
      });

      if (res.data.status === "1") {
        const owned = new Map<string, any>();

        res.data.result.forEach((token: any) => {
          const tokenId = token.tokenID;
          if (token.to.toLowerCase() === addr.toLowerCase()) {
            owned.set(tokenId, token); // you received this token
          }
          if (token.from.toLowerCase() === addr.toLowerCase()) {
            owned.delete(tokenId); // you sent this token away
          }
        });

        const ownedTokens = Array.from(owned.values());
        setMintedTokens(ownedTokens);
        console.log("Owned ERC721 tokens:", ownedTokens);
      } else {
        setError(res.data.message);
      }
    } catch (err: unknown) {
      setError(`Failed to fetch transactions ${err}`);
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
      setCountTransac(countTracsac + 1);
      //fetchTransactions(address); // refresh transactions after mint
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to mint NFT");
    } finally {
      setLoadingMint(false);
    }
  };

  const transferNft = async (tokenid: string, to: string) => {
    try {
      if (!tokenid || !to) {
        alert("incomplete details");
      }
      const signer = await provider.getSigner();
      const from = await signer.getAddress();
      const contract = new Contract(contractAddress, nftAbi.abi, signer);

      // ethers v6 needs a BigNumberish; tokenId is a decimal string from Etherscan
      const transfer = await contract[
        "safeTransferFrom(address,address,uint256)"
      ](from, to, BigInt(tokenid));
      await transfer.wait();
      alert(`NFT ${tokenid} transferred successfully!`);
      setCountTransac(countTracsac + 1);
      // Query the contract for new owner
      const newOwner = await contract.ownerOf(BigInt(tokenid));
      console.log(newOwner);
      if (newOwner.toLowerCase() === to.toLowerCase()) {
        alert(`NFT ${tokenid} successfully transferred to ${to}`);
        fetchMintedErc721(address);
      } else {
        alert(`Transfer failed, current owner is still ${newOwner}`);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!address || !contractAddress) return;

    fetchMintedErc721(address);
    getAddrInfo(address);
    fetchTransactions(address);
  }, [countTracsac]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6 gap-9">
      <div className="w-full max-w-xl bg-zinc-900 rounded-2xl shadow-lg p-6  ">
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
              onClick={mintNFT}
              disabled={loadingMint}
              className="w-full bg-green-600 hover:bg-green-700 rounded-xl py-3 mb-4 font-semibold"
            >
              {loadingMint ? "Minting..." : "Mint NFT"}
            </button>
            <button
              onClick={disconnectWallet}
              className="w-full bg-red-600 hover:bg-red-700 rounded-xl py-3 mb-6 font-semibold"
            >
              Disconnect
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

      <div className="w-full max-w-xl bg-zinc-900 rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Owned Minted ERC721</h1>

        {loadingTransactions ? (
          <p>Loading transactions...</p>
        ) : mintedTokens && mintedTokens.length > 0 ? (
          <ul className="space-y-4 max-h-80 overflow-y-auto">
            {mintedTokens.map((tx, id) => (
              <li
                key={id}
                className="bg-zinc-800 p-4 rounded-2xl shadow-md border border-zinc-700"
              >
                <div className="flex flex-col space-y-2">
                  <p>
                    <span className="font-semibold">Token Name:</span>{" "}
                    {tx.tokenName}
                  </p>
                  <p>
                    <span className="font-semibold">Token Symbol:</span>{" "}
                    {tx.tokenSymbol}
                  </p>
                  <p>
                    <span className="font-semibold">Token ID:</span>{" "}
                    {tx.tokenID}
                  </p>
                  <p>
                    <span className="font-semibold">Contract Address:</span>{" "}
                    {tx.contractAddress}
                  </p>
                  <p>
                    <span className="font-semibold">To:</span> {tx.to}
                  </p>
                  <p>
                    <span className="font-semibold">Value:</span>{" "}
                    {tx.value ? formatEther(tx.value) : "0"} ETH
                  </p>
                  <button
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    onClick={() => openModal(tx.tokenID)}
                    disabled={loading}
                  >
                    Transfer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">No minted tokens found</p>
        )}
      </div>
      {openTransferModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className=" p-6 w-full max-w-md bg-zinc-900 rounded-2xl shadow-lg text-white">
            <h2 className="text-lg font-semibold mb-4">Transfer NFT</h2>
            <p className="text-sm mb-2">
              <span className="font-semibold">Token ID:</span> {selectedNft}
            </p>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Recipient wallet address (0x...)"
              className="w-full p-2 border rounded mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                className="bg-zinc-900 px-3 py-1 rounded"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded font-semibold disabled:opacity-50"
                onClick={confirmTransfer}
                disabled={!recipient || loading}
              >
                {loading ? "Transferring..." : "Confirm Transfer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
