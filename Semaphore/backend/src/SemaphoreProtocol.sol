// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract SemaphoreProtocol {
    error Unauthorized();
    error InviteCodeNotFound();
    error InviteCodeExpired();
    error InviteCodeAlreadyClaimed();
    error InviteRequestAlreadyFulfilled();
    error InvalidSignal();
    error SignalInactive();
    error InvalidResponse();
    error InvalidReadInvite();
    error InviteAlreadyReplied();
    error AccessDenied();
    error InvalidExpiry();
    error EmptyValue();
    error CannotRespondToOwnSignal();

    enum ReplyType {
        PrivateMessage,
        PublicComment,
        NewSignal
    }

    enum SignalVisibility {
        PublicFeed,
        PersonalOnly
    }

    enum InviteSource {
        DirectInvite,
        AccessGrant
    }

    enum EchoDestination {
        PrivateGift,
        PublicComment
    }

    struct InviteCode {
        address issuer;
        uint64 expiresAt;
        address claimedBy;
        bool exists;
    }

    struct InviteRequest {
        uint256 id;
        address requester;
        string requestCID;
        uint64 createdAt;
        bool fulfilled;
    }

    struct Signal {
        uint256 id;
        address author;
        uint256 parentSignalId;
        string hintCID;
        string encryptedContentCID;
        string question;
        string[] tags;
        uint64 createdAt;
        uint64 blockNumber;
        SignalVisibility visibility;
        bool active;
    }

    struct Response {
        uint256 id;
        uint256 signalId;
        address reader;
        string responseCID;
        uint64 createdAt;
        bool approved;
        uint64 accessExpiresAt;
    }

    struct ReadInvite {
        uint256 id;
        uint256 signalId;
        address from;
        address to;
        string excerptCID;
        uint64 createdAt;
        InviteSource source;
        bool replied;
    }

    struct InviteReply {
        uint256 inviteId;
        address replier;
        ReplyType replyType;
        string replyCID;
        uint64 createdAt;
        bool exists;
    }

    struct Echo {
        uint256 id;
        uint256 signalId;
        address sender;
        EchoDestination destination;
        string echoCID;
        uint64 createdAt;
    }

    event InviteCodeIssued(bytes32 indexed codeHash, address indexed issuer, uint64 expiresAt);
    event InviteCodeClaimed(bytes32 indexed codeHash, address indexed claimer);
    event InviteRequestCreated(uint256 indexed requestId, address indexed requester, string requestCID);
    event InviteRequestFulfilled(uint256 indexed requestId, bytes32 indexed codeHash, address indexed fulfiller);
    event MemberJoined(address indexed member, uint64 joinedAt);
    event SignalCreated(
        uint256 indexed signalId,
        address indexed author,
        uint256 indexed parentSignalId,
        SignalVisibility visibility
    );
    event SignalContentUpdated(
        uint256 indexed signalId,
        address indexed author,
        string encryptedContentCID
    );
    event SignalDeactivated(uint256 indexed signalId, address indexed author);
    event ResponseSubmitted(uint256 indexed responseId, uint256 indexed signalId, address indexed reader);
    event ReaderApproved(
        uint256 indexed signalId,
        uint256 indexed responseId,
        address indexed reader,
        uint64 expiresAt
    );
    event ReadInviteSent(
        uint256 indexed inviteId,
        uint256 indexed signalId,
        address indexed from,
        address to,
        InviteSource source
    );
    event ReadInviteReplied(
        uint256 indexed inviteId,
        address indexed replier,
        ReplyType replyType,
        string replyCID
    );
    event EchoSubmitted(
        uint256 indexed echoId,
        uint256 indexed signalId,
        address indexed sender,
        EchoDestination destination
    );

    address public immutable owner;

    uint256 public nextInviteRequestId = 1;
    uint256 public nextSignalId = 1;
    uint256 public nextResponseId = 1;
    uint256 public nextReadInviteId = 1;
    uint256 public nextEchoId = 1;

    mapping(address => bool) public isMember;
    mapping(address => uint64) public memberSince;

    mapping(bytes32 => InviteCode) private _inviteCodes;
    mapping(uint256 => InviteRequest) private _inviteRequests;
    mapping(address => uint256[]) private _inviteRequestsByRequester;

    mapping(uint256 => Signal) private _signals;
    mapping(address => uint256[]) private _signalsByAuthor;
    mapping(uint256 => uint256[]) private _childSignalIds;

    mapping(uint256 => Response) private _responses;
    mapping(uint256 => uint256[]) private _responseIdsBySignal;
    mapping(address => uint256[]) private _responsesByReader;
    mapping(address => uint256[]) private _responsesByAuthor;
    mapping(uint256 => mapping(address => uint64)) private _accessExpiryBySignalAndReader;

    mapping(uint256 => ReadInvite) private _readInvites;
    mapping(address => uint256[]) private _readInviteIdsByRecipient;
    mapping(address => uint256[]) private _sentReadInviteIdsBySender;
    mapping(uint256 => InviteReply) private _inviteReplies;
    mapping(uint256 => uint256) private _inviteIdByResponseId;

    mapping(uint256 => Echo) private _echoes;
    mapping(uint256 => uint256[]) private _echoIdsBySignal;

    constructor() {
        owner = msg.sender;
        isMember[msg.sender] = true;
        memberSince[msg.sender] = uint64(block.timestamp);
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyMember() {
        if (!(msg.sender == owner || isMember[msg.sender])) revert Unauthorized();
        _;
    }

    modifier onlySignalAuthor(uint256 signalId) {
        Signal storage signal = _signals[signalId];
        if (signal.id == 0) revert InvalidSignal();
        if (signal.author != msg.sender) revert Unauthorized();
        _;
    }

    function hashInviteCode(string calldata rawCode) external pure returns (bytes32) {
        return keccak256(bytes(rawCode));
    }

    function joinNetwork() external {
        if (!isMember[msg.sender]) {
            isMember[msg.sender] = true;
            memberSince[msg.sender] = uint64(block.timestamp);
            emit MemberJoined(msg.sender, uint64(block.timestamp));
        }
    }

    function issueInviteCode(bytes32 codeHash, uint64 expiresAt) external onlyMember {
        _issueInviteCode(codeHash, expiresAt);
    }

    function claimInviteCode(string calldata rawCode) external returns (bytes32 codeHash) {
        codeHash = keccak256(bytes(rawCode));
        InviteCode storage inviteCode = _inviteCodes[codeHash];

        if (!inviteCode.exists) revert InviteCodeNotFound();
        if (inviteCode.claimedBy != address(0)) revert InviteCodeAlreadyClaimed();
        if (inviteCode.expiresAt < block.timestamp) revert InviteCodeExpired();

        inviteCode.claimedBy = msg.sender;
        isMember[msg.sender] = true;
        memberSince[msg.sender] = uint64(block.timestamp);

        emit InviteCodeClaimed(codeHash, msg.sender);
    }

    function requestInvite(string calldata requestCID) external returns (uint256 requestId) {
        _requireNonEmpty(requestCID);

        requestId = nextInviteRequestId++;
        _inviteRequests[requestId] = InviteRequest({
            id: requestId,
            requester: msg.sender,
            requestCID: requestCID,
            createdAt: uint64(block.timestamp),
            fulfilled: false
        });
        _inviteRequestsByRequester[msg.sender].push(requestId);

        emit InviteRequestCreated(requestId, msg.sender, requestCID);
    }

    function fulfillInviteRequest(
        uint256 requestId,
        bytes32 codeHash,
        uint64 expiresAt
    ) external onlyMember {
        InviteRequest storage inviteRequest = _inviteRequests[requestId];
        if (inviteRequest.id == 0) revert InviteCodeNotFound();
        if (inviteRequest.fulfilled) revert InviteRequestAlreadyFulfilled();

        _issueInviteCode(codeHash, expiresAt);
        inviteRequest.fulfilled = true;

        emit InviteRequestFulfilled(requestId, codeHash, msg.sender);
    }

    function createSignal(
        uint256 parentSignalId,
        string calldata hintCID,
        string calldata encryptedContentCID,
        string calldata question,
        string[] calldata tags
    ) external onlyMember returns (uint256 signalId) {
        signalId = _createSignal(
            parentSignalId,
            hintCID,
            encryptedContentCID,
            question,
            tags,
            SignalVisibility.PublicFeed
        );
    }

    function createSignalWithVisibility(
        uint256 parentSignalId,
        string calldata hintCID,
        string calldata encryptedContentCID,
        string calldata question,
        string[] calldata tags,
        SignalVisibility visibility
    ) external onlyMember returns (uint256 signalId) {
        signalId = _createSignal(
            parentSignalId,
            hintCID,
            encryptedContentCID,
            question,
            tags,
            visibility
        );
    }

    function deactivateSignal(uint256 signalId) external onlySignalAuthor(signalId) {
        Signal storage signal = _signals[signalId];
        if (!signal.active) revert SignalInactive();
        signal.active = false;

        emit SignalDeactivated(signalId, msg.sender);
    }

    function setEncryptedContentCID(
        uint256 signalId,
        string calldata encryptedContentCID
    ) external onlySignalAuthor(signalId) {
        Signal storage signal = _signals[signalId];
        if (!signal.active) revert SignalInactive();
        _requireNonEmpty(encryptedContentCID);

        signal.encryptedContentCID = encryptedContentCID;

        emit SignalContentUpdated(signalId, msg.sender, encryptedContentCID);
    }

    function submitResponse(
        uint256 signalId,
        string calldata responseCID
    ) external onlyMember returns (uint256 responseId) {
        Signal storage signal = _signals[signalId];
        if (signal.id == 0) revert InvalidSignal();
        if (!signal.active) revert SignalInactive();
        if (signal.author == msg.sender) revert CannotRespondToOwnSignal();
        _requireNonEmpty(responseCID);

        responseId = nextResponseId++;
        _responses[responseId] = Response({
            id: responseId,
            signalId: signalId,
            reader: msg.sender,
            responseCID: responseCID,
            createdAt: uint64(block.timestamp),
            approved: false,
            accessExpiresAt: 0
        });

        _responseIdsBySignal[signalId].push(responseId);
        _responsesByReader[msg.sender].push(responseId);
        _responsesByAuthor[signal.author].push(responseId);

        emit ResponseSubmitted(responseId, signalId, msg.sender);
    }

    function approveReader(
        uint256 signalId,
        uint256 responseId,
        uint64 expiresAt
    ) external onlySignalAuthor(signalId) {
        if (expiresAt <= block.timestamp) revert InvalidExpiry();
        Signal storage signal = _signals[signalId];
        if (!signal.active) revert SignalInactive();

        Response storage response = _responses[responseId];
        if (response.id == 0 || response.signalId != signalId) revert InvalidResponse();

        response.approved = true;
        response.accessExpiresAt = expiresAt;
        _accessExpiryBySignalAndReader[signalId][response.reader] = expiresAt;

        emit ReaderApproved(signalId, responseId, response.reader, expiresAt);

        if (_inviteIdByResponseId[responseId] == 0) {
            uint256 inviteId = _createReadInvite(
                signalId,
                msg.sender,
                response.reader,
                signal.hintCID,
                InviteSource.AccessGrant
            );
            _inviteIdByResponseId[responseId] = inviteId;
        }
    }

    function hasActiveAccess(uint256 signalId, address reader) public view returns (bool) {
        return _accessExpiryBySignalAndReader[signalId][reader] >= block.timestamp;
    }

    function sendReadInvite(
        uint256 signalId,
        address recipient,
        string calldata excerptCID
    ) external onlySignalAuthor(signalId) returns (uint256 inviteId) {
        Signal storage signal = _signals[signalId];
        if (!signal.active) revert SignalInactive();
        inviteId = _createReadInvite(
            signalId,
            msg.sender,
            recipient,
            excerptCID,
            InviteSource.DirectInvite
        );
    }

    function replyToInvite(
        uint256 inviteId,
        ReplyType replyType,
        string calldata replyCID
    ) external returns (uint256 signalId) {
        ReadInvite storage readInvite = _readInvites[inviteId];
        if (readInvite.id == 0) revert InvalidReadInvite();
        if (readInvite.to != msg.sender) revert Unauthorized();
        if (readInvite.replied) revert InviteAlreadyReplied();
        _requireNonEmpty(replyCID);

        readInvite.replied = true;
        _inviteReplies[inviteId] = InviteReply({
            inviteId: inviteId,
            replier: msg.sender,
            replyType: replyType,
            replyCID: replyCID,
            createdAt: uint64(block.timestamp),
            exists: true
        });

        emit ReadInviteReplied(inviteId, msg.sender, replyType, replyCID);

        if (replyType == ReplyType.NewSignal) {
            string[] memory noTags = new string[](0);
            signalId = _createDerivedSignalFromInvite(readInvite.signalId, replyCID, noTags);
        } else {
            _createEcho(
                readInvite.signalId,
                msg.sender,
                replyType == ReplyType.PrivateMessage
                    ? EchoDestination.PrivateGift
                    : EchoDestination.PublicComment,
                replyCID
            );
        }
    }

    function submitEcho(
        uint256 signalId,
        EchoDestination destination,
        string calldata echoCID
    ) external onlyMember returns (uint256 echoId) {
        Signal storage signal = _signals[signalId];
        if (signal.id == 0) revert InvalidSignal();
        if (!signal.active) revert SignalInactive();
        _requireNonEmpty(echoCID);

        bool canEcho = signal.author == msg.sender || hasActiveAccess(signalId, msg.sender);
        if (!canEcho) revert AccessDenied();

        echoId = nextEchoId++;
        _echoes[echoId] = Echo({
            id: echoId,
            signalId: signalId,
            sender: msg.sender,
            destination: destination,
            echoCID: echoCID,
            createdAt: uint64(block.timestamp)
        });
        _echoIdsBySignal[signalId].push(echoId);

        emit EchoSubmitted(echoId, signalId, msg.sender, destination);
    }

    function getInviteCode(bytes32 codeHash) external view returns (InviteCode memory) {
        return _inviteCodes[codeHash];
    }

    function getInviteRequest(uint256 requestId) external view returns (InviteRequest memory) {
        return _inviteRequests[requestId];
    }

    function getInviteRequestsByRequester(
        address requester
    ) external view returns (uint256[] memory) {
        return _inviteRequestsByRequester[requester];
    }

    function getSignal(
        uint256 signalId
    )
        external
        view
        returns (
            uint256 id,
            address author,
            uint256 parentSignalId,
            string memory hintCID,
            string memory encryptedContentCID,
            string memory question,
            string[] memory tags,
            uint64 createdAt,
            uint64 blockNumber,
            bool active
        )
    {
        Signal storage signal = _signals[signalId];
        if (signal.id == 0) revert InvalidSignal();

        return (
            signal.id,
            signal.author,
            signal.parentSignalId,
            signal.hintCID,
            signal.encryptedContentCID,
            signal.question,
            signal.tags,
            signal.createdAt,
            signal.blockNumber,
            signal.active
        );
    }

    function getSignalVisibility(uint256 signalId) external view returns (SignalVisibility) {
        Signal storage signal = _signals[signalId];
        if (signal.id == 0) revert InvalidSignal();
        return signal.visibility;
    }

    function getSignalsByAuthor(address author) external view returns (uint256[] memory) {
        return _signalsByAuthor[author];
    }

    function getSignalChildren(uint256 signalId) external view returns (uint256[] memory) {
        return _childSignalIds[signalId];
    }

    function getResponse(uint256 responseId) external view returns (Response memory) {
        Response memory response = _responses[responseId];
        if (response.id == 0) revert InvalidResponse();
        return response;
    }

    function getResponsesForSignal(uint256 signalId) external view returns (uint256[] memory) {
        return _responseIdsBySignal[signalId];
    }

    function getResponsesByReader(address reader) external view returns (uint256[] memory) {
        return _responsesByReader[reader];
    }

    function getResponsesForAuthor(address author) external view returns (uint256[] memory) {
        return _responsesByAuthor[author];
    }

    function getReadInvite(uint256 inviteId) external view returns (ReadInvite memory) {
        ReadInvite memory readInvite = _readInvites[inviteId];
        if (readInvite.id == 0) revert InvalidReadInvite();
        return readInvite;
    }

    function getInviteIdForResponse(uint256 responseId) external view returns (uint256) {
        return _inviteIdByResponseId[responseId];
    }

    function getReadInvitesForRecipient(address recipient) external view returns (uint256[] memory) {
        return _readInviteIdsByRecipient[recipient];
    }

    function getSentReadInvites(address sender) external view returns (uint256[] memory) {
        return _sentReadInviteIdsBySender[sender];
    }

    function getInviteReply(uint256 inviteId) external view returns (InviteReply memory) {
        InviteReply memory inviteReply = _inviteReplies[inviteId];
        if (!inviteReply.exists) revert InvalidReadInvite();
        return inviteReply;
    }

    function getEcho(uint256 echoId) external view returns (Echo memory) {
        Echo memory echo = _echoes[echoId];
        if (echo.id == 0) revert InvalidResponse();
        return echo;
    }

    function getEchoesForSignal(uint256 signalId) external view returns (uint256[] memory) {
        return _echoIdsBySignal[signalId];
    }

    function _issueInviteCode(bytes32 codeHash, uint64 expiresAt) internal {
        if (expiresAt <= block.timestamp) revert InvalidExpiry();
        InviteCode storage inviteCode = _inviteCodes[codeHash];

        inviteCode.issuer = msg.sender;
        inviteCode.expiresAt = expiresAt;
        inviteCode.claimedBy = address(0);
        inviteCode.exists = true;

        emit InviteCodeIssued(codeHash, msg.sender, expiresAt);
    }

    function _createDerivedSignalFromInvite(
        uint256 parentSignalId,
        string memory replyCID,
        string[] memory tags
    ) internal returns (uint256 signalId) {
        signalId = _createSignal(
            parentSignalId,
            replyCID,
            replyCID,
            "Derived from invite reply",
            tags,
            SignalVisibility.PublicFeed
        );
    }

    function _createSignal(
        uint256 parentSignalId,
        string memory hintCID,
        string memory encryptedContentCID,
        string memory question,
        string[] memory tags,
        SignalVisibility visibility
    ) internal returns (uint256 signalId) {
        _requireNonEmpty(hintCID);
        _requireNonEmpty(encryptedContentCID);
        _requireNonEmpty(question);

        if (parentSignalId != 0) {
            Signal storage parentSignal = _signals[parentSignalId];
            if (parentSignal.id == 0) revert InvalidSignal();
            if (!parentSignal.active) revert SignalInactive();

            bool canDerive = parentSignal.author == msg.sender ||
                hasActiveAccess(parentSignalId, msg.sender);
            if (!canDerive) revert AccessDenied();
        }

        signalId = nextSignalId++;
        Signal storage signal = _signals[signalId];
        signal.id = signalId;
        signal.author = msg.sender;
        signal.parentSignalId = parentSignalId;
        signal.hintCID = hintCID;
        signal.encryptedContentCID = encryptedContentCID;
        signal.question = question;
        signal.createdAt = uint64(block.timestamp);
        signal.blockNumber = uint64(block.number);
        signal.visibility = visibility;
        signal.active = true;

        for (uint256 index = 0; index < tags.length; index++) {
            _requireNonEmpty(tags[index]);
            signal.tags.push(tags[index]);
        }

        _signalsByAuthor[msg.sender].push(signalId);
        if (parentSignalId != 0) {
            _childSignalIds[parentSignalId].push(signalId);
        }

        emit SignalCreated(signalId, msg.sender, parentSignalId, visibility);
    }

    function _createReadInvite(
        uint256 signalId,
        address from,
        address recipient,
        string memory excerptCID,
        InviteSource source
    ) internal returns (uint256 inviteId) {
        if (recipient == address(0)) revert Unauthorized();
        _requireNonEmpty(excerptCID);

        inviteId = nextReadInviteId++;
        _readInvites[inviteId] = ReadInvite({
            id: inviteId,
            signalId: signalId,
            from: from,
            to: recipient,
            excerptCID: excerptCID,
            createdAt: uint64(block.timestamp),
            source: source,
            replied: false
        });

        _readInviteIdsByRecipient[recipient].push(inviteId);
        _sentReadInviteIdsBySender[from].push(inviteId);

        emit ReadInviteSent(inviteId, signalId, from, recipient, source);
    }

    function _createEcho(
        uint256 signalId,
        address sender,
        EchoDestination destination,
        string memory echoCID
    ) internal returns (uint256 echoId) {
        echoId = nextEchoId++;
        _echoes[echoId] = Echo({
            id: echoId,
            signalId: signalId,
            sender: sender,
            destination: destination,
            echoCID: echoCID,
            createdAt: uint64(block.timestamp)
        });
        _echoIdsBySignal[signalId].push(echoId);

        emit EchoSubmitted(echoId, signalId, sender, destination);
    }

    function _requireNonEmpty(string memory value) internal pure {
        if (bytes(value).length == 0) revert EmptyValue();
    }
}
