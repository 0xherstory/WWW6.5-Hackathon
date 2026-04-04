// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IEsgOracle {
    enum Rating {
        B,
        BB,
        BBB,
        A,
        AA,
        AAA
    }

    struct ESGScore {
        uint8 environmental;
        uint8 social;
        uint8 governance;
        uint8 total;
        Rating rating;
        uint64 updatedAt;
        bool severeIncident;
    }

    function getScore(address protocol) external view returns (ESGScore memory);
}

contract ReactiveEsgPortfolio is Ownable {
    using SafeERC20 for IERC20;

    enum PolicyAction {
        HOLD,
        REDUCE,
        EXIT,
        INCREASE
    }

    struct Position {
        uint256 units;
        uint16 targetBps;
        bool listed;
    }

    IEsgOracle public immutable oracle;
    address public policyExecutor;

    mapping(address => Position) public positions;
    mapping(address => IEsgOracle.Rating) public previousRatings;
    address[] public assets;

    uint256 public totalUnits;

    event AssetListed(address indexed asset, uint16 targetBps);
    event PolicyExecutorUpdated(address indexed executor);
    event PositionUnitsUpdated(address indexed asset, uint256 units, uint256 totalUnits);
    event PolicyApplied(address indexed asset, PolicyAction action, uint16 oldTargetBps, uint16 newTargetBps);

    constructor(address oracleAddress, address initialOwner) Ownable(initialOwner) {
        require(oracleAddress != address(0), "invalid oracle");
        oracle = IEsgOracle(oracleAddress);
    }

    modifier onlyPolicyOperator() {
        require(msg.sender == owner() || msg.sender == policyExecutor, "not policy operator");
        _;
    }

    function setPolicyExecutor(address executor) external onlyOwner {
        policyExecutor = executor;
        emit PolicyExecutorUpdated(executor);
    }

    function listAsset(address asset, uint16 targetBps) external onlyOwner {
        require(asset != address(0), "invalid asset");
        require(!positions[asset].listed, "already listed");
        require(targetBps <= 10_000, "bps too high");

        positions[asset] = Position({units: 0, targetBps: targetBps, listed: true});
        previousRatings[asset] = IEsgOracle.Rating.A;
        assets.push(asset);

        emit AssetListed(asset, targetBps);
    }

    function depositUnits(address asset, uint256 amount) external onlyOwner {
        require(positions[asset].listed, "asset not listed");

        if (amount > 0) {
            IERC20(asset).safeTransferFrom(msg.sender, address(this), amount);
            positions[asset].units += amount;
            totalUnits += amount;
        }

        emit PositionUnitsUpdated(asset, positions[asset].units, totalUnits);
    }

    function withdrawUnits(address asset, uint256 amount, address to) external onlyOwner {
        require(positions[asset].listed, "asset not listed");
        require(to != address(0), "invalid recipient");
        require(positions[asset].units >= amount, "insufficient units");

        if (amount > 0) {
            positions[asset].units -= amount;
            totalUnits -= amount;
            IERC20(asset).safeTransfer(to, amount);
        }

        emit PositionUnitsUpdated(asset, positions[asset].units, totalUnits);
    }

    function applyReactivePolicy(address asset) external onlyPolicyOperator returns (PolicyAction action, uint16 newTargetBps) {
        require(positions[asset].listed, "asset not listed");

        IEsgOracle.ESGScore memory score = oracle.getScore(asset);
        IEsgOracle.Rating oldRating = previousRatings[asset];
        uint16 currentBps = positions[asset].targetBps;

        if (score.severeIncident) {
            action = PolicyAction.EXIT;
            newTargetBps = 0;
        } else if (_isAtLeastA(oldRating) && score.rating == IEsgOracle.Rating.BBB) {
            action = PolicyAction.REDUCE;
            newTargetBps = currentBps > 2_000 ? currentBps - 2_000 : 0;
        } else if (score.rating <= IEsgOracle.Rating.BB) {
            action = PolicyAction.EXIT;
            newTargetBps = 0;
        } else if (score.rating >= IEsgOracle.Rating.AA) {
            action = PolicyAction.INCREASE;
            newTargetBps = currentBps + 1_000;
            if (newTargetBps > 10_000) {
                newTargetBps = 10_000;
            }
        } else {
            action = PolicyAction.HOLD;
            newTargetBps = currentBps;
        }

        positions[asset].targetBps = newTargetBps;
        previousRatings[asset] = score.rating;

        emit PolicyApplied(asset, action, currentBps, newTargetBps);
    }

    function assetCount() external view returns (uint256) {
        return assets.length;
    }

    function _isAtLeastA(IEsgOracle.Rating rating) private pure returns (bool) {
        return rating >= IEsgOracle.Rating.A;
    }
}
