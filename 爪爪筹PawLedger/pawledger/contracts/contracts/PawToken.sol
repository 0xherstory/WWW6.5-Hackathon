// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PawToken is ERC20, Ownable {
    address public minter;

    event MinterSet(address indexed minter);

    constructor(address _owner) ERC20("PawToken", "$PAW") Ownable(_owner) {}

    /// @notice Transfer minting rights to PawLedger. Callable once by owner.
    function setMinter(address _minter) external onlyOwner {
        require(minter == address(0), "Minter already set");
        require(_minter != address(0), "Zero address");
        minter = _minter;
        emit MinterSet(_minter);
    }

    /// @notice Mint $PAW tokens. Callable only by the designated minter (PawLedger).
    function mint(address to, uint256 amount) external {
        require(msg.sender == minter, "Not minter");
        _mint(to, amount);
    }
}
