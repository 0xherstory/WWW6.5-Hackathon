import { ethers } from "ethers";

// ============================================================
//  合约地址 — Avalanche Fuji 测试网 (chainId: 43113)
// ============================================================

export const ADDRESSES = {
  catRegistry:   "0x00eeC3763FAaA03A8d758C87E623Fb30318198bf",
  catNFT:        "0xe0C9746BE2f5b09B130f21677E396Ced226372d9",
  adoptionVault: "0x42b4E7784Daed2Ef06d9fC14D89Ee1d76454d08C",
  donationVault: "0x809FDA8D72823E6781A9aCbfCb7eb2193B2b2E7f",
  purrToken:     "0xE9F6089908CC054dF4095f227566F0b3696279B1",
  equipmentNFT:  "0xE909bEe5bf2675967D720D586Dc749460163B149",
  gameContract:  "0x5A7425Cd5a5A7Febe1E1AcA81b4B5285005750F0",
} as const;

// ============================================================
//  Fuji 网络参数
// ============================================================

export const FUJI_CHAIN_ID = 43113;

export const FUJI_NETWORK = {
  chainId: "0xA869", // 43113 in hex
  chainName: "Avalanche Fuji C-Chain",
  nativeCurrency: { name: "AVAX", symbol: "AVAX", decimals: 18 },
  rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
  blockExplorerUrls: ["https://testnet.snowtrace.io"],
};

// ============================================================
//  ABI — 只包含前端实际调用的函数
// ============================================================

export const CAT_REGISTRY_ABI = [
  "function catCount() view returns (uint256)",
  "function getCat(uint256 _catId) view returns (tuple(uint256 id, string name, uint8 age, string gender, string description, string[4] stageURIs, address shelter, uint8 status))",
  "function isShelterApproved(address _shelter) view returns (bool)",
  "function registerShelter(string calldata _name, string calldata _location) external",
  "function addCat(string calldata _name, uint8 _age, string calldata _gender, string calldata _description, string[3] calldata _stageURIs) external",
  // 投票审批（新接口，替代旧的 approveShelter）
  "function voteApprove(address _shelter, bool _approve) external",
  // 投票关闭机构
  "function voteClose(address _shelter) external",
  "function getApproveVotes(address _shelter) view returns (uint32 approveCount, uint32 rejectCount, uint256 majority)",
  "function getCloseVotes(address _shelter) view returns (uint32 closeCount, uint256 majority)",
  "function getMyApproveVote(address _shelter, address _voter) view returns (int8)",
  "function adminCount() view returns (uint256)",
  "function getAdminList() view returns (address[])",
  "function updateCatStageURI(uint256 _catId, uint8 _stage, string calldata _uri) external",
  "function updateCatStatus(uint256 _catId, uint8 _status) external",
  "function getCats(uint256 _offset, uint256 _limit) view returns (tuple(uint256 id, string name, uint8 age, string gender, string description, string[4] stageURIs, address shelter, uint8 status)[])",
  "event ShelterRegistered(address indexed shelter, string name, string location)",
  "function shelters(address) view returns (string name, string location, address wallet, uint8 status)",
] as const;

export const CAT_NFT_ABI = [
  "function claimFamilyPortrait() external",
  "function hasClaimedFamilyPortrait(address) view returns (bool)",
  // StarterCat 相关 — 这两个函数在 CatNFT 合约里
  "function hasClaimedStarterCat(address) view returns (bool)",
  "function starterCatOf(address) view returns (uint256)",
  // NFT 查询
  "function getUserCatTokenIds(address _user, uint256 _realCatId) view returns (uint256[3])",
  "function userCatStage(address, uint256) view returns (uint8)",
  "function nftInfo(uint256) view returns (uint8 nftType, uint256 linkedRealCatId, uint8 stage, uint8 season, uint32 seriesId, string tokenURIValue)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function balanceOf(address owner) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  // Collection Series 管理
  "function addCollectionSeries(string calldata _name, string calldata _uri) external returns (uint32)",
  "function setCollectionSeriesActive(uint32 _seriesId, bool _active) external",
  "function seriesCount() view returns (uint32)",
  "function getCollectionSeries(uint32 _seriesId) view returns (string name, string uri, bool active)",
  "function getActiveSeriesIds() view returns (uint32[])",
  // 合约配置（仅 Owner）
  "function setAuthorizedMinter(address _minter, bool _status) external",
] as const;

export const PURR_TOKEN_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function hasClaimedWelcome(address) view returns (bool)",
  "function claimWelcomeTokens(uint256 nftTokenId) external",
  "function buyTokens() external payable",
] as const;

export const DONATION_VAULT_ABI = [
  "function donate(uint256 _realCatId) external payable",
  "function userCatDonation(address, uint256) view returns (uint256)",
  "function remainingToNextMint(address _donor, uint256 _realCatId) view returns (uint256)",
  "function donationStage(address, uint256) view returns (uint8)",
  "function stageThreshold() view returns (uint256)",
] as const;

export const ADOPTION_VAULT_ABI = [
  // 用户操作
  "function applyAdoption(uint256 _catId) external",
  "function payDeposit(uint256 _catId) external payable",
  "function cancelAdoption(uint256 _catId) external",
  "function forceWithdraw(uint256 _catId) external",
  // 机构操作
  "function approveApplication(uint256 _catId) external",
  "function rejectApplication(uint256 _catId) external",
  "function confirmReturn(uint256 _catId, bool _healthy) external",
  // Owner 操作
  "function confirmVisit(uint256 _catId, bool _passed) external",
  // 查询
  "function getApplication(uint256 _catId) view returns (tuple(address applicant, uint256 catId, uint256 depositAmount, uint256 depositTimestamp, uint256 cancelTimestamp, uint8 status))",
  "function adoptionDepositAmount() view returns (uint256)",
  "function remainingLockTime(uint256 _catId) view returns (uint256)",
  "function lockPeriod() view returns (uint256)",
  "function returnConfirmPeriod() view returns (uint256)",
] as const;

export const GAME_CONTRACT_ABI = [
  // 新用户（claimStarterCat 在 GameContract，hasClaimedStarterCat 在 CatNFT）
  "function claimStarterCat(uint256 _realCatId) external",
  // 体力
  "function staminaOf(address player) view returns (uint8)",
  "function buyStamina(uint8 amount) external",
  // 道具库存
  "function foodBalance(address) view returns (uint256)",
  "function canBalance(address) view returns (uint256)",
  "function boosterBalance(address) view returns (uint256)",
  "function materialBalance(address) view returns (uint256)",
  "function gachaTickets(address) view returns (uint256)",
  // 商店购买
  "function buyCatFood(uint256 amount) external",
  "function buyCatCan(uint256 amount) external",
  "function buyBooster(uint256 amount) external",
  // 出猎: duration 0=Short/1=Mid/2=Long, item 0=None/1=Food/2=Can
  "function startHunt(uint256 catTokenId, uint8 duration, uint8 item, bool useBooster) external",
  "function settleHunt(uint256 catTokenId) external",
  "function huntInfo(uint256) view returns (uint8 status, uint8 duration, uint256 departureTime, uint256 effectiveDuration, uint8 item)",
  // 碎片合成 & 抽卡
  "function mergeFragments(uint256 amount) external",
  "function gacha() external",
  // 周券
  "function claimWeeklyTicket(uint256 catTokenId) external",
  "function lastClaimTime(uint256) view returns (uint256)",
  // 装备
  "function equipItem(uint256 catTokenId, uint256 equipTokenId) external",
  "function unequipItem(uint256 catTokenId, uint8 slot) external",
  // 价格查询
  "function foodPrice() view returns (uint256)",
  "function canPrice() view returns (uint256)",
  "function staminaPrice() view returns (uint256)",
  "function boosterPrice() view returns (uint256)",
  // 出猎参数
  "function huntDuration(uint256) view returns (uint256)",
  "function staminaCost(uint256) view returns (uint256)",
  // 游戏配置（仅 Owner/Admin）
  "function addEquipTemplate(uint8 rarity, uint8 slot, string calldata name, string calldata lore, uint16 rarityBonus, uint16 safetyBonus, uint16 carryBonus, uint16 speedBonus) external",
  // 模板读取：public mapping getter，rarity(0-3) => index => EquipTemplate
  "function equipTemplates(uint8 rarity, uint256 index) view returns (uint8 slot, uint8 rarity, string name, string lore, uint16 rarityBonus, uint16 safetyBonus, uint16 carryBonus, uint16 speedBonus)",
] as const;

export const EQUIPMENT_NFT_ABI = [
  "function getCatBonuses(uint256 catTokenId) view returns (uint16 totalRarity, uint16 totalSafety, uint16 totalCarry, uint16 totalSpeed)",
  "function getSlotEquipment(uint256 catTokenId, uint8 slot) view returns (uint256)",
  "function getEquipment(uint256 tokenId) view returns (tuple(uint8 slot, uint8 rarity, string name, string lore, uint16 rarityBonus, uint16 safetyBonus, uint16 carryBonus, uint16 speedBonus))",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function balanceOf(address owner) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  // 合约配置（仅 Owner）
  "function setGameContract(address _gameContract) external",
] as const;

// ============================================================
//  合约实例工厂
//  用法：const c = getContracts(signer)
//        await c.purrToken.balanceOf(addr)
// ============================================================

export function getContracts(signerOrProvider: ethers.Signer | ethers.Provider) {
  return {
    catRegistry:   new ethers.Contract(ADDRESSES.catRegistry,   CAT_REGISTRY_ABI,   signerOrProvider),
    catNFT:        new ethers.Contract(ADDRESSES.catNFT,        CAT_NFT_ABI,        signerOrProvider),
    purrToken:     new ethers.Contract(ADDRESSES.purrToken,     PURR_TOKEN_ABI,     signerOrProvider),
    donationVault: new ethers.Contract(ADDRESSES.donationVault, DONATION_VAULT_ABI, signerOrProvider),
    adoptionVault: new ethers.Contract(ADDRESSES.adoptionVault, ADOPTION_VAULT_ABI, signerOrProvider),
    gameContract:  new ethers.Contract(ADDRESSES.gameContract,  GAME_CONTRACT_ABI,  signerOrProvider),
    equipmentNFT:  new ethers.Contract(ADDRESSES.equipmentNFT,  EQUIPMENT_NFT_ABI,  signerOrProvider),
  };
}

// 只读 provider（不需要钱包，用于展示数据）
export function getReadonlyProvider() {
  return new ethers.JsonRpcProvider("https://api.avax-test.network/ext/bc/C/rpc");
}

export function getReadonlyContracts() {
  return getContracts(getReadonlyProvider());
}
