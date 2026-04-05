// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../src/ProveToken.sol";
import "../src/HerLemmaCredential.sol";
import "../src/STEMIndex.sol";
import "../src/ExplanationManager.sol";

interface Vm {
    function envUint(string calldata key) external returns (uint256);
    function envAddress(string calldata key) external returns (address);
    function envString(string calldata key) external returns (string memory);
    function addr(uint256 privateKey) external returns (address);
    function startBroadcast(uint256 privateKey) external;
    function stopBroadcast() external;
}

abstract contract Script {
    Vm internal constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));
}

contract DeployHerLemma is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address treasury = vm.envAddress("TREASURY");
        string memory badgeBaseURI = vm.envString("BADGE_BASE_URI");
        address deployer = vm.addr(deployerKey);

        vm.startBroadcast(deployerKey);

        ProveToken proveToken = new ProveToken(deployer);
        HerLemmaCredential credential = new HerLemmaCredential(deployer, "HerLemma Credential", "HLC");
        STEMIndex stemIndex = new STEMIndex(deployer);
        ExplanationManager manager = new ExplanationManager(
            deployer,
            treasury,
            proveToken,
            credential,
            stemIndex
        );

        proveToken.setMinter(address(manager), true);
        credential.setMinter(address(manager), true);
        stemIndex.setManager(address(manager));

        credential.defineBadge(1, "First Voice", string.concat(badgeBaseURI, "first-voice.json"));
        credential.defineBadge(2, "First Earning", string.concat(badgeBaseURI, "first-earning.json"));
        credential.defineBadge(3, "Math Translator", string.concat(badgeBaseURI, "math-translator.json"));
        credential.defineBadge(4, "Trusted Reviewer", string.concat(badgeBaseURI, "trusted-reviewer.json"));
        credential.defineBadge(5, "Viral Explainer", string.concat(badgeBaseURI, "viral-explainer.json"));
        credential.defineBadge(6, "Brand Pick", string.concat(badgeBaseURI, "brand-pick.json"));

        vm.stopBroadcast();
    }
}
