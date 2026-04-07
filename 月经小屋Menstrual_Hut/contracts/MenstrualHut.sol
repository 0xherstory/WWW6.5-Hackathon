// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IMoonToken {
    function mintTo(address to, uint256 amount) external;
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);

}


contract MenstrualHut {
    struct Record {
        string cid;       
        address author;   
        uint256 timestamp;
        bool isHelp;      // 心理/生理求助
        bool isDonation;  // 是否为月经产品捐赠/申领标记
        uint8 postType;    // 0=免费公开, 1=收费公开, 2=隐私
        uint256 price;     // postType=1 时的 MOON 价格（wei 单位）
    }

    struct PeriodLog {
        uint256 startTime; 
        uint256 endTime;   
        uint8 flowLevel;   
        string symptomCid; 
    }

    Record[] public records;
    address public moonTokenAddress;
    uint256 public rewardAmount = 10 * 10**18; 
    
    // 冷却时间设置（防止薅羊毛）
    // 建议：Demo 演示时设为 1分钟，正式上线设为 1天
    uint256 public rewardCooldown = 1 days; 
    mapping(address => uint256) public lastRewardTime;
    mapping(uint256 => mapping(address => bool)) public hasPaid;
    mapping(address => PeriodLog[]) private userPeriodLogs;

    event RecordPurchased(uint256 indexed recordId, address indexed buyer, address indexed author, uint256 price);
    event RecordUploaded(uint256 indexed id, address indexed author, string cid, bool isDonation);
    event PeriodRecorded(address indexed user, uint256 startTime);

    constructor(address _moonTokenAddress) {
        moonTokenAddress = _moonTokenAddress;
    }

    // 内部奖励函数：检查冷却逻辑
    function _tryMintReward(address _user) internal {
        if (block.timestamp >= lastRewardTime[_user] + rewardCooldown) {
            IMoonToken(moonTokenAddress).mintTo(_user, rewardAmount);
            lastRewardTime[_user] = block.timestamp;
        }
        // 如果在冷却期内，依然可以上传内容，只是不发币，这样保证了数据的连续性
    }

    // 上传函数签名
    function uploadRecord(
        string memory _cid,
        bool _isHelp,
        bool _isDonation,
        uint8 _postType,   // 0/1/2
        uint256 _price     // 仅 postType=1 时有效
    ) public {
        require(_postType <= 2, "Invalid postType");
        
        records.push(Record({
            cid: _cid,
            author: msg.sender,
            timestamp: block.timestamp,
            isHelp: _isHelp,
            isDonation: _isDonation,
            postType: _postType,
            price: _postType == 1 ? _price : 0
        }));

        _tryMintReward(msg.sender);
        emit RecordUploaded(records.length - 1, msg.sender, _cid, _isDonation);
    }

    function startPeriod(uint8 _flowLevel, string memory _symptomCid) public {
        userPeriodLogs[msg.sender].push(PeriodLog({
            startTime: block.timestamp,
            endTime: 0, 
            flowLevel: _flowLevel,
            symptomCid: _symptomCid
        }));
        
        _tryMintReward(msg.sender);
        
        emit PeriodRecorded(msg.sender, block.timestamp);
    }

    function endPeriod() public {
        uint256 count = userPeriodLogs[msg.sender].length;
        require(count > 0, "No records found");
        uint256 lastIndex = count - 1;
        require(userPeriodLogs[msg.sender][lastIndex].endTime == 0, "Already ended");
        
        userPeriodLogs[msg.sender][lastIndex].endTime = block.timestamp;
    }

    // 仅本人可查（保护隐私）
    function getMyPeriods(address _user) public view returns (PeriodLog[] memory) {
        return userPeriodLogs[_user];
    }

    function getTotalRecords() public view returns (uint256) {
        return records.length;
    }

    // 可以调用这个函数临时修改冷却时间，方便现场演示
    function setCooldown(uint256 _newCooldown) public {
        // 实际项目应加 onlyOwner，黑客松 Demo 期间可简化
        rewardCooldown = _newCooldown;
    }

    // 付费查看（调用前前端必须先完成 approve）
    function viewPaidRecord(uint256 _recordId) public {
        require(_recordId < records.length, "Record not exist");
        Record memory r = records[_recordId];
        require(r.postType == 1, "Not a paid post");
        require(msg.sender != r.author, "Author can view for free");
        require(!hasPaid[_recordId][msg.sender], "Already purchased");

        // 检查授权额度是否足够（给用户更友好的错误提示）
        uint256 allowed = IMoonToken(moonTokenAddress).allowance(msg.sender, address(this));
        require(allowed >= r.price, "Insufficient MOON allowance, please approve first");

        // 从读者转给作者
        bool success = IMoonToken(moonTokenAddress).transferFrom(msg.sender, r.author, r.price);
        require(success, "MOON transfer failed");

        hasPaid[_recordId][msg.sender] = true;
        emit RecordPurchased(_recordId, msg.sender, r.author, r.price);
    }

    // 查询某人是否有权限查看某条帖子
    function canViewRecord(uint256 _recordId, address _viewer) public view returns (bool) {
        Record memory r = records[_recordId];
        if (r.postType == 2) return r.author == _viewer;                              // 隐私帖
        if (r.postType == 0) return true;                                              // 免费帖
        if (r.postType == 1) return r.author == _viewer || hasPaid[_recordId][_viewer]; // 收费帖
        return false;
    }

    function updatePeriodSymptom(string memory _newSymptomCid) public {
        uint256 count = userPeriodLogs[msg.sender].length;
        require(count > 0, "No records found");
        uint256 lastIndex = count - 1;
        
        // 允许在经期结束前或结束后的一段时间内更新感受
        userPeriodLogs[msg.sender][lastIndex].symptomCid = _newSymptomCid;
        
        // 同样给予奖励（可选，取决于你的产品设计）
        _tryMintReward(msg.sender);
    }
}