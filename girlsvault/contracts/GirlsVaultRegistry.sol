// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./GirlsVaultProject.sol";
import "./GirlsVaultSBT.sol";

contract GirlsVaultRegistry {

    address public admin;
    address[] public projects;
    GirlsVaultSBT public sbt;

    event ProjectCreated(
        address indexed projectAddress,
        string name,
        address indexed creator
    );

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    constructor() {
        admin = msg.sender;
        sbt = new GirlsVaultSBT();
    }

    function createProject(
        string memory _name,
        string memory _description,
        address _beneficiary,
        address[] memory _validators,
        uint256 _requiredSignatures,
        uint256 _targetAmount,
        uint256 _validatorStakeRequired
    ) external returns (address) {
        GirlsVaultProject project = new GirlsVaultProject(
            _name,
            _description,
            _beneficiary,
            _validators,
            _requiredSignatures,
            _targetAmount,
            msg.sender,
            address(sbt),
            _validatorStakeRequired
        );
        projects.push(address(project));
        sbt.authorizeMinter(address(project));
        emit ProjectCreated(address(project), _name, msg.sender);
        return address(project);
    }

    function getSbtAddress() external view returns (address) {
        return address(sbt);
    }

    function getProjects() external view returns (address[] memory) {
        return projects;
    }

    function getProjectCount() external view returns (uint256) {
        return projects.length;
    }
}
