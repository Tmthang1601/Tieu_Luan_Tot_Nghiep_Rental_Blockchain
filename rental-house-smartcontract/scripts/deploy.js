async function main() {
  const RentalHouse = await ethers.getContractFactory("RentalHouse");
  const rentalHouse = await RentalHouse.deploy();
  await rentalHouse.deployed();

  console.log("RentalHouse deployed to:", rentalHouse.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });