// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/*
  Reactive dependency note:
  - This contract follows the official Reactive pattern:
    subscribe -> react(LogRecord) -> emit Callback(...)
  - The imports below depend on Reactive official library package and compile toolchain support.
  - Expected deployment:
    1) Deploy this contract on Reactive KOPLI (Reactive chain)
    2) Subscribe to Sepolia EsgOracle logs
    3) Callback target contract should be deployed on Sepolia
*/

import "https://raw.githubusercontent.com/Reactive-Network/reactive-lib/main/src/abstract-base/AbstractReactive.sol";
import "https://raw.githubusercontent.com/Reactive-Network/reactive-lib/main/src/interfaces/IReactive.sol";
import "https://raw.githubusercontent.com/Reactive-Network/reactive-lib/main/src/interfaces/ISubscriptionService.sol";

interface IEsgPolicyCallback {
    function onPolicySignal(
        address rvmId,
        address protocol,
        uint8 action,
        uint8 oldRating,
        uint8 newRating,
        bool severeIncident,
        uint256 sourceTxHash
    ) external;
}

contract EsgReactivePolicy is AbstractReactive {
    enum Rating {
        B,
        BB,
        BBB,
        A,
        AA,
        AAA
    }

    enum PolicyAction {
        HOLD,
        REDUCE,
        EXIT,
        INCREASE
    }

    uint256 public immutable sourceChainId;
    address public immutable esgOracle;
    uint256 public immutable callbackChainId;
    address public immutable callbackTarget;
    uint64 public immutable callbackGasLimit;

    uint256 public constant ESG_SCORE_UPDATED_TOPIC0 =
        uint256(keccak256("ESGScoreUpdated(address,uint8,uint8,uint8,uint8,uint8,uint64)"));
    uint256 public constant ESG_INCIDENT_DETECTED_TOPIC0 =
        uint256(keccak256("ESGIncidentDetected(address,bool,string,string,uint64)"));

    mapping(address => uint8) public lastRatingByProtocol;
    mapping(address => bool) public hasSeenRating;

    event PolicyEvaluated(
        address indexed protocol,
        uint256 indexed sourceTxHash,
        PolicyAction action,
        Rating oldRating,
        Rating newRating,
        bool severeIncident
    );

    constructor(
        address payable serviceAddress,
        address oracleAddress,
        uint256 oracleChainId,
        uint256 targetChainId,
        address targetContract,
        uint64 targetGasLimit
    ) payable {
        service = ISystemContract(payable(serviceAddress));
        esgOracle = oracleAddress;
        sourceChainId = oracleChainId;
        callbackChainId = targetChainId;
        callbackTarget = targetContract;
        callbackGasLimit = targetGasLimit;

        if (!vm) {
            service.subscribe(
                sourceChainId,
                esgOracle,
                ESG_SCORE_UPDATED_TOPIC0,
                REACTIVE_IGNORE,
                REACTIVE_IGNORE,
                REACTIVE_IGNORE
            );
            service.subscribe(
                sourceChainId,
                esgOracle,
                ESG_INCIDENT_DETECTED_TOPIC0,
                REACTIVE_IGNORE,
                REACTIVE_IGNORE,
                REACTIVE_IGNORE
            );
        }
    }

    function react(LogRecord calldata log) external vmOnly {
        if (log.chain_id != sourceChainId || log._contract != esgOracle) {
            return;
        }

        if (log.topic_0 == ESG_SCORE_UPDATED_TOPIC0) {
            _onScoreUpdated(log);
            return;
        }

        if (log.topic_0 == ESG_INCIDENT_DETECTED_TOPIC0) {
            _onIncidentDetected(log);
        }
    }

    function _onScoreUpdated(LogRecord calldata log) internal {
        address protocol = address(uint160(log.topic_1));
        (, , , , uint8 newRating, ) = abi.decode(log.data, (uint8, uint8, uint8, uint8, uint8, uint64));

        uint8 oldRating = hasSeenRating[protocol] ? lastRatingByProtocol[protocol] : newRating;
        PolicyAction action = _evaluateAction(oldRating, newRating, false);

        hasSeenRating[protocol] = true;
        lastRatingByProtocol[protocol] = newRating;

        emit PolicyEvaluated(protocol, log.tx_hash, action, Rating(oldRating), Rating(newRating), false);

        if (action != PolicyAction.HOLD) {
            _emitPolicyCallback(protocol, action, oldRating, newRating, false, log.tx_hash);
        }
    }

    function _onIncidentDetected(LogRecord calldata log) internal {
        address protocol = address(uint160(log.topic_1));
        (bool severe, , , ) = abi.decode(log.data, (bool, string, string, uint64));
        if (!severe) return;

        uint8 currentRating = hasSeenRating[protocol] ? lastRatingByProtocol[protocol] : uint8(Rating.BBB);

        emit PolicyEvaluated(
            protocol,
            log.tx_hash,
            PolicyAction.EXIT,
            Rating(currentRating),
            Rating(currentRating),
            true
        );

        _emitPolicyCallback(
            protocol,
            PolicyAction.EXIT,
            currentRating,
            currentRating,
            true,
            log.tx_hash
        );
    }

    function _evaluateAction(
        uint8 oldRating,
        uint8 newRating,
        bool severeIncident
    ) internal pure returns (PolicyAction) {
        if (severeIncident) return PolicyAction.EXIT;
        if (newRating <= uint8(Rating.BB)) return PolicyAction.EXIT;
        if (oldRating >= uint8(Rating.A) && newRating == uint8(Rating.BBB)) return PolicyAction.REDUCE;
        if (oldRating < uint8(Rating.AA) && newRating >= uint8(Rating.AA)) return PolicyAction.INCREASE;
        return PolicyAction.HOLD;
    }

    function _emitPolicyCallback(
        address protocol,
        PolicyAction action,
        uint8 oldRating,
        uint8 newRating,
        bool severeIncident,
        uint256 sourceTxHash
    ) internal {
        emit Callback(
            callbackChainId,
            callbackTarget,
            callbackGasLimit,
            abi.encodeWithSelector(
                IEsgPolicyCallback.onPolicySignal.selector,
                address(0), // overwritten by Reactive Callback Proxy
                protocol,
                uint8(action),
                oldRating,
                newRating,
                severeIncident,
                sourceTxHash
            )
        );
    }
}
