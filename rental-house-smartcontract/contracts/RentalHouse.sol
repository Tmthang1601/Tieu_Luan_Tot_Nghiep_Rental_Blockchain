// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract RentalHouse {
    struct House {
        uint256 id;
        address owner;
        uint256 price; // giá thuê theo tháng (wei)
        bool isAvailable;
        address currentTenant;
        uint256 rentedUntil;
    }
    
    mapping(uint256 => House) public houses;
    uint256 public houseCount;
    
    event HouseAdded(uint256 indexed id, address owner, uint256 price);
    event HouseRented(uint256 indexed id, address tenant, uint256 rentedUntil);
    event RentPaid(uint256 indexed id, address tenant, uint256 amount);
    
    function addHouse(uint256 _price) external {
        houseCount++;
        houses[houseCount] = House({
            id: houseCount,
            owner: msg.sender,
            price: _price,
            isAvailable: true,
            currentTenant: address(0),
            rentedUntil: 0
        });
        
        emit HouseAdded(houseCount, msg.sender, _price);
    }
    
    function rentHouse(uint256 _houseId) external payable {
        House storage house = houses[_houseId];
        require(house.isAvailable, "House is not available");
        require(msg.value == house.price, "Incorrect payment amount");
        
        house.isAvailable = false;
        house.currentTenant = msg.sender;
        house.rentedUntil = block.timestamp + 30 days;
        
        // Chuyển tiền cho chủ nhà
        payable(house.owner).transfer(msg.value);
        
        emit HouseRented(_houseId, msg.sender, house.rentedUntil);
    }
    
    function getHouse(uint256 _houseId) external view returns (
        uint256 id,
        address owner,
        uint256 price,
        bool isAvailable,
        address currentTenant,
        uint256 rentedUntil
    ) {
        House memory house = houses[_houseId];
        return (
            house.id,
            house.owner,
            house.price,
            house.isAvailable,
            house.currentTenant,
            house.rentedUntil
        );
    }
}