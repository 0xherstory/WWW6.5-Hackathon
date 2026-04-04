// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract SymBreath is ERC721URIStorage, ReentrancyGuard, Ownable {
    using Strings for uint256;

    enum DisasterMode { Drought, Flood, Heatwave }

    uint256 public stakeAmount = 0.01 ether; 
    address public charityAddress;   
    uint256 private _nextTokenId;    

    struct UserChallenge {
        uint256 startTime;
        uint256 duration;
        bool isActive;
        bool isCompleted;
    }

    mapping(address => UserChallenge) public challenges;

    event Staked(address indexed user, uint256 amount, uint256 choiceDays);
    event MeditationCompleted(address indexed user, DisasterMode mode, uint256 timestamp);
    event ChallengeSuccess(address indexed user, uint256 amountRefunded);
    event SBTClaimed(address indexed user, uint256 indexed tokenId);
    event ChallengeFailed(address indexed user, uint256 amountDonated);
    event EmergencyReset(address indexed user); // 重置事件

    constructor() ERC721("SymBreath Badge", "SBT") Ownable(msg.sender) {
        charityAddress = 0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2; 
        _nextTokenId = 1;
    }

    /// @notice 紧急重置函数：当用户状态卡死时，调用此函数强制重置 isActive 为 false
    /// 注意：为了防止资金锁死，本函数仅重置状态，不处理退款。
    /// 如果你希望重置时自动捐赠或退款，可以在此处加入逻辑。
    function emergencyReset() external nonReentrant {
        require(challenges[msg.sender].isActive, "No active challenge to reset");
        
        challenges[msg.sender].isActive = false;
        
        emit EmergencyReset(msg.sender);
    }

    /// @notice 质押 0.01 AVAX 开启挑战
    function stake(uint256 choiceDays) external payable nonReentrant {
        require(msg.value == stakeAmount, "Must stake exactly 0.01 ETH");
        require(!challenges[msg.sender].isActive, "Challenge already active");
        
        challenges[msg.sender] = UserChallenge({
            startTime: block.timestamp,
            duration: choiceDays,
            isActive: true,
            isCompleted: false
        });

        emit Staked(msg.sender, msg.value, choiceDays);
    }

    /// @notice 完成挑战：自动退钱 + 铸造带样式的 SBT
    function checkIn(DisasterMode mode) external nonReentrant {
        UserChallenge storage user = challenges[msg.sender];
        require(user.isActive, "No active challenge");

        emit MeditationCompleted(msg.sender, mode, block.timestamp);

        _handleSuccess(msg.sender);
    }

    /// @notice 退出挑战：钱将捐给慈善地址
    function failChallenge() external nonReentrant {
        UserChallenge storage user = challenges[msg.sender];
        require(user.isActive, "No active challenge to fail");
        
        _handleFailure(msg.sender);
    }

    /// @dev 内部成功逻辑
    function _handleSuccess(address _user) internal {
        challenges[_user].isActive = false;
        challenges[_user].isCompleted = true;

        (bool success, ) = payable(_user).call{value: stakeAmount}("");
        require(success, "Refund failed");

        _mintSBTWithImage(_user);
        
        emit ChallengeSuccess(_user, stakeAmount);
    }
    
    function _handleFailure(address _user) internal {
        challenges[_user].isActive = false;
        (bool success, ) = payable(charityAddress).call{value: stakeAmount}("");
        require(success, "Donation failed");
        emit ChallengeFailed(_user, stakeAmount);
    }
    
    function _mintSBTWithImage(address _to) internal {
        uint256 tokenId = _nextTokenId++;
        _safeMint(_to, tokenId);

        string memory svg = _buildSVG(tokenId);
        
        string memory json = Base64.encode(bytes(string(abi.encodePacked(
            '{"name": "SymBreath Hero #', tokenId.toString(), '",',
            '"description": "Staked 0.01 AVAX and completed the challenge",',
            '"image": "data:image/svg+xml;base64,', Base64.encode(bytes(svg)), '"}'
        ))));

        string memory finalTokenUri = string(abi.encodePacked("data:application/json;base64,", json));
        
        _setTokenURI(tokenId, finalTokenUri);
        
        emit SBTClaimed(_to, tokenId);
    }

    function _buildSVG(uint256 _tokenId) internal pure returns (string memory) {
        return string(abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 350 350">',
            '<style>.base { fill: white; font-family: sans-serif; font-size: 24px; font-weight: bold; }</style>',
            '<rect width="100%" height="100%" fill="#FFD700" rx="20" />',
            '<circle cx="175" cy="150" r="80" fill="none" stroke="white" stroke-width="5" />',
            '<text x="50%" y="160" class="base" text-anchor="middle">SymBreath</text>',
            '<text x="50%" y="260" class="base" text-anchor="middle" font-size="16">ID: #', _tokenId.toString(), '</text>',
            '<text x="50%" y="290" class="base" text-anchor="middle" font-size="12">CHALLENGE SUCCESS</text>',
            '</svg>'
        ));
    }

    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert("SBT: Soulbound tokens cannot be transferred");
        }
        return super._update(to, tokenId, auth);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}