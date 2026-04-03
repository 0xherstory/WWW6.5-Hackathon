// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MarkMeow {

    uint256 public totalDonations;
    uint256 public totalCats;
    uint256 public neuterPriceFemale;
    uint256 public neuterPriceMale;

    uint256 public cnyToEthRate = 2000;  // 汇率：1 ETH = 2000 CNY

    mapping(uint16 => Cat) public cats;  // 流浪猫注册表
    mapping(address => uint256) public donations;  // 捐赠记录（每个地址的捐赠总额）
    mapping(uint16 => string) public neuterProofs;  // 存储猫咪绝育证明的IPFS哈希

    address public owner;  // 合约拥有者

    struct Cat {
        uint16 id;           // 流浪猫唯一ID
        uint8 gender;        // 性别（0 = 公猫，1 = 母猫）
        bool isNeutered;     // 是否已绝育
    }

    event CatRegistered(uint16 catId, uint8 gender, bool isNeutered);
    event NeuterStatusUpdated(uint16 catId, bool isNeutered);
    event DonationReceived(address indexed donor, uint256 amount);
    event Withdraw(address indexed recipient, uint256 amount);
    event NeuterProofUploaded(uint16 catId, string ipfsHash);

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner.");
        _;
    }

    constructor() {
        owner = msg.sender;  // 设置合约的拥有者为部署合约的地址
        neuterPriceFemale = 10 * 10**16;  // 母猫奖励 200 CNY 转换为 wei
        neuterPriceMale = 5 * 10**16;  // 公猫奖励 100 CNY 转换为 wei
    }

    // 注册流浪猫
    function registerCat(uint8 _gender, bool _isNeutered) public {
        totalCats += 1;
        uint16 catId = uint16(totalCats); // 使用 uint16 来表示 ID

        // 确保猫咪数据不会被覆盖
        require(cats[catId].id == 0, "Cat already registered.");

        cats[catId] = Cat({
            id: catId,
            gender: _gender,
            isNeutered: _isNeutered
        });

        emit CatRegistered(catId, _gender, _isNeutered);
    }

    // 更新流浪猫的绝育状态
    function updateNeuterStatus(uint16 _catId, bool _isNeutered) public {
        require(cats[_catId].id != 0, "Cat not found.");
        require(cats[_catId].isNeutered != _isNeutered, "No change in neuter status.");

        cats[_catId].isNeutered = _isNeutered;

        // 只有在流浪猫被绝育时，才奖励捐赠者
        if (_isNeutered) {
            uint256 rewardAmount = calculateReward(cats[_catId].gender); // 动态计算奖励
            emit NeuterStatusUpdated(_catId, _isNeutered);
            emit DonationReceived(msg.sender, rewardAmount);
        }
    }

    // 上传绝育证明文件的IPFS哈希
    function uploadNeuterProof(uint16 _catId, string memory _ipfsHash) public {
        require(cats[_catId].id != 0, "Cat not found.");
        require(bytes(_ipfsHash).length > 0, "Invalid IPFS hash.");

        neuterProofs[_catId] = _ipfsHash;
        emit NeuterProofUploaded(_catId, _ipfsHash);
    }

    // 查询猫咪的绝育证明IPFS哈希
    function getNeuterProof(uint16 _catId) public view returns (string memory) {
        return neuterProofs[_catId];
    }

    // 捐赠资金到流浪基金会
    function donate() public payable {
        require(msg.value > 0, "Donation amount must be greater than 0.");

        totalDonations += msg.value;
        donations[msg.sender] += msg.value;
        emit DonationReceived(msg.sender, msg.value);
    }

    // 提取捐赠资金（只允许合约拥有者操作）
    function withdraw(uint256 amount) public onlyOwner {
        require(amount <= address(this).balance, "Insufficient balance.");
        payable(owner).transfer(amount);
        emit Withdraw(owner, amount);
    }

    // 计算奖励金额：根据性别和人民币汇率来计算ETH数量，再转为wei
    function calculateReward(uint8 _gender) public view returns (uint256) {
        if (_gender == 0) {
            return neuterPriceMale;  // 公猫奖励
        } else {
            return neuterPriceFemale;  // 母猫奖励
        }
    }

    // 获取合约当前余额
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
}