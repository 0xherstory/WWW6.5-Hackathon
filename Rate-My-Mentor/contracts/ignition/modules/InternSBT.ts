import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const InternSBTModule = buildModule("InternSBTModule", (m) => {
  const trustedBackend = m.getParameter(
    "trustedBackend",
    "0x70D01ddFe5BFD1030282368a9f7F10087750f5a3"    // 把这里换成你的 MetaMask 钱包地址
  );

  const internSBT = m.contract("InternSBT", [trustedBackend]);

  return { internSBT };
});

export default InternSBTModule;