import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();

    // 1. 部署合约（signer = deployer 自己）
    const Factory = await ethers.getContractFactory("MoodRealmStamp");
    const contract = await Factory.deploy(deployer.address);
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    console.log("合约地址:", contractAddress);
    console.log("平台签名地址:", deployer.address);

    // 2. 准备参数
    const planet    = "迷雾星球";
    const stampName = "测试印记";
    const tokenURI  = "ipfs://test";
    // dataHash = keccak256 of 本地私密数据
    const dataHash  = ethers.keccak256(ethers.toUtf8Bytes("personId-001|有点|还没有|1700000000"));
    const nonce     = 0n;

    // 3. 生成 EIP-712 签名
    const domain = {
        name:              "MoodRealmStamp",
        version:           "1",
        chainId:           (await ethers.provider.getNetwork()).chainId,
        verifyingContract: contractAddress,
    };
    const types = {
        MintRequest: [
            { name: "to",        type: "address" },
            { name: "planet",    type: "string"  },
            { name: "stampName", type: "string"  },
            { name: "dataHash",  type: "bytes32" },
            { name: "tokenURI",  type: "string"  },
            { name: "nonce",     type: "uint256" },
        ],
    };
    const value = { to: deployer.address, planet, stampName, dataHash, tokenURI, nonce };
    const signature = await deployer.signTypedData(domain, types, value);

    console.log("\n=== 生成的参数 ===");
    console.log("dataHash: ", dataHash);
    console.log("signature:", signature);

    // 4. 调用 mintStamp
    const tx = await contract.mintStamp(planet, stampName, dataHash, tokenURI, signature);
    await tx.wait();
    console.log("\n✅ mintStamp 成功！txHash:", tx.hash);

    // 5. 验证链上记录
    const record = await contract.stampRecords(0);
    console.log("\n=== 链上记录 (tokenId=0) ===");
    console.log("planet:   ", record.planet);
    console.log("stampName:", record.stampName);
    console.log("dataHash: ", record.dataHash);
    console.log("mintedAt: ", new Date(Number(record.mintedAt) * 1000).toLocaleString("zh-CN"));

    // 6. 验证 dataHash（隐私承诺验证）
    const isValid = await contract.verifyDataHash(0, dataHash);
    console.log("\n✅ verifyDataHash:", isValid, "(true = 本地数据与链上承诺一致)");

    // 7. 查询用户持有的 token
    const tokens = await contract.tokensOfOwner(deployer.address);
    console.log("tokensOfOwner:", tokens.map(t => t.toString()));
}

main().catch(err => { console.error(err); process.exit(1); });
