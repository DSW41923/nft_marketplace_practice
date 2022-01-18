import ContextProvider, { UserContext } from './context.js'
import Identicon from 'identicon.js'
import Link from 'next/link'
import { Menu, Transition } from '@headlessui/react'
import { useContext } from 'react';

import {
  test_accounts
} from '../config'

export default function Navbar({ Component, pageProps }) {
  const [currentUserId, setCurrentUserId] = useContext(UserContext)

  return (
    <div>
      <nav className="border-b p-6">
        <p className="text-4xl font-bold">Demo NFT Marketplace</p>
        <div className="flex mt-4">
          <Link href="/">
            <a className="mr-4 text-blue-500">
              Home
            </a>
          </Link>
          <Link href="/create-nft">
            <a className="mr-6 text-blue-500">
              Sell NFT
            </a>
          </Link>
          <Link href="/my-nfts">
            <a className="mr-6 text-pink-500">
              My NFTs
            </a>
          </Link>
          <Link href="/transaction-history">
            <a className="mr-6 text-pink-500">
              Transaction History
            </a>
          </Link>
	  <Menu as="div" className="absolute right-0 mr-6">
            <Menu.Button className="flex font-medium font-mono text-gray-700">
	      {test_accounts[currentUserId]}
              <img className="ml-2 w-30 h-30" alt=""
               src={`data:image/png;base64,${new Identicon(test_accounts[currentUserId], 30).toString()}`}
               />
            </Menu.Button>
	    <Transition
             enter="transition duration-100 ease-out"
             enterFrom="transform scale-95 opacity-0"
             enterTo="transform scale-100 opacity-100"
             leave="transition duration-75 ease-out"
             leaveFrom="transform scale-100 opacity-100"
             leaveTo="transform scale-95 opacity-0"
             >
              <Menu.Items as="ul" className="absolute right-0">
                {test_accounts.map((account, i) => (
		  i != currentUserId &&
                  <Menu.Item key={i} as="li">
		    {({ active }) => (
                      <button id={account} className={`flex py-2 font-medium font-mono ${ active ? 'bg-blue-500 text-white' : 'bg-white text-gray-900'}`}
                       onClick={() => setCurrentUserId(i)} type="button">
                        {account}
                        <img className="ml-2 w-30 h-30" alt=""
                         src={`data:image/png;base64,${new Identicon(account, 30).toString()}`}
                         />
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </Menu.Items>
	    </Transition>
	  </Menu>
	</div>
      </nav>
    </div>
  )
}

