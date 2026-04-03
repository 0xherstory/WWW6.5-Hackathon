const hre = require("hardhat");

const EXHIBITIONS = [
  {
    title: "她们的链上记忆",
    tags: ["历史档案", "证言记录"],
    submissionType: "evidence",
    submissionTitle: "社区讨论截屏归档",
    submissionDescription: "整理了一次关键讨论的过程与时间线，作为永久存证。",
  },
  {
    title: "数字花园计划",
    tags: ["二创作品", "其他"],
    submissionType: "creation",
    submissionTitle: "花园里的回声",
    submissionDescription: "一段为女性创作者写的短诗与配图概念稿。",
  },
  {
    title: "被忽略的发布现场",
    tags: ["证言记录", "历史档案"],
    submissionType: "evidence",
    submissionTitle: "发布会旁听记录",
    submissionDescription: "记录一次公开活动现场发生过的发言与反馈。",
  },
  {
    title: "她们也在写代码",
    tags: ["二创作品", "其他"],
    submissionType: "creation",
    submissionTitle: "写给开源维护者",
    submissionDescription: "送给 Web3 女性开发者的一篇短文。",
  },
  {
    title: "证言拼贴实验",
    tags: ["证言记录", "二创作品"],
    submissionType: "creation",
    submissionTitle: "片段与注脚",
    submissionDescription: "将公开证言重新编排成一组图文实验。",
  },
];

async function parseEvent(receipt, contract, eventName) {
  return receipt.logs
    .map((log) => {
      try {
        return contract.interface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find((event) => event && event.name === eventName);
}

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error("CONTRACT_ADDRESS is required in the environment");
  }

  const [signer] = await hre.ethers.getSigners();
  const contract = await hre.ethers.getContractAt("HerGallery", contractAddress, signer);

  console.log(`Using signer: ${signer.address}`);
  console.log(`Seeding contract: ${contractAddress}`);

  for (let index = 0; index < EXHIBITIONS.length; index += 1) {
    const item = EXHIBITIONS[index];
    const stamp = `${Date.now()}-${index}`;

    const createTx = await contract.createExhibition(
      `${item.title} ${index + 1}`,
      `QmSeedExhibition${stamp}`,
      "",
      item.tags,
      { value: hre.ethers.parseEther("0.001") }
    );
    const createReceipt = await createTx.wait();
    const createdEvent = await parseEvent(createReceipt, contract, "ExhibitionCreated");
    const exhibitionId = Number(createdEvent.args.id);

    const submitTx = await contract.submitToExhibition(
      exhibitionId,
      item.submissionType,
      `QmSeedSubmission${stamp}`,
      item.submissionTitle,
      item.submissionDescription
    );
    const submitReceipt = await submitTx.wait();
    const submissionEvent = await parseEvent(submitReceipt, contract, "SubmissionCreated");
    const submissionId = Number(submissionEvent.args.id);

    await (await contract.approveSubmission(submissionId)).wait();

    if (index < 3) {
      await (await contract.recommend(exhibitionId, submissionId)).wait();
    }

    if (index < 2) {
      await (await contract.witness(submissionId)).wait();
    }

    if (index % 2 === 0) {
      await (await contract.tipExhibition(exhibitionId, { value: hre.ethers.parseEther("0.001") })).wait();
    }

    console.log(
      `Seeded exhibition #${exhibitionId} with submission #${submissionId} (${item.submissionType})`
    );
  }

  console.log("Seed complete.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
