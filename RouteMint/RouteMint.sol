// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

abstract contract ReentrancyGuard {
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    uint256 private _status = _NOT_ENTERED;

    modifier nonReentrant() {
        require(_status != _ENTERED, "Reentrancy");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
}

contract RouteMint is ReentrancyGuard {
    enum QuestionStatus {
        Open,
        Closed
    }

    enum QuestionCategory {
        Study,
        Career,
        Startup
    }

    struct Question {
        address asker;
        string title;
        QuestionCategory category;
        string questionCID;
        uint256 stakeAmount;
        uint256 rewardPool;
        uint256 totalWeight;
        uint256 answerCount;
        QuestionStatus status;
        uint64 createdAt;
    }

    struct Answer {
        address responder;
        string answerCID;
        string experienceTag;
        uint8 rating;
    }

    uint256 public nextQuestionId;

    mapping(uint256 => Question) public questions;
    mapping(uint256 => Answer[]) public answersByQuestion;
    mapping(uint256 => mapping(address => bool)) public hasAnswered;
    mapping(address => uint256) public reputation;

    mapping(uint256 => mapping(address => uint256)) private answerIndexByResponder;

    event QuestionCreated(
        uint256 indexed questionId,
        address indexed asker,
        string title,
        QuestionCategory category,
        string questionCID,
        uint256 stakeAmount,
        uint256 rewardPool
    );
    event AnswerSubmitted(
        uint256 indexed questionId,
        address indexed responder,
        string answerCID,
        string experienceTag
    );
    event AnswerRated(
        uint256 indexed questionId,
        address indexed responder,
        uint8 rating,
        uint256 weight
    );
    event RewardDistributed(
        uint256 indexed questionId,
        address indexed responder,
        uint256 amount,
        uint8 rating,
        uint256 weight
    );
    event StakeRefunded(
        uint256 indexed questionId,
        address indexed asker,
        uint256 stakeAmount,
        uint256 returnedRewardAmount
    );
    event QuestionClosed(
        uint256 indexed questionId,
        address indexed asker,
        uint256 totalRewardDistributed,
        uint256 askerRefund
    );
    event ReputationUpdated(
        uint256 indexed questionId,
        address indexed responder,
        uint256 delta,
        uint256 newReputation
    );

    function createQuestion(
        string calldata title,
        QuestionCategory category,
        string calldata questionCID,
        uint256 stakeAmount,
        uint256 rewardPool
    ) external payable returns (uint256 questionId) {
        require(bytes(title).length > 0, "Title is empty");
        require(bytes(questionCID).length > 0, "Question CID is empty");
        require(stakeAmount > 0, "Stake is zero");
        require(rewardPool > 0, "Reward pool is zero");
        require(msg.value == stakeAmount + rewardPool, "Incorrect ETH value");

        questionId = ++nextQuestionId;

        questions[questionId] = Question({
            asker: msg.sender,
            title: title,
            category: category,
            questionCID: questionCID,
            stakeAmount: stakeAmount,
            rewardPool: rewardPool,
            totalWeight: 0,
            answerCount: 0,
            status: QuestionStatus.Open,
            createdAt: uint64(block.timestamp)
        });

        emit QuestionCreated(
            questionId,
            msg.sender,
            title,
            category,
            questionCID,
            stakeAmount,
            rewardPool
        );
    }

    function submitAnswer(
        uint256 questionId,
        string calldata answerCID,
        string calldata experienceTag
    ) external {
        Question storage question = _getOpenQuestion(questionId);

        require(msg.sender != question.asker, "Asker cannot answer");
        require(!hasAnswered[questionId][msg.sender], "Already answered");
        require(bytes(answerCID).length > 0, "Answer CID is empty");
        require(bytes(experienceTag).length > 0, "Experience tag is empty");

        answersByQuestion[questionId].push(
            Answer({
                responder: msg.sender,
                answerCID: answerCID,
                experienceTag: experienceTag,
                rating: 0
            })
        );

        hasAnswered[questionId][msg.sender] = true;
        question.answerCount += 1;
        answerIndexByResponder[questionId][msg.sender] = question.answerCount;

        emit AnswerSubmitted(questionId, msg.sender, answerCID, experienceTag);
    }

    function rateAnswer(uint256 questionId, address responder, uint8 rating) external {
        Question storage question = _getOpenQuestion(questionId);
        require(msg.sender == question.asker, "Only asker can rate");

        uint256 encodedIndex = answerIndexByResponder[questionId][responder];
        require(encodedIndex != 0, "Answer not found");

        Answer storage answer = answersByQuestion[questionId][encodedIndex - 1];
        require(answer.rating == 0, "Answer already rated");

        uint256 weight = rewardWeightOf(rating);

        answer.rating = rating;
        question.totalWeight += weight;

        emit AnswerRated(questionId, responder, rating, weight);
    }

    function closeQuestion(uint256 questionId) external nonReentrant {
        Question storage question = _getQuestion(questionId);
        require(msg.sender == question.asker, "Only asker can close");
        require(question.status == QuestionStatus.Open, "Question is closed");

        question.status = QuestionStatus.Closed;

        uint256 totalRewardDistributed;
        uint256 answersLength = answersByQuestion[questionId].length;

        if (question.totalWeight != 0) {
            for (uint256 i = 0; i < answersLength; ) {
                Answer storage answer = answersByQuestion[questionId][i];
                uint256 weight = _rewardWeightOrZero(answer.rating);

                if (weight != 0) {
                    uint256 reward = (question.rewardPool * weight) / question.totalWeight;
                    totalRewardDistributed += reward;

                    _sendETH(answer.responder, reward);

                    emit RewardDistributed(questionId, answer.responder, reward, answer.rating, weight);

                    reputation[answer.responder] += weight;
                    emit ReputationUpdated(
                        questionId,
                        answer.responder,
                        weight,
                        reputation[answer.responder]
                    );
                }

                unchecked {
                    ++i;
                }
            }
        }

        uint256 returnedRewardAmount = question.rewardPool - totalRewardDistributed;
        uint256 askerRefund = question.stakeAmount + returnedRewardAmount;

        _sendETH(question.asker, askerRefund);

        emit StakeRefunded(questionId, question.asker, question.stakeAmount, returnedRewardAmount);
        emit QuestionClosed(questionId, question.asker, totalRewardDistributed, askerRefund);
    }

    function rewardWeightOf(uint8 rating) public pure returns (uint256) {
        if (rating == 1) {
            return 1;
        }
        if (rating == 2) {
            return 2;
        }
        if (rating == 3) {
            return 4;
        }

        revert("Invalid rating");
    }

    function getQuestion(uint256 questionId) external view returns (Question memory) {
        return _getQuestion(questionId);
    }

    function getAnswers(uint256 questionId) external view returns (Answer[] memory) {
        _requireQuestionExists(questionId);
        return answersByQuestion[questionId];
    }

    function getAnswer(uint256 questionId, address responder) external view returns (Answer memory) {
        _requireQuestionExists(questionId);

        uint256 encodedIndex = answerIndexByResponder[questionId][responder];
        require(encodedIndex != 0, "Answer not found");

        return answersByQuestion[questionId][encodedIndex - 1];
    }

    function _rewardWeightOrZero(uint8 rating) internal pure returns (uint256) {
        if (rating == 0) {
            return 0;
        }

        return rewardWeightOf(rating);
    }

    function _getOpenQuestion(uint256 questionId) internal view returns (Question storage question) {
        question = _getQuestion(questionId);
        require(question.status == QuestionStatus.Open, "Question is closed");
    }

    function _getQuestion(uint256 questionId) internal view returns (Question storage question) {
        question = questions[questionId];
        _requireQuestionExists(questionId);
    }

    function _requireQuestionExists(uint256 questionId) internal view {
        require(questions[questionId].asker != address(0), "Question not found");
    }

    function _sendETH(address recipient, uint256 amount) internal {
        if (amount == 0) {
            return;
        }

        (bool success, ) = payable(recipient).call{value: amount}("");
        require(success, "ETH transfer failed");
    }
}
