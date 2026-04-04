const hre = require("hardhat");

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error("CONTRACT_ADDRESS is required in the environment");
  }

  const [signer] = await hre.ethers.getSigners();
  const contract = await hre.ethers.getContractAt("HerGallery", contractAddress, signer);
  const timestamp = Date.now();

  console.log(`Using signer: ${signer.address}`);
  console.log(`Verifying contract: ${contractAddress}`);

  const createTx = await contract.createExhibition(
    `MVP Smoke ${timestamp}`,
    `QmSmokeExhibition${timestamp}`,
    "",
    ["测试验证", "MVP"],
    { value: hre.ethers.parseEther("0.001") }
  );
  const createReceipt = await createTx.wait();
  const createEvent = createReceipt.logs
    .map((log) => {
      try {
        return contract.interface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find((event) => event && event.name === "ExhibitionCreated");

  const exhibitionId = Number(createEvent.args.id);
  console.log(`Created exhibition #${exhibitionId}`);

  const submitTx = await contract.submitToExhibition(
    exhibitionId,
    "evidence",
    `QmSmokeSubmission${timestamp}`,
    `Smoke Submission ${timestamp}`,
    "Automated Fuji verification flow"
  );
  const submitReceipt = await submitTx.wait();
  const submitEvent = submitReceipt.logs
    .map((log) => {
      try {
        return contract.interface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find((event) => event && event.name === "SubmissionCreated");

  const submissionId = Number(submitEvent.args.id);
  console.log(`Submitted work #${submissionId}`);

  await (await contract.approveSubmission(submissionId)).wait();
  console.log("Approved submission");

  await (await contract.recommend(exhibitionId, submissionId)).wait();
  console.log("Recommended submission");

  await (await contract.witness(submissionId)).wait();
  console.log("Witnessed submission");

  await (await contract.tipExhibition(exhibitionId, { value: hre.ethers.parseEther("0.001") })).wait();
  console.log("Tipped exhibition");

  const exhibition = await contract.getExhibition(exhibitionId);
  const submission = await contract.getSubmission(submissionId);

  console.log("--- Final State ---");
  console.log(
    JSON.stringify(
      {
        exhibitionId,
        submissionId,
        title: exhibition.title,
        submissionCount: Number(exhibition.submissionCount),
        tipPoolWei: exhibition.tipPool.toString(),
        submissionStatus: Number(submission.status),
        recommendCount: Number(submission.recommendCount),
        witnessCount: Number(submission.witnessCount),
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
