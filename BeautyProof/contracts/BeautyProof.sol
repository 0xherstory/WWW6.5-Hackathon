// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BeautyProof {

    struct Procedure {
        address user;
        string procedureType;
        string productBatch;
        string doctorId;
        string notes;
        uint256 timestamp;
    }

    Procedure[] public procedures;

    event ProcedureRecorded(
        uint256 recordId,
        address indexed user,
        string procedureType,
        string productBatch,
        uint256 timestamp
    );

    function recordProcedure(
        string memory _procedureType,
        string memory _productBatch,
        string memory _doctorId,
        string memory _notes
    ) public {

        Procedure memory newProcedure = Procedure({
            user: msg.sender,
            procedureType: _procedureType,
            productBatch: _productBatch,
            doctorId: _doctorId,
            notes: _notes,
            timestamp: block.timestamp
        });

        procedures.push(newProcedure);

        emit ProcedureRecorded(
            procedures.length - 1,
            msg.sender,
            _procedureType,
            _productBatch,
            block.timestamp
        );
    }

    function getProcedure(uint256 _index) public view returns (
        address,
        string memory,
        string memory,
        string memory,
        string memory,
        uint256
    ) {
        Procedure memory p = procedures[_index];
        return (
            p.user,
            p.procedureType,
            p.productBatch,
            p.doctorId,
            p.notes,
            p.timestamp
        );
    }

    function getTotalProcedures() public view returns (uint256) {
        return procedures.length;
    }
}