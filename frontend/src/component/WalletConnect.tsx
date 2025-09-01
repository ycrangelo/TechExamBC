interface Props {
  address: string;
  loading: boolean;
  connectWallet: () => void;
  disconnectWallet: () => void;
}

function WalletConnect({
  address,
  loading,
  connectWallet,
  disconnectWallet,
}: Props) {
  return (
    <div>
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
          <button
            onClick={disconnectWallet}
            className="w-full bg-red-600 hover:bg-red-700 rounded-xl py-3 mb-6 font-semibold"
          >
            Disconnect
          </button>
        </>
      )}
    </div>
  );
}
export default WalletConnect;
