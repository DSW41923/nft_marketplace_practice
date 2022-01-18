import { useState, useContext } from 'react'
import { ethers } from 'ethers'
import { useRouter } from 'next/router'
import { UserContext } from './context.js'

import {
  nftaddress, nftmarketaddress
} from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../artifacts/contracts/Market.sol/NFTMarket.json'

export default function CreateItem() {
  const [formInput, updateFormInput] = useState({ price: '' })
  const [currentUserId] = useContext(UserContext)
  const router = useRouter()

  async function createSale(url) {
    if (!formInput.price) return
    const provider = new ethers.providers.JsonRpcProvider()
    const signer = await provider.getSigner(parseInt(currentUserId))

    /* next, create the item */
    let contract = new ethers.Contract(nftaddress, NFT.abi, signer)
    let transaction = await contract.createToken()
    let tx = await transaction.wait()
    let created = tx.events[0]
    let value = created.args[2]
    let tokenId = value.toNumber()
    const price = ethers.utils.parseUnits(formInput.price, 'ether')

    /* then list the item for sale on the marketplace */
    contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    let listingPrice = await contract.getListingPrice()
    listingPrice = listingPrice.toString()

    transaction = await contract.createMarketItem(nftaddress, tokenId, price, { value: listingPrice })
    await transaction.wait()
    router.push('/')
  }

  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <h2 className="text-2xl py-2">Creating and Selling NFT Token</h2>
        <input
          placeholder="NFT Price in Eth"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
        />
        <button onClick={createSale} className="font-bold mt-4 bg-cyan-600 text-white rounded p-4 shadow-lg">
          Submit
        </button>
      </div>
    </div>
  )
}
