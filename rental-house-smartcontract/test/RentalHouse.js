const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RentalHouse", function () {
  let RentalHouse;
  let rentalHouse;
  let owner;
  let tenant;
  let PRICE;

  beforeEach(async function () {
    PRICE = ethers.utils.parseEther("1");
    
    [owner, tenant] = await ethers.getSigners();
    const RentalHouseFactory = await ethers.getContractFactory("RentalHouse");
    rentalHouse = await RentalHouseFactory.deploy();
    await rentalHouse.deployed();
  });

  describe("House Management", function () {
    it("Should add a new house", async function () {
      await rentalHouse.addHouse(PRICE);
      const house = await rentalHouse.getHouse(1);
      
      expect(house.id).to.equal(1);
      expect(house.owner).to.equal(owner.address);
      expect(house.price).to.equal(PRICE);
      expect(house.isAvailable).to.be.true;
    });

    it("Should rent a house", async function () {
      await rentalHouse.addHouse(PRICE);
      
      await rentalHouse.connect(tenant).rentHouse(1, { value: PRICE });
      const house = await rentalHouse.getHouse(1);
      
      expect(house.isAvailable).to.be.false;
      expect(house.currentTenant).to.equal(tenant.address);
      expect(house.rentedUntil).to.be.gt(0);
    });

    it("Should fail when renting with incorrect payment", async function () {
      await rentalHouse.addHouse(PRICE);
      
      await expect(
        rentalHouse.connect(tenant).rentHouse(1, { value: 0 })
      ).to.be.revertedWith("Incorrect payment amount");
    });

    it("Should fail when renting unavailable house", async function () {
      await rentalHouse.addHouse(PRICE);
      await rentalHouse.connect(tenant).rentHouse(1, { value: PRICE });
      
      await expect(
        rentalHouse.connect(tenant).rentHouse(1, { value: PRICE })
      ).to.be.revertedWith("House is not available");
    });
  });
});