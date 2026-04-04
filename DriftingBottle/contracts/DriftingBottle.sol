// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DriftingBottle {
    struct Bottle {
        uint256 id;
        address creator;
        string contentHash;
        uint256 timestamp;
    }

    struct Reply {
        address replier;
        string contentHash;
        uint256 timestamp;
    }

    uint256 public bottleCount;
    mapping(uint256 => Bottle) public bottles;
    mapping(uint256 => Reply[]) public replies;
    // 🆕 新增：记录用户拥有的瓶子ID列表
    mapping(address => uint256[]) public userBottles;

    event BottleCreated(uint256 bottleId, address creator);
    event Replied(uint256 bottleId, address replier);
    event Tipped(address from, address to, uint256 amount);

    function createBottle(string memory _contentHash) public {
        bottleCount++;
        bottles[bottleCount] = Bottle({
            id: bottleCount,
            creator: msg.sender,
            contentHash: _contentHash,
            timestamp: block.timestamp
        });
        
        // 🆕 记录到用户列表
        userBottles[msg.sender].push(bottleCount);

        emit BottleCreated(bottleCount, msg.sender);
    }

    function replyBottle(uint256 _bottleId, string memory _contentHash) public {
        require(_bottleId > 0 && _bottleId <= bottleCount, "Invalid bottle");
        replies[_bottleId].push(Reply({
            replier: msg.sender,
            contentHash: _contentHash,
            timestamp: block.timestamp
        }));
        emit Replied(_bottleId, msg.sender);
    }

    // 🔵 获取随机瓶子
    function getRandomBottle() public view returns (uint256 id, string memory content, address creator) {
        require(bottleCount > 0, "No bottles");
        uint256 randomId = (uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, bottleCount))) % bottleCount) + 1;
        Bottle storage b = bottles[randomId];
        return (b.id, b.contentHash, b.creator);
    }

    // 🔵 获取某个瓶子的所有回复（修复报错的关键）
    function getAllReplies(uint256 _bottleId) public view returns (Reply[] memory) {
        return replies[_bottleId];
    }

    // 🔵 获取用户发过的所有瓶子ID
    function getUserBottles(address _user) public view returns (uint256[] memory) {
        return userBottles[_user];
    }

    // 💰 通用打赏（可以打赏作者，也可以作者打赏回信者）
    function tip(address payable _to) public payable {
        require(msg.value > 0, "No value");
        _to.transfer(msg.value);
        emit Tipped(msg.sender, _to, msg.value);
    }
}