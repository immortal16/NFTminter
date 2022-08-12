import { useState, useEffect } from 'react';
import { ethers } from "ethers";

import abi from "./contracts/Japanese.json";
import nftMetaData from "./nft_metadata.json";

function App() {
  const [error, setError] = useState(null);

  const [nftSupply, setNftSupply] = useState(100);
  const [mintStatus, setMintStatus] = useState("");
  const [nftMintPrice, setNftMintPrice] = useState(0);
  const [alreadyMinted, setAlreadyMinted] = useState(null);
  
  const [openSeaProfile, setOpenSeaProfile] = useState('');
  const [yourWalletAddress, setYourWalletAddress] = useState(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [ownerAddress, setOwnerAddress] = useState('0xA70E23C42a225312dC81C68E9ebFe6B573BE8b61');

  const contractAddress = '0xC27d46B3118Ec4B4bc936a9e0192f69745f33b66';
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        const account = accounts[0];

        setIsWalletConnected(true);
        getContractInfo();
        setYourWalletAddress(account);
        setOpenSeaProfile(`https://testnets.opensea.io/${account}?tab=activity`);
        console.log("Account Connected: ", account);
      } else {
        setError("Install a MetaMask wallet to mint our NFT Collection.");
        console.log("No Metamask detected");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getContractInfo = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const nftContract = new ethers.Contract(contractAddress, contractABI, signer);
      const nftSupply = await nftContract.MAX_SUPPLY();
      const minted = await nftContract.totalSupply();
      const mintPrice = await nftContract.MINT_PRICE();

      let _owner = await nftContract.owner();
      setOwnerAddress(_owner);

      setNftSupply(parseInt(nftSupply));
      setAlreadyMinted(parseInt(minted));
      setNftMintPrice(ethers.utils.formatEther((mintPrice)));

      console.log('Total NFTS', parseInt(nftSupply));
      console.log('Mint price', parseInt(mintPrice));
    } catch (error) {
      console.log(error);
    }
  }

  const mintToken = async (tokenId) => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const nftContract = new ethers.Contract(contractAddress, contractABI, signer);

        const metadataURI = `https://nftstorage.link/ipfs/bafybeiegqxyxhkie7t7fwsryprvbmbet7fwr5ss5m6nwanldiamphbglci/${tokenId}.json`
        console.log(metadataURI);
        const txn = await nftContract.safeMint(yourWalletAddress, metadataURI, {
          value: ethers.utils.parseEther('0.001'),
        });

        console.log("NFT Minting...");
        setMintStatus("⌛Minting...");
        await txn.wait();
        console.log("NFT Minted", txn.hash);
        setMintStatus("✅ Done.");
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Install a MetaMask wallet to mint an NFT.");
      }
    } catch (error) {
      console.log(error);
    }
  }


  useEffect(() => {
    checkIfWalletIsConnected();
    getContractInfo();
  }, [])

  return (
    <main className="container mx-auto p-4 bg-gradient-to-tl from-purple-500 to-pink-500">
      <span className="prose">
        <h1 className="text-white sm:text-5xl text-3xl text-center sm:mt-5 sm:mb-10 mb-5">⛩ Japanese Art NFT Minter ⛩</h1>
      </span>
      <div className="mt-5">
        {isWalletConnected ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {
                nftMetaData.map((nftMetaData) => {
                  return (
                    <div className="card bg-base-100 shadow-xl col-span-1" key={nftMetaData.edition}>{console.log(nftMetaData)}
                      <figure>
                        <img src={nftMetaData.image} alt={nftMetaData.name} />
                      </figure>
                      <div className="card-body">
                        <h2 className="card-title text-white">{nftMetaData.name}</h2>
                        <p className="mb-3 text-white">{nftMetaData.description}</p>
                        <p className="mb-3 text-amber-400"><span className="text-white font-semibold">Mint Price:</span> {nftMintPrice} ETH</p>
                        <div className="card-actions justify-center">
                          <button className="btn btn-primary btn-wide bg-gradient-to-tl from-purple-500 to-pink-500 border-2 border-indigo-500/100"
                            onClick={() => mintToken(nftMetaData.edition)}>
                            PURCHASE
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              }
            </div>
            <div class="space"></div>
            <p className="mt-5 text-center font-bold text-white">{mintStatus}</p>
            <p className="mt-5 text-center font-bold text-white"><span className="font-bold text-white">Your Wallet Address: </span>{yourWalletAddress}</p>
            <div className="mt-5">
              <p className="font-bold text-amber-900 text-center"><span className="font-bold text-white mt-5">Your NFT will be available at </span>
                <span className=" text-white underline-offset-auto"> <a href={openSeaProfile}target="_blank" rel="noopener noreferrer"><u>OpenSea</u></a> </span>
              </p>
            </div>
          </>
        ) : (
          <div className="prose mx-auto">
            <h2 className="text-center font-bold text-white">Connect Your Wallet to Start Minting</h2>
            <button className="btn btn-primary w-full" onClick={checkIfWalletIsConnected}>
              {"Connect Wallet 🔑"}
            </button>
          </div>
        )}
      </div>
      <section className="customer-section pb-10 text-center">
        {error && <p className="text-2xl text-red-700 mt-5">{error}</p>}
        <div className="mt-5">
          <p className="font-bold text-white"><span className="font-bold text-white">Contract Address: </span>{contractAddress}</p>
        </div>
        <div className="mt-5">
          <p className="font-bold text-white"><span className="font-bold text-white">Owner Address: </span>{ownerAddress}</p>
        </div>
        <div className="mt-5">
          <p className="font-bold text-white"><span className="font-bold text-white">Remaining NFTs: </span>{nftSupply - alreadyMinted}</p>
        </div>
      </section>
    </main>
  );
}
export default App;