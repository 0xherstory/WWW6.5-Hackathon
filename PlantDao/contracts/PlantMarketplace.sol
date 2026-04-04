// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./PlantNFT.sol";
import "./PleafToken.sol";

/**
 * @title PlantMarketplace
 * @dev 简化版 NFT 市场
 * - 用 $PLEAF 定价
 * - 支持挂单、购买、取消
 */
contract PlantMarketplace is Ownable {
    PlantNFT public plantNFT;
    PleafToken public pleafToken;

    // 挂单结构体
    struct Listing {
        uint256 plantId;       // 植物 NFT ID
        address seller;        // 卖家
        uint256 price;         // 价格 ($PLEAF)
        bool active;           // 是否活跃
        uint256 listedTime;    // 挂单时间
    }

    // 挂单列表
    Listing[] public listings;

    // 事件
    event PlantListed(uint256 indexed plantId, address indexed seller, uint256 price);
    event PlantSold(uint256 indexed plantId, address indexed seller, address indexed buyer, uint256 price);
    event ListingCancelled(uint256 indexed plantId);

    constructor(address _plantNFT, address _pleafToken) {
        plantNFT = PlantNFT(_plantNFT);
        pleafToken = PleafToken(_pleafToken);
    }

    /**
     * @dev 挂单出售植物
     * @param plantId 植物 ID
     * @param price 价格 ($PLEAF)
     */
    function listPlant(uint256 plantId, uint256 price) external {
        require(plantNFT.ownerOf(plantId) == msg.sender, "Not the owner");
        require(price > 0, "Price must be > 0");

        // 将 NFT 转移到市场合约（托管）
        plantNFT.transferFrom(msg.sender, address(this), plantId);

        listings.push(Listing({
            plantId: plantId,
            seller: msg.sender,
            price: price,
            active: true,
            listedTime: block.timestamp
        }));

        emit PlantListed(plantId, msg.sender, price);
    }

    /**
     * @dev 购买植物
     * @param listingIndex 挂单索引
     */
    function buyPlant(uint256 listingIndex) external {
        require(listingIndex < listings.length, "Invalid listing");
        Listing storage listing = listings[listingIndex];
        require(listing.active, "Listing not active");
        require(msg.sender != listing.seller, "Cannot buy your own plant");

        // 标记为不活跃
        listing.active = false;

        // 转移 $PLEAF 从买家到卖家
        require(pleafToken.transferFrom(msg.sender, listing.seller, listing.price), "PLEAF transfer failed");

        // 转移 NFT 从市场到买家
        plantNFT.transferFrom(address(this), msg.sender, listing.plantId);

        emit PlantSold(listing.plantId, listing.seller, msg.sender, listing.price);
    }

    /**
     * @dev 取消挂单
     */
    function cancelListing(uint256 listingIndex) external {
        require(listingIndex < listings.length, "Invalid listing");
        Listing storage listing = listings[listingIndex];
        require(listing.active, "Listing not active");
        require(listing.seller == msg.sender, "Not the seller");

        listing.active = false;

        // 返还 NFT
        plantNFT.transferFrom(address(this), msg.sender, listing.plantId);

        emit ListingCancelled(listing.plantId);
    }

    // ============ View Functions ============

    function getActiveListings() external view returns (Listing[] memory) {
        uint256 count;
        for (uint256 i = 0; i < listings.length; i++) {
            if (listings[i].active) count++;
        }

        Listing[] memory active = new Listing[](count);
        uint256 idx;
        for (uint256 i = 0; i < listings.length; i++) {
            if (listings[i].active) {
                active[idx] = listings[i];
                idx++;
            }
        }
        return active;
    }

    function getListingCount() external view returns (uint256) {
        return listings.length;
    }
}