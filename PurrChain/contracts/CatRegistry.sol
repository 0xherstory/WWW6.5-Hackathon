// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

// ============================================================
//  CatRegistry v2
//
//  机构审批：多数投票制
//    - 超过半数管理员（含 owner）投 approve → 自动通过
//    - 超过半数管理员投 reject  → 自动拒绝
//  机构关闭：多数投票制
//    - 超过半数管理员投 close → 机构关闭，旗下非 Adopted 猫咪变 Closed
//  猫咪 addCat：不含 stage3(genesis) URI 入口（由 updateCatStageURI 单独设置）
// ============================================================

contract CatRegistry is Ownable {

    // ========== 枚举 ==========

    enum ShelterStatus { Pending, Approved, Rejected, Closed }
    enum CatStatus     { Available, CloudAdopted, PendingAdoption, Adopted, Closed }

    // ========== 结构 ==========

    struct Shelter {
        string name;
        string location;
        address wallet;
        ShelterStatus status;
    }

    struct Cat {
        uint256 id;
        string  name;
        uint8   age;
        string  gender;
        string  description;
        string[4] stageURIs;
        address shelter;
        CatStatus status;
    }

    struct VoteRecord {
        uint32 approveCount;
        uint32 rejectCount;
    }

    // ========== 存储 ==========

    mapping(address => Shelter)    public shelters;
    mapping(uint256 => Cat)        public cats;
    mapping(address => bool)       public authorizedContracts;
    mapping(address => bool)       public admins;
    address[]                      private _adminList;
    uint256                        public catCount;

    // 审批投票：shelter => voter => 已投(true=赞成 false=反对 未投则不在mapping中)
    mapping(address => VoteRecord)         private _approveVoteRecord;
    mapping(address => mapping(address => int8)) private _approveVoted; // 1=approve -1=reject 0=unvoted

    // 关闭投票：shelter => voter => 已投
    mapping(address => VoteRecord)         private _closeVoteRecord;
    mapping(address => mapping(address => bool)) private _closeVoted;

    // ========== 事件 ==========

    event ShelterRegistered(address indexed shelter, string name, string location);
    event ShelterApproved(address indexed shelter);
    event ShelterRejected(address indexed shelter);
    event ShelterClosed(address indexed shelter);
    event VoteCast(address indexed voter, address indexed shelter, string voteType, bool approve);
    event CatAdded(uint256 indexed catId, address indexed shelter, string name);
    event CatStatusUpdated(uint256 indexed catId, CatStatus status);
    event CatStageURIUpdated(uint256 indexed catId, uint8 stage);
    event AdminUpdated(address indexed admin, bool status);

    // ========== 构造函数 ==========

    constructor() Ownable(msg.sender) {}

    // ========== 管理员 ==========

    modifier onlyOwnerOrAdmin() {
        require(msg.sender == owner() || admins[msg.sender], "CatRegistry: not authorized");
        _;
    }

    function setAdmin(address _admin, bool _status) external onlyOwner {
        require(_admin != address(0), "CatRegistry: zero address");
        if (_status && !admins[_admin]) {
            _adminList.push(_admin);
        }
        admins[_admin] = _status;
        emit AdminUpdated(_admin, _status);
    }

    /// @notice 管理员总数（含 owner）
    function adminCount() public view returns (uint256) {
        uint256 count = 1; // owner
        for (uint256 i = 0; i < _adminList.length; i++) {
            if (admins[_adminList[i]]) count++;
        }
        return count;
    }

    function _majority() internal view returns (uint256) {
        return adminCount() / 2 + 1;
    }

    function _isVoter(address _addr) internal view returns (bool) {
        return _addr == owner() || admins[_addr];
    }

    // ========== 机构注册 ==========

    function registerShelter(string calldata _name, string calldata _location) external {
        require(bytes(shelters[msg.sender].name).length == 0, "Already registered");
        shelters[msg.sender] = Shelter(_name, _location, msg.sender, ShelterStatus.Pending);
        emit ShelterRegistered(msg.sender, _name, _location);
    }

    // ========== 投票审批机构 ==========

    /// @notice 投票审批待审批机构（approve=true 赞成，false 反对）
    function voteApprove(address _shelter, bool _approve) external {
        require(_isVoter(msg.sender), "CatRegistry: not authorized");
        require(shelters[_shelter].status == ShelterStatus.Pending, "CatRegistry: not pending");

        VoteRecord storage rec = _approveVoteRecord[_shelter];
        int8 prev = _approveVoted[_shelter][msg.sender];

        if (prev == 1)  { rec.approveCount--; }
        if (prev == -1) { rec.rejectCount--;  }

        if (_approve) {
            rec.approveCount++;
            _approveVoted[_shelter][msg.sender] = 1;
        } else {
            rec.rejectCount++;
            _approveVoted[_shelter][msg.sender] = -1;
        }

        emit VoteCast(msg.sender, _shelter, "approve", _approve);

        uint256 maj = _majority();
        if (rec.approveCount >= maj) {
            shelters[_shelter].status = ShelterStatus.Approved;
            emit ShelterApproved(_shelter);
        } else if (rec.rejectCount >= maj) {
            shelters[_shelter].status = ShelterStatus.Rejected;
            emit ShelterRejected(_shelter);
        }
    }

    function getApproveVotes(address _shelter) external view returns (uint32 approveCount, uint32 rejectCount, uint256 majority) {
        VoteRecord storage rec = _approveVoteRecord[_shelter];
        return (rec.approveCount, rec.rejectCount, _majority());
    }

    function getMyApproveVote(address _shelter, address _voter) external view returns (int8) {
        return _approveVoted[_shelter][_voter];
    }

    // ========== 投票关闭机构 ==========

    function voteClose(address _shelter) external {
        require(_isVoter(msg.sender), "CatRegistry: not authorized");
        require(shelters[_shelter].status == ShelterStatus.Approved, "CatRegistry: not approved");
        require(!_closeVoted[_shelter][msg.sender], "CatRegistry: already voted close");

        _closeVoted[_shelter][msg.sender] = true;
        _closeVoteRecord[_shelter].approveCount++;

        emit VoteCast(msg.sender, _shelter, "close", true);

        if (_closeVoteRecord[_shelter].approveCount >= _majority()) {
            _executeClosure(_shelter);
        }
    }

    function getCloseVotes(address _shelter) external view returns (uint32 closeCount, uint256 majority) {
        return (_closeVoteRecord[_shelter].approveCount, _majority());
    }

    function _executeClosure(address _shelter) internal {
        shelters[_shelter].status = ShelterStatus.Closed;
        emit ShelterClosed(_shelter);
        for (uint256 i = 0; i < catCount; i++) {
            if (cats[i].shelter == _shelter && cats[i].status != CatStatus.Adopted) {
                cats[i].status = CatStatus.Closed;
                emit CatStatusUpdated(i, CatStatus.Closed);
            }
        }
    }

    // ========== 授权合约 ==========

    function setAuthorizedContract(address _contract, bool _approved) external onlyOwnerOrAdmin {
        require(_contract != address(0), "CatRegistry: zero address");
        authorizedContracts[_contract] = _approved;
    }

    modifier onlyAuthorizedContract() {
        require(authorizedContracts[msg.sender], "CatRegistry: not authorized");
        _;
    }

    // ========== 猫咪操作 ==========

    /// @notice 机构添加猫咪（stage3 genesis URI 不在此处填写，由 updateCatStageURI 单独设置）
    function addCat(
        string calldata _name,
        uint8 _age,
        string calldata _gender,
        string calldata _description,
        string[3] calldata _stageURIs  // 只接收 stage0/1/2
    ) external {
        require(shelters[msg.sender].status == ShelterStatus.Approved, "Not approved shelter");
        uint256 catId = catCount++;
        string[4] memory uris = [_stageURIs[0], _stageURIs[1], _stageURIs[2], ""];
        cats[catId] = Cat(catId, _name, _age, _gender, _description, uris, msg.sender, CatStatus.Available);
        emit CatAdded(catId, msg.sender, _name);
    }

    /// @notice 机构更新猫咪某阶段 URI（含 stage3 genesis）
    function updateCatStageURI(uint256 _catId, uint8 _stage, string calldata _uri) external {
        require(cats[_catId].shelter == msg.sender, "Not your cat");
        require(_stage < 4, "Invalid stage");
        cats[_catId].stageURIs[_stage] = _uri;
        emit CatStageURIUpdated(_catId, _stage);
    }

    /// @notice 机构更新猫咪简介
    function updateCatDescription(uint256 _catId, string calldata _description) external {
        require(cats[_catId].shelter == msg.sender, "Not your cat");
        require(bytes(_description).length > 0, "CatRegistry: empty description");
        cats[_catId].description = _description;
        emit CatStageURIUpdated(_catId, 255); // 255 作为 description 更新的信号
    }

    /// @notice 机构手动更新猫咪状态（不能直接设为 Adopted/Closed）
    function updateCatStatus(uint256 _catId, CatStatus _status) external {
        require(cats[_catId].shelter == msg.sender, "Not your cat");
        require(
            _status != CatStatus.Adopted && _status != CatStatus.Closed,
            "CatRegistry: cannot set this status manually"
        );
        cats[_catId].status = _status;
        emit CatStatusUpdated(_catId, _status);
    }

    /// @notice 授权合约状态流转
    function updateCatStatusByContract(uint256 _catId, CatStatus _status) external onlyAuthorizedContract {
        require(cats[_catId].shelter != address(0), "CatRegistry: cat does not exist");
        CatStatus current = cats[_catId].status;
        require(
            (current == CatStatus.Available       && _status == CatStatus.CloudAdopted)    ||
            (current == CatStatus.Available       && _status == CatStatus.PendingAdoption) ||
            (current == CatStatus.CloudAdopted    && _status == CatStatus.PendingAdoption) ||
            (current == CatStatus.PendingAdoption && _status == CatStatus.Adopted)         ||
            (current == CatStatus.PendingAdoption && _status == CatStatus.Available),
            "CatRegistry: invalid status transition"
        );
        cats[_catId].status = _status;
        emit CatStatusUpdated(_catId, _status);
    }

    // ========== 查询 ==========

    function getCat(uint256 _catId) external view returns (Cat memory) {
        return cats[_catId];
    }

    function isShelterApproved(address _shelter) external view returns (bool) {
        return shelters[_shelter].status == ShelterStatus.Approved;
    }

    function isShelterClosed(address _shelter) external view returns (bool) {
        return shelters[_shelter].status == ShelterStatus.Closed;
    }

    /// @notice 返回当前有效的管理员地址列表（不含 owner）
    /// @dev 前端用于展示投票成员、判断当前连接钱包是否有投票权
    function getAdminList() external view returns (address[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < _adminList.length; i++) {
            if (admins[_adminList[i]]) count++;
        }
        address[] memory result = new address[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < _adminList.length; i++) {
            if (admins[_adminList[i]]) result[idx++] = _adminList[i];
        }
        return result;
    }

    /// @notice 返回某批猫咪（分页）
    /// @param _offset 起始 catId
    /// @param _limit  最多返回数量
    function getCats(uint256 _offset, uint256 _limit) external view returns (Cat[] memory) {
        uint256 end = _offset + _limit;
        if (end > catCount) end = catCount;
        Cat[] memory result = new Cat[](end - _offset);
        for (uint256 i = _offset; i < end; i++) {
            result[i - _offset] = cats[i];
        }
        return result;
    }
}
