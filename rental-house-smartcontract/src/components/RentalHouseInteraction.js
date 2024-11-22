import { ethers } from 'ethers';
import React, { useState, useEffect } from 'react';
import RentalHouse from '../artifacts/contracts/RentalHouse.sol/RentalHouse.json';

const RentalHouseInteraction = () => {
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [houses, setHouses] = useState([]);
  const [price, setPrice] = useState('');

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Thay thế bằng địa chỉ contract sau khi deploy

  useEffect(() => {
    const init = async () => {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, RentalHouse.abi, signer);
        
        setProvider(provider);
        setSigner(signer);
        setContract(contract);
      }
    };
    
    init();
  }, []);

  const connectWallet = async () => {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  };

  const addHouse = async () => {
    if (!contract) return;
    try {
      const priceInWei = ethers.utils.parseEther(price);
      const tx = await contract.addHouse(priceInWei);
      await tx.wait();
      alert('House added successfully!');
      setPrice('');
    } catch (error) {
      console.error('Error:', error);
      alert('Error adding house');
    }
  };

  const rentHouse = async (houseId) => {
    if (!contract) return;
    try {
      const house = await contract.getHouse(houseId);
      const tx = await contract.rentHouse(houseId, { value: house.price });
      await tx.wait();
      alert('House rented successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Error renting house');
    }
  };

  const loadHouses = async () => {
    if (!contract) return;
    try {
      const count = await contract.houseCount();
      const loadedHouses = [];
      for (let i = 1; i <= count.toNumber(); i++) {
        const house = await contract.getHouse(i);
        loadedHouses.push({
          id: house.id.toNumber(),
          owner: house.owner,
          price: ethers.utils.formatEther(house.price),
          isAvailable: house.isAvailable,
          currentTenant: house.currentTenant,
          rentedUntil: new Date(house.rentedUntil.toNumber() * 1000).toLocaleString()
        });
      }
      setHouses(loadedHouses);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Rental House Management</h1>
      
      <button
        onClick={connectWallet}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Connect Wallet
      </button>

      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Add New House</h2>
        <input
          type="text"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price in ETH"
          className="border p-2 mr-2"
        />
        <button
          onClick={addHouse}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Add House
        </button>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-2">Houses</h2>
        <button
          onClick={loadHouses}
          className="bg-purple-500 text-white px-4 py-2 rounded mb-4"
        >
          Load Houses
        </button>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {houses.map((house) => (
            <div key={house.id} className="border p-4 rounded">
              <p>ID: {house.id}</p>
              <p>Price: {house.price} ETH</p>
              <p>Available: {house.isAvailable ? 'Yes' : 'No'}</p>
              <p>Owner: {house.owner.slice(0, 8)}...</p>
              {house.isAvailable && (
                <button
                  onClick={() => rentHouse(house.id)}
                  className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
                >
                  Rent House
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RentalHouseInteraction;