import { formatEther } from "ethers";

interface Props {
  transactions: any[];
  loadingTransactions: boolean;
}

function Transactions({ transactions, loadingTransactions }: Props) {
  return (
    <div>
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
    </div>
  );
}
export default Transactions;
