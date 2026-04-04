// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

interface IHerTimeReputation {
    function getAvgScore(address member) external view returns (uint256);
    function getServiceCount(address member, uint8 tag) external view returns (uint256);
    function getTotalServiceCount(address member) external view returns (uint256);
}

/// @title HerTime Skill NFT
/// @notice Soulbound ERC-721，根据链上服务记录自动 mint 的技能徽章，不可转让
contract HerTimeSkillNFT is ERC721, AccessControl {
    bytes32 public constant REPUTATION_ROLE = keccak256("REPUTATION_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // ServiceTag 枚举（与 HerTimeService 保持一致）
    // 0=LIFE_SUPPORT, 1=EMOTIONAL_SUPPORT, 2=SKILL_SHARING, 3=KNOWLEDGE, 4=CREATIVE

    enum SkillType {
        LISTENER,           // 倾听者：情感支持 5 次，均分 >= 4.5
        MEDICAL_COMPANION,  // 就医陪伴：生活支持 3 次
        CHILDCARE_BUDDY,    // 育儿伙伴：生活支持 5 次，均分 >= 4.0
        SKILL_MENTOR,       // 技能导师：技能服务 8 次，均分 >= 4.5
        COMMUNITY_GUARDIAN, // 社区守护者：累计服务 >= 50 次
        CRISIS_SUPPORTER    // 危机支持者：管理员手动授予
    }

    IHerTimeReputation public reputation;

    // 记录每个成员持有的技能 NFT
    mapping(address => mapping(SkillType => bool)) public hasSkill;
    mapping(address => mapping(SkillType => uint256)) public tokenIdOf;

    uint256 private _tokenIdCounter;

    event SkillMinted(address indexed member, SkillType indexed skill, uint256 tokenId);

    constructor() ERC721("HerTime Skill Badge", "HTSB") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    function setReputation(address _reputation) external onlyRole(DEFAULT_ADMIN_ROLE) {
        reputation = IHerTimeReputation(_reputation);
    }

    /// @notice Soulbound：禁止转让（OZ v5 使用 _update override）
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);
        // from == address(0) 表示 mint，允许；否则禁止转让
        require(from == address(0), "Soulbound: non-transferable");
        return super._update(to, tokenId, auth);
    }

    /// @notice 声誉合约评分更新后调用，检查是否达到 mint 条件
    function checkAndMint(address _member) external onlyRole(REPUTATION_ROLE) {
        _checkListener(_member);
        _checkMedicalCompanion(_member);
        _checkChildcareBuddy(_member);
        _checkSkillMentor(_member);
        _checkCommunityGuardian(_member);
    }

    function _checkListener(address _member) internal {
        if (hasSkill[_member][SkillType.LISTENER]) return;
        uint256 count = reputation.getServiceCount(_member, 1); // EMOTIONAL_SUPPORT = 1
        uint256 avg = reputation.getAvgScore(_member);
        if (count >= 5 && avg >= 450) {
            _mintSkill(_member, SkillType.LISTENER);
        }
    }

    function _checkMedicalCompanion(address _member) internal {
        if (hasSkill[_member][SkillType.MEDICAL_COMPANION]) return;
        uint256 count = reputation.getServiceCount(_member, 0); // LIFE_SUPPORT = 0
        if (count >= 3) {
            _mintSkill(_member, SkillType.MEDICAL_COMPANION);
        }
    }

    function _checkChildcareBuddy(address _member) internal {
        if (hasSkill[_member][SkillType.CHILDCARE_BUDDY]) return;
        uint256 count = reputation.getServiceCount(_member, 0); // LIFE_SUPPORT = 0
        uint256 avg = reputation.getAvgScore(_member);
        if (count >= 5 && avg >= 400) {
            _mintSkill(_member, SkillType.CHILDCARE_BUDDY);
        }
    }

    function _checkSkillMentor(address _member) internal {
        if (hasSkill[_member][SkillType.SKILL_MENTOR]) return;
        uint256 count = reputation.getServiceCount(_member, 2); // SKILL_SHARING = 2
        uint256 avg = reputation.getAvgScore(_member);
        if (count >= 8 && avg >= 450) {
            _mintSkill(_member, SkillType.SKILL_MENTOR);
        }
    }

    function _checkCommunityGuardian(address _member) internal {
        if (hasSkill[_member][SkillType.COMMUNITY_GUARDIAN]) return;
        uint256 total = reputation.getTotalServiceCount(_member);
        if (total >= 50) {
            _mintSkill(_member, SkillType.COMMUNITY_GUARDIAN);
        }
    }

    /// @notice 危机支持者：管理员手动授予
    function grantCrisisSupporter(address _member) external onlyRole(ADMIN_ROLE) {
        if (!hasSkill[_member][SkillType.CRISIS_SUPPORTER]) {
            _mintSkill(_member, SkillType.CRISIS_SUPPORTER);
        }
    }

    function _mintSkill(address _member, SkillType _skill) internal {
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;
        _safeMint(_member, tokenId);
        hasSkill[_member][_skill] = true;
        tokenIdOf[_member][_skill] = tokenId;
        emit SkillMinted(_member, _skill, tokenId);
    }

    /// @notice 查询成员持有的所有技能（返回 bool[6] 数组）
    function getSkills(address _member) external view returns (bool[6] memory skills) {
        for (uint8 i = 0; i < 6; i++) {
            skills[i] = hasSkill[_member][SkillType(i)];
        }
    }

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
