interface Props {
  data: any;
  loadingData: boolean;
}

function AddressInfo({ data, loadingData }: Props) {
  return (
    <div className="mb-4 p-4 bg-zinc-800 rounded-xl">
      {loadingData ? (
        <p>Loading address info...</p>
      ) : data ? (
        <>
          <p className="text-sm text-gray-400">Current ETH Block Number:</p>
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
  );
}
export default AddressInfo;
