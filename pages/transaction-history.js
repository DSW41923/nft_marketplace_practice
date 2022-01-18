import { ethers } from 'ethers'
import { useEffect, useState } from 'react'

import {
  nftmarketaddress, nftaddress
} from '../config'

import Market from '../artifacts/contracts/Market.sol/NFTMarket.json'
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([])
  const [searchingTokenId, setSearchingTokenId] = useState()
  const [loadingState, setLoadingState] = useState('not-loaded')
  const [formInput, updateFormInput] = useState({ filterTokenId: '' })
  useEffect(() => {
    loadTransactions()
  }, [])
  async function loadTransactions() {
    const provider = new ethers.providers.JsonRpcProvider()
    const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, provider)
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
    const data = await marketContract.fetchMarketTransactions()

    const all_transactions = await Promise.all(data.map(async i => {
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let transaction = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        buyer: i.buyer,
      }
      return transaction
    }))
    /* create a filtered array of transactions of specific token if searching */
    if (searchingTokenId) {
      const searchResults = all_transactions.filter(i => i.tokenId == searchingTokenId)
      setTransactions(searchResults)
    } else {
      setTransactions(all_transactions)
    }
    setLoadingState('loaded') 
  }
  if (loadingState === 'loaded' && !transactions.length) return (<h1 className="py-10 px-20 text-3xl">No previous transactions!</h1>)
  return (
      <div className="p-4">
	<input
          placeholder="NFT Token ID to filter"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, filterTokenId: e.target.value })}
        />

	<table className="table-fixed text-center">
          <thead className="text-2xl font-bold">
            <tr>
              <th>NFT Token Id</th>
              <th width="440px">Seller</th>
              <th width="440px">Buyer</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody className="font-mono">
           {
             transactions.filter(t => !Boolean(formInput.filterTokenId) || (t.tokenId == formInput.filterTokenId)).map((t, i) => (
               <tr key={i}>
                 <td className="px-4">{t.tokenId}</td>
                 <td className="px-4">{t.seller}</td>
                 <td className="px-4">{t.buyer}</td>
                 <td className="px-4">{t.price} Eth</td>
               </tr>
            ))}
	  </tbody>
	</table>
      </div>
  )
}
