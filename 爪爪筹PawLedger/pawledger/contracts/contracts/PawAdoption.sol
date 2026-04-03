pragma solidity ^0.8.20;

contract PawAdoption {
    address public owner;

    struct PetAdoption {
        uint256 petId;
        address publisher;
        string petName;
        string breed;
        uint256 age;
        string description;
        string imageUrl;
        bool isAdopted;
        uint256 totalApplyCount;
    }

    struct AdopterRealName {
        bool isVerified;
        string nameHash;
        string idCardHash;
        string phoneHash;
        uint256 registerTime;
    }

    struct AdoptionApply {
        uint256 applyId;
        uint256 petId;
        address adopter;
        string applyMessage;
        uint256 applyTime;
        uint8 status;
    }

    mapping(uint256 => PetAdoption) public petAdoptions;
    uint256 public petTotalCount;

    mapping(address => AdopterRealName) public adopterRealNames;

    mapping(uint256 => AdoptionApply) public adoptionApplies;
    mapping(uint256 => uint256[]) public petApplyList;
    uint256 public applyTotalCount;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can operate");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function publishPetAdoption(
        string memory _petName,
        string memory _breed,
        uint256 _age,
        string memory _description,
        string memory _imageUrl
    ) external {
        uint256 newPetId = petTotalCount + 1;
        petAdoptions[newPetId] = PetAdoption({
            petId: newPetId,
            publisher: msg.sender,
            petName: _petName,
            breed: _breed,
            age: _age,
            description: _description,
            imageUrl: _imageUrl,
            isAdopted: false,
            totalApplyCount: 0
        });
        petTotalCount = newPetId;
    }

    function adopterRealNameRegister(
        string memory _nameHash,
        string memory _idCardHash,
        string memory _phoneHash
    ) external {
        adopterRealNames[msg.sender] = AdopterRealName({
            isVerified: true,
            nameHash: _nameHash,
            idCardHash: _idCardHash,
            phoneHash: _phoneHash,
            registerTime: block.timestamp
        });
    }

    function submitAdoptionApply(
        uint256 _petId,
        string memory _applyMessage
    ) external {
        require(_petId > 0 && _petId <= petTotalCount, "Pet does not exist");
        require(!petAdoptions[_petId].isAdopted, "Pet has been adopted");
        require(adopterRealNames[msg.sender].isVerified, "Please complete real name registration first");

        uint256 newApplyId = applyTotalCount + 1;
        adoptionApplies[newApplyId] = AdoptionApply({
            applyId: newApplyId,
            petId: _petId,
            adopter: msg.sender,
            applyMessage: _applyMessage,
            applyTime: block.timestamp,
            status: 0
        });
        petApplyList[_petId].push(newApplyId);
        petAdoptions[_petId].totalApplyCount++;
        applyTotalCount = newApplyId;
    }

    function auditAdoptionApply(
        uint256 _applyId,
        bool _isPass
    ) external {
        require(_applyId > 0 && _applyId <= applyTotalCount, "Application does not exist");
        require(adoptionApplies[_applyId].status == 0, "Application has been audited");
        uint256 petId = adoptionApplies[_applyId].petId;
        require(petAdoptions[petId].publisher == msg.sender, "Only publisher can audit");

        if (_isPass) {
            adoptionApplies[_applyId].status = 1;
            petAdoptions[petId].isAdopted = true;
        } else {
            adoptionApplies[_applyId].status = 2;
        }
    }

    function verifyAdopterRealName(
        address _adopter,
        string memory _nameHash,
        string memory _idCardHash,
        string memory _phoneHash
    ) external view returns (bool) {
        AdopterRealName memory realNameInfo = adopterRealNames[_adopter];
        return keccak256(abi.encodePacked(realNameInfo.nameHash)) == keccak256(abi.encodePacked(_nameHash))
            && keccak256(abi.encodePacked(realNameInfo.idCardHash)) == keccak256(abi.encodePacked(_idCardHash))
            && keccak256(abi.encodePacked(realNameInfo.phoneHash)) == keccak256(abi.encodePacked(_phoneHash));
    }

    function getPetApplyList(uint256 _petId) external view returns (uint256[] memory) {
        return petApplyList[_petId];
    }
}
