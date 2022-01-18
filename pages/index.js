import { ethers } from 'ethers'
import { useEffect, useState, useContext } from 'react'
import { UserContext } from './context.js'

import {
  nftaddress, nftmarketaddress, test_accounts
} from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../artifacts/contracts/Market.sol/NFTMarket.json'

export default function Home() {
  const [currentUserId] = useContext(UserContext)
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  useEffect(() => {
    loadNFTs()
  }, [currentUserId])
  async function loadNFTs() {
    /* create a generic provider and query for unsold market items */
    const provider = new ethers.providers.JsonRpcProvider()
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
    const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, provider)
    const data = await marketContract.fetchMarketItems()

    /*
    *  map over items returned from smart contract and format them
    */
    const items = await Promise.all(data.map(async i => {
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
      }
      return item
    }))
    setNfts(items)
    setLoadingState('loaded') 
  }
  async function buyNft(nft) {
    const provider = new ethers.providers.JsonRpcProvider()
    const signer = await provider.getSigner(parseInt(currentUserId))
    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')   
    const transaction = await contract.createMarketSale(nftaddress, nft.tokenId, {
      value: price
    })
    await transaction.wait()
    loadNFTs()
  }
  async function unsellNft(nft) {
    const provider = new ethers.providers.JsonRpcProvider()
    const signer = await provider.getSigner(parseInt(currentUserId))
    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    await contract.deleteMarketSale(nftaddress, nft.tokenId)
    loadNFTs()
  }
  if (loadingState === 'loaded' && !nfts.length) return (<h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>)
  return (
    <div className="flex justify-center">
      <div className="px-4" style={{ maxWidth: '1600px' }}>
        <div className="grid grid-cols-2 gap-4 pt-4">
          {
            nfts.map((nft, i) => (
              <div key={i} className="border shadow rounded-xl">
                <div className="p-4">
                  <p style={{ height: '64px' }} className="text-2xl font-semibold">NFT Token {nft.tokenId}</p>
                  <p className="text-2xl mb-4 font-bold">Seller: {nft.seller}</p>
                </div>
                <div className="p-4 bg-black">
                  <p className="text-2xl mb-4 font-bold text-white">{nft.price} ETH</p>
		  {nft.seller.toUpperCase() != test_accounts[parseInt(currentUserId)].toUpperCase() ? (
                     <button className="w-full bg-cyan-600 text-white font-bold py-2 px-12 rounded" onClick={() => buyNft(nft)}>Buy</button>
		   ) : (
                     <button className="w-full bg-cyan-600 text-white font-bold py-2 px-12 rounded" onClick={() => unsellNft(nft)}>Cancel Selling</button>
		  )}
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
