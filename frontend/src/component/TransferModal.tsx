interface Props {
  open: boolean;
  tokenId: string;
  recipient: string;
  setRecipient: (val: string) => void;
  confirmTransfer: () => void;
  closeModal: () => void;
  loading: boolean;
}

function TransferModal({
  open,
  tokenId,
  recipient,
  setRecipient,
  confirmTransfer,
  closeModal,
  loading,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="p-6 w-full max-w-md bg-zinc-900 rounded-2xl shadow-lg text-white">
        <h2 className="text-lg font-semibold mb-4">Transfer NFT</h2>
        <p className="text-sm mb-2">
          <span className="font-semibold">Token ID:</span> {tokenId}
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
  );
}

export default TransferModal;
