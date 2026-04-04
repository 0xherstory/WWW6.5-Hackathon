// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IReactiveEsgPortfolio {
    enum PolicyAction {
        HOLD,
        REDUCE,
        EXIT,
        INCREASE
    }

    function applyReactivePolicy(address asset) external returns (PolicyAction action, uint16 newTargetBps);

    function positions(address asset) external view returns (uint256 units, uint16 targetBps, bool listed);
}

contract EsgPolicyCallbackExecutor is Ownable {
    // Deployment environment note:
    // - trustedCallbackProxy should be set to Reactive Callback Proxy on Sepolia.
    // - trustedRvmId should be set to the deployed EsgReactivePolicy contract address on Reactive.
    address public trustedCallbackProxy;
    address public trustedRvmId;
    IReactiveEsgPortfolio public immutable portfolio;

    struct CallbackContext {
        address rvmId;
        address protocol;
        uint8 signalAction;
        uint256 sourceTxHash;
    }

    event CallbackProxyUpdated(address indexed callbackProxy);
    event TrustedRvmUpdated(address indexed rvmId);
    event PolicyExecutionTriggered(
        uint256 indexed oracleTxHash,
        address indexed protocol,
        uint8 signalAction,
        uint8 executedAction,
        uint16 oldTargetBps,
        uint16 newTargetBps,
        bytes32 reactiveTxHash,
        address rvmId
    );

    constructor(address portfolioAddress, address initialOwner) Ownable(initialOwner) {
        require(portfolioAddress != address(0), "invalid portfolio");
        portfolio = IReactiveEsgPortfolio(portfolioAddress);
    }

    function setTrustedCallbackProxy(address callbackProxy) external onlyOwner {
        trustedCallbackProxy = callbackProxy;
        emit CallbackProxyUpdated(callbackProxy);
    }

    function setTrustedRvmId(address rvmId) external onlyOwner {
        trustedRvmId = rvmId;
        emit TrustedRvmUpdated(rvmId);
    }

    function onPolicySignal(
        address rvmId,
        address protocol,
        uint8 action,
        uint8, // oldRating (unused on Sepolia executor)
        uint8, // newRating (unused on Sepolia executor)
        bool, // severeIncident (policy is re-evaluated in portfolio)
        uint256 sourceTxHash
    ) external {
        require(msg.sender == trustedCallbackProxy, "invalid callback proxy");
        require(rvmId == trustedRvmId, "invalid rvm id");
        require(protocol != address(0), "invalid protocol");

        (, uint16 oldTargetBps, bool listed) = portfolio.positions(protocol);
        require(listed, "asset not listed");

        CallbackContext memory ctx = CallbackContext({
            rvmId: rvmId,
            protocol: protocol,
            signalAction: action,
            sourceTxHash: sourceTxHash
        });

        _executeAndEmit(ctx, oldTargetBps);
    }

    function _executeAndEmit(CallbackContext memory ctx, uint16 oldTargetBps) internal {
        (IReactiveEsgPortfolio.PolicyAction executedAction, uint16 newTargetBps) =
            portfolio.applyReactivePolicy(ctx.protocol);

        emit PolicyExecutionTriggered(
            ctx.sourceTxHash,
            ctx.protocol,
            ctx.signalAction,
            uint8(executedAction),
            oldTargetBps,
            newTargetBps,
            bytes32(0), // hash on Reactive chain is resolved by frontend tracker
            ctx.rvmId
        );
    }
}
