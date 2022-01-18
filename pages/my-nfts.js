import { ethers } from 'ethers'
import { useEffect, useState, useContext } from 'react'
import { UserContext } from './context.js'

import {
  nftmarketaddress, nftaddress, test_accounts
} from '../config'

import Market from '../artifacts/contracts/Market.sol/NFTMarket.json'
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'

export default function MyAssets() {
  const [currentUserId] = useContext(UserContext)
  const [nfts, setNfts] = useState([])
  const [selling, setSelling] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  useEffect(() => {
    loadNFTs()
  }, [currentUserId])
  async function loadNFTs() {
    const provider = new ethers.providers.JsonRpcProvider()
    const signer = await provider.getSigner(parseInt(currentUserId))
    const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
    const data = await marketContract.fetchMyNFTs()

    const items = await Promise.all(data.map(async i => {
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        itemId: i.itemId.toNumber(),
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
      }
      return item
    }))
    const sellingNFTs = items.filter(i => i.seller.toUpperCase() == test_accounts[currentUserId].toUpperCase())
    setSelling(sellingNFTs)
    const owningNFTs = items.filter(i => i.owner.toUpperCase() == test_accounts[currentUserId].toUpperCase())
    setNfts(owningNFTs)
    setLoadingState('loaded') 
  }
  async function sellNft(nft) {
    const provider = new ethers.providers.JsonRpcProvider()
    const signer = await provider.getSigner(parseInt(currentUserId))
    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')  
    const transaction = await contract.resellMarketItem(nftaddress, nft.itemId, {
      value: price
    })
    loadNFTs()
  }
  async function unsellNft(nft) {
    const provider = new ethers.providers.JsonRpcProvider()
    const signer = await provider.getSigner(parseInt(currentUserId))
    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    await contract.deleteMarketSale(nftaddress, nft.itemId)
    loadNFTs()
  }

  if (loadingState === 'loaded' && !nfts.length && !selling.length) return (<h1 className="py-10 px-20 text-3xl">No NFTs selling or owning</h1>)
  return (
    <div>
      {Boolean(selling.length) && (
        <div className="px-4">
          <h2 className="text-2xl py-2">Selling</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            selling.map((s, i) => (
              <div key={i} className="border shadow rounded-xl overflow-hidden">
                <div className="p-4 bg-black">
                  <p style={{ height: '64px' }}
                    className="text-2xl font-semibold text-white">NFT Token {s.tokenId}</p>
                  <p className="text-2xl font-bold text-white">Price - {s.price} Eth</p>
                  <button className="w-full bg-cyan-600 text-white font-bold py-2 px-12 rounded" onClick={() => unsellNft(s)}>Cancel Selling</button>
                </div>
              </div>
          ))}
          </div>
        </div>
      )}
    {Boolean(nfts.length) && (
        <div className="px-4">
          <h2 className="text-2xl py-2">Owning</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            nfts.map((nft, i) => (
              <div key={i} className="border shadow rounded-xl overflow-hidden">
                <div className="p-4 bg-black">
                  <p style={{ height: '64px' }}
                    className="text-2xl font-semibold text-white">NFT Token {nft.tokenId}</p>
                  <p className="text-2xl font-bold text-white">Price - {nft.price} Eth</p>
                </div>
              </div>
          ))}
          </div>
        </div>
      )}
    </div>
  )
}
