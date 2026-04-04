// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract MemoMuseum is ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public mtkToken;
    address public animalRescuePool = 0x742d35Cc6634C0532925a3b844Bc454e4438f44e;
    address public communityPool = 0x0000000000000000000000000000000000000000;

    struct Memory {
        string content;
        uint256 timestamp;
        bool isChallenge;
        bool isCompleted;
        uint256 stakeAmount;
        uint256 duration;
        uint8 charityType;
        string proof;
        bool isPending;
        uint256 reviewEndTime;
        uint256 votesForSuccess;
        uint256 votesForFailure;
    }

    struct PublicMemorial {
        uint256 id;
        address creator;
        string category;
        string content;
        uint256 timestamp;
        uint256 energy;
        int256 lat; 
        int256 lng;
        string color;
    }

    mapping(address => Memory[]) public userMemories;
    PublicMemorial[] public allPublicMemorials;
    mapping(address => uint256[]) public userStarTracks;
    mapping(address => mapping(uint256 => mapping(address => bool))) public hasVoted; 

    constructor(address _tokenAddress) { mtkToken = IERC20(_tokenAddress); }

    // --- 核心业务函数 ---
    function addToMuseum(string memory _content, bool _isChallenge, uint256 _stakeAmount, uint256 _days, uint8 _charityType) external nonReentrant {
        if (_isChallenge && _stakeAmount > 0) {
            mtkToken.safeTransferFrom(msg.sender, address(this), _stakeAmount);
        }
        userMemories[msg.sender].push(Memory({
            content: _content, timestamp: block.timestamp, isChallenge: _isChallenge, isCompleted: false,
            stakeAmount: _stakeAmount, duration: _days * 1 days, charityType: _charityType,
            proof: "", isPending: false, reviewEndTime: 0, votesForSuccess: 0, votesForFailure: 0
        }));
    }

    function startChallengeReview(uint256 _index, string memory _proof) external {
        Memory storage mem = userMemories[msg.sender][_index];
        require(block.timestamp >= mem.timestamp + mem.duration, "Duration not reached");
        require(!mem.isPending && !mem.isCompleted, "Already in review or completed");
        mem.proof = _proof;
        mem.isPending = true;
        mem.reviewEndTime = block.timestamp + 3 days;
    }

    function vote(address _user, uint256 _index, bool _approve) external {
        Memory storage mem = userMemories[_user][_index];
        require(mem.isPending, "Not in review");
        require(block.timestamp < mem.reviewEndTime, "Review period ended");
        require(!hasVoted[_user][_index][msg.sender], "Already voted");
        if (_approve) mem.votesForSuccess++; else mem.votesForFailure++;
        hasVoted[_user][_index][msg.sender] = true;
    }

    function finalizeChallenge(address _user, uint256 _index) external nonReentrant {
        Memory storage mem = userMemories[_user][_index];
        require(mem.isPending, "Not in review");
        require(block.timestamp >= mem.reviewEndTime, "Review period not over");
        mem.isPending = false;
        mem.isCompleted = true;
        bool isSuccess = (mem.votesForSuccess + mem.votesForFailure == 0) || (mem.votesForSuccess >= mem.votesForFailure);
        if (isSuccess) { mtkToken.safeTransfer(_user, mem.stakeAmount); } 
        else { mtkToken.safeTransfer((mem.charityType == 2) ? communityPool : animalRescuePool, mem.stakeAmount); }
    }

    function addPublicMemorial(string memory _category, string memory _content, int256 _lat, int256 _lng, string memory _color) external nonReentrant {
        uint256 newId = allPublicMemorials.length;
        allPublicMemorials.push(PublicMemorial({id: newId, creator: msg.sender, category: _category, content: _content, timestamp: block.timestamp, energy: 1, lat: _lat, lng: _lng, color: _color}));
        userStarTracks[msg.sender].push(newId);
    }

    function injectEnergy(uint256 _id) external nonReentrant {
        mtkToken.safeTransferFrom(msg.sender, address(this), 1 * 10**18);
        allPublicMemorials[_id].energy += 1;
    }

    // --- 🚀 修复补全：前端必需的查询函数 ---
    function getMemoryCount(address _user) external view returns (uint256) {
        return userMemories[_user].length;
    }

    function getAllPublicMemorials() external view returns (PublicMemorial[] memory) {
        return allPublicMemorials;
    }
}