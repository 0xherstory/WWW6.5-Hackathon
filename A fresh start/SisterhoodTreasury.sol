// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SisterhoodMembership {
    address public admin;

    mapping(address => bool) public isActive;          // 正式成员状态
    mapping(address => bool) public joinRequests;      // 申请加入的请求
    mapping(address => bool) public leaveRequests;     // 申请退出的请求

    event MemberJoined(address indexed member);
    event MemberLeft(address indexed member);
    event JoinRequested(address indexed applicant);
    event JoinRequestApproved(address indexed applicant);
    event JoinRequestRejected(address indexed applicant);
    event LeaveRequested(address indexed member);
    event LeaveRequestApproved(address indexed member);
    event LeaveRequestRejected(address indexed member);
    event AdminTransferred(address indexed oldAdmin, address indexed newAdmin);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call");
        _;
    }

    modifier onlyMember() {
        require(isActive[msg.sender], "Only active members can call");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    // 成员申请加入
    function requestJoin() external {
        require(!isActive[msg.sender], "Already active");
        require(!joinRequests[msg.sender], "Already requested join");
        joinRequests[msg.sender] = true;
        emit JoinRequested(msg.sender);
    }

    // 成员取消加入申请
    function cancelJoinRequest() external {
        require(joinRequests[msg.sender], "No join request");
        joinRequests[msg.sender] = false;
        emit JoinRequestRejected(msg.sender); // 复用事件，表示申请被取消
    }

    // 管理员审批加入
    function approveJoin(address applicant) external onlyAdmin {
        require(joinRequests[applicant], "No join request");
        require(!isActive[applicant], "Already active");
        joinRequests[applicant] = false;
        isActive[applicant] = true;
        emit JoinRequestApproved(applicant);
        emit MemberJoined(applicant);
    }

    // 管理员拒绝加入申请
    function rejectJoin(address applicant) external onlyAdmin {
        require(joinRequests[applicant], "No join request");
        joinRequests[applicant] = false;
        emit JoinRequestRejected(applicant);
    }

    // 成员申请退出（必须是活跃成员）
    function requestLeave() external onlyMember {
        require(!leaveRequests[msg.sender], "Already requested leave");
        leaveRequests[msg.sender] = true;
        emit LeaveRequested(msg.sender);
    }

    // 成员取消退出申请
    function cancelLeaveRequest() external {
        require(leaveRequests[msg.sender], "No leave request");
        leaveRequests[msg.sender] = false;
        emit LeaveRequestRejected(msg.sender);
    }

    // 管理员审批退出
    function approveLeave(address member) external onlyAdmin {
        require(leaveRequests[member], "No leave request");
        require(isActive[member], "Not active");
        leaveRequests[member] = false;
        isActive[member] = false;
        emit LeaveRequestApproved(member);
        emit MemberLeft(member);
    }

    // 管理员拒绝退出申请
    function rejectLeave(address member) external onlyAdmin {
        require(leaveRequests[member], "No leave request");
        leaveRequests[member] = false;
        emit LeaveRequestRejected(member);
    }

    // 可选：转移管理员权限
    function transferAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "New admin is zero address");
        address oldAdmin = admin;
        admin = newAdmin;
        emit AdminTransferred(oldAdmin, newAdmin);
    }
}
