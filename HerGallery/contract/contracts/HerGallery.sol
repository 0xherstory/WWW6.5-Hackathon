// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract HerGallery {
    // ============ 数据结构 ============

    struct Exhibition {
        uint256 id;
        string title;
        string contentHash;      // IPFS哈希 - 主题介绍
        string coverHash;        // IPFS哈希 - 封面图
        address curator;
        uint256 createdAt;
        bool isActive;
        uint256 submissionCount;
    }

    struct Submission {
        uint256 id;
        uint256 exhibitionId;
        string contentType;      // art / testimony / screenshot / link
        string contentHash;      // IPFS哈希 - 内容
        string title;
        string description;
        address creator;
        uint256 recommendCount;
        uint256 createdAt;
    }

    // ============ 状态变量 ============

    Exhibition[] public exhibitions;
    mapping(uint256 => Submission[]) public exhibitionSubmissions;
    mapping(uint256 => mapping(address => bool)) public hasRecommended; // submissionId => user => bool

    uint256 public constant CREATION_FEE = 0.001 ether;

    // ============ 事件 ============

    event ExhibitionCreated(uint256 indexed id, string title, address indexed curator);
    event SubmissionCreated(uint256 indexed id, uint256 indexed exhibitionId, address indexed creator);
    event Recommended(uint256 indexed submissionId, address indexed recommender, uint256 newCount);
    event FirstSubmission(address indexed user, uint256 submissionId);
    event RecommendMilestone(address indexed creator, uint256 submissionId, uint256 recommendCount);

    // ============ 映射记录首次投稿 ============

    mapping(address => bool) public hasSubmitted;

    // ============ 用户名映射 ============

    mapping(address => string) public usernames;
    mapping(address => bool) public hasSetUsername;

    event UsernameSet(address indexed user, string username);

    function setUsername(string memory _username) external {
        require(bytes(_username).length > 0 && bytes(_username).length <= 20, "Username must be 1-20 characters");
        usernames[msg.sender] = _username;
        hasSetUsername[msg.sender] = true;
        emit UsernameSet(msg.sender, _username);
    }

    // ============ 展厅功能 ============

    function createExhibition(
        string memory _title,
        string memory _contentHash,
        string memory _coverHash
    ) external payable {
        require(msg.value >= CREATION_FEE, "Insufficient creation fee");

        uint256 id = exhibitions.length;

        exhibitions.push(Exhibition({
            id: id,
            title: _title,
            contentHash: _contentHash,
            coverHash: _coverHash,
            curator: msg.sender,
            createdAt: block.timestamp,
            isActive: true,
            submissionCount: 0
        }));

        emit ExhibitionCreated(id, _title, msg.sender);
    }

    function getExhibition(uint256 _id) external view returns (Exhibition memory) {
        require(_id < exhibitions.length, "Exhibition does not exist");
        return exhibitions[_id];
    }

    function getAllExhibitions() external view returns (Exhibition[] memory) {
        return exhibitions;
    }

    // ============ 投稿功能 ============

    function submitToExhibition(
        uint256 _exhibitionId,
        string memory _contentType,
        string memory _contentHash,
        string memory _title,
        string memory _description
    ) external {
        require(_exhibitionId < exhibitions.length, "Exhibition does not exist");
        require(exhibitions[_exhibitionId].isActive, "Exhibition is not active");

        uint256 submissionId = exhibitionSubmissions[_exhibitionId].length;

        Submission memory newSubmission = Submission({
            id: submissionId,
            exhibitionId: _exhibitionId,
            contentType: _contentType,
            contentHash: _contentHash,
            title: _title,
            description: _description,
            creator: msg.sender,
            recommendCount: 0,
            createdAt: block.timestamp
        });

        exhibitionSubmissions[_exhibitionId].push(newSubmission);
        exhibitions[_exhibitionId].submissionCount++;

        emit SubmissionCreated(submissionId, _exhibitionId, msg.sender);

        // 检查首次投稿
        if (!hasSubmitted[msg.sender]) {
            hasSubmitted[msg.sender] = true;
            emit FirstSubmission(msg.sender, submissionId);
        }
    }

    function getSubmissions(uint256 _exhibitionId) external view returns (Submission[] memory) {
        require(_exhibitionId < exhibitions.length, "Exhibition does not exist");
        return exhibitionSubmissions[_exhibitionId];
    }

    // ============ 推荐功能 ============

    function recommend(uint256 _exhibitionId, uint256 _submissionId) external {
        require(_exhibitionId < exhibitions.length, "Exhibition does not exist");
        require(_submissionId < exhibitionSubmissions[_exhibitionId].length, "Submission does not exist");

        Submission storage submission = exhibitionSubmissions[_exhibitionId][_submissionId];
        uint256 submissionGlobalId = submission.id;

        require(!hasRecommended[submissionGlobalId][msg.sender], "Already recommended");

        hasRecommended[submissionGlobalId][msg.sender] = true;
        submission.recommendCount++;

        emit Recommended(submissionGlobalId, msg.sender, submission.recommendCount);

        // 检查里程碑（10的倍数）
        if (submission.recommendCount % 10 == 0) {
            emit RecommendMilestone(submission.creator, submissionGlobalId, submission.recommendCount);
        }
    }

    // ============ 获取展厅投稿数量 ============

    function getSubmissionCount(uint256 _exhibitionId) external view returns (uint256) {
        require(_exhibitionId < exhibitions.length, "Exhibition does not exist");
        return exhibitionSubmissions[_exhibitionId].length;
    }

    // ============ 批量查询推荐状态 ============

    function getRecommendedStatus(uint256 _exhibitionId, address _user) external view returns (bool[] memory) {
        uint256 count = exhibitionSubmissions[_exhibitionId].length;
        bool[] memory statuses = new bool[](count);
        for (uint256 i = 0; i < count; i++) {
            statuses[i] = hasRecommended[exhibitionSubmissions[_exhibitionId][i].id][_user];
        }
        return statuses;
    }
}
