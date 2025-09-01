import { formatEther } from "ethers";

interface Props {
  mintedTokens: any[];
  loading: boolean;
  openModal: (token: string) => void;
}

function MintedTokens({ mintedTokens, loading, openModal }: Props) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Owned Minted ERC721</h1>
      {loading ? (
        <p>Loading transactions...</p>
      ) : mintedTokens.length > 0 ? (
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
                  <span className="font-semibold">Token ID:</span> {tx.tokenID}
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
  );
}

export default MintedTokens;
