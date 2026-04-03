// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// LinguPet — 语言学习链上宠物
// 用户记录学习 → 宠物成长 → 成熟后铸造NFT
// NFT = 不可篡改的学习证明

contract LinguPet is ERC721, Ownable {

    enum Stage { Egg, Baby, Teenager, Adult }

    struct Pet {
        uint256 xp;
        Stage stage;
        string language;
        uint256 totalMinutes;
        uint256 lastStudyDay;
        uint256 dailyMinutes;
        bool minted;
    }

    mapping(address => Pet) public pets;
    mapping(address => bool) public hasPet;
    uint256 private _tokenIdCounter = 1;

    uint256 public constant XP_BABY = 100;
    uint256 public constant XP_TEENAGER = 300;
    uint256 public constant XP_ADULT = 600;
    uint256 public constant DAILY_CAP = 120;

    event PetCreated(address indexed owner, string language);
    event StudyLogged(address indexed owner, string language, uint256 studyMinutes, uint256 totalXp);
    event PetEvolved(address indexed owner, Stage newStage);
    event PetMinted(address indexed owner, uint256 tokenId);

    // 构造函数：传给 Ownable 最新版本初始 owner
    constructor() ERC721("LinguPet", "LPET") Ownable(msg.sender) {}

    // 创建宠物
    function createPet(string calldata language) external {
        require(!hasPet[msg.sender], "Already have a pet");
        require(bytes(language).length > 0, "Language required");

        pets[msg.sender] = Pet({
            xp: 0,
            stage: Stage.Egg,
            language: language,
            totalMinutes: 0,
            lastStudyDay: 0,
            dailyMinutes: 0,
            minted: false
        });

        hasPet[msg.sender] = true;
        emit PetCreated(msg.sender, language);
    }

    // 记录学习
    function logStudy(uint256 studyMinutes) external {
        require(hasPet[msg.sender], "Create a pet first");
        require(studyMinutes > 0 && studyMinutes <= 120, "1-120 minutes only");

        Pet storage pet = pets[msg.sender];
        require(!pet.minted, "Pet already minted");

        uint256 today = block.timestamp / 86400;
        if (pet.lastStudyDay != today) {
            pet.dailyMinutes = 0;
            pet.lastStudyDay = today;
        }

        require(pet.dailyMinutes + studyMinutes <= DAILY_CAP, "Daily cap reached (120 min)");

        pet.dailyMinutes += studyMinutes;
        pet.totalMinutes += studyMinutes;
        pet.xp += studyMinutes;

        _checkEvolution(msg.sender);
        emit StudyLogged(msg.sender, pet.language, studyMinutes, pet.xp);
    }

    // 内部：检查成长阶段
    function _checkEvolution(address owner) internal {
        Pet storage pet = pets[owner];
        Stage prev = pet.stage;

        if (pet.xp >= XP_ADULT && pet.stage < Stage.Adult) {
            pet.stage = Stage.Adult;
        } else if (pet.xp >= XP_TEENAGER && pet.stage < Stage.Teenager) {
            pet.stage = Stage.Teenager;
        } else if (pet.xp >= XP_BABY && pet.stage < Stage.Baby) {
            pet.stage = Stage.Baby;
        }

        if (pet.stage != prev) {
            emit PetEvolved(owner, pet.stage);
        }
    }

    // 铸造 NFT
    function mintPetNFT() external returns (uint256) {
        Pet storage pet = pets[msg.sender];
        require(pet.stage == Stage.Adult, "Pet not adult yet");
        require(!pet.minted, "Already minted");

        pet.minted = true;
        uint256 tokenId = _tokenIdCounter++;
        _safeMint(msg.sender, tokenId);
        emit PetMinted(msg.sender, tokenId);

        return tokenId;
    }

    // 查询宠物状态
    function getPet(address owner) external view returns (
        uint256 xp,
        Stage stage,
        string memory language,
        uint256 totalMinutes,
        bool minted
    ) {
        Pet storage pet = pets[owner];
        return (pet.xp, pet.stage, pet.language, pet.totalMinutes, pet.minted);
    }
}