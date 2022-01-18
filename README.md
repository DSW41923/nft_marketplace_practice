# NFT Marketplace Practice
Simple NFT Exchange Demonstration with Node.js, Next.js, Solidity, and Hardhat

## Getting Started
To run this project locally, follow these steps.

1. Clone the project locally, change into the directory, and install the dependencies:

```sh
git clone https://github.com/DSW41923/nft_marketplace_practice.git
cd nft_marketplace_practice
# install using NPM
npm install
```

2. Start the local Hardhat node

```sh
npx hardhat node
```

3. With the network running, deploy the contracts to the local network in a separate terminal window

```sh
npx hardhat run scripts/deploy.js --network localhost
```

4. Start the app

```
npm run dev
``` 

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

