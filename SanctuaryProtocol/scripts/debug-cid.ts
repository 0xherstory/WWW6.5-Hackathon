// 调试 CID 格式
import { keccak256, toBytes, stringToBytes } from "viem";

// 模拟前端生成的 CID
const cid = "QmPQdnbo7SwdUk64ZTancEf8yz9jcs9STXmTPfrQKKquJt";

console.log("CID:", cid);
console.log("CID 长度:", cid.length);

// 前端使用的方法
const bytes = toBytes(cid);
const hash = keccak256(bytes);

console.log("\n前端生成的 journalHash:", hash);
console.log("长度:", hash.length);

// 检查是否符合 bytes32 格式
const hexPart = hash.slice(2); // 去掉 0x
console.log("十六进制部分长度:", hexPart.length);
console.log("是否符合 bytes32:", hexPart.length === 64);

// 模拟合约中的检查
console.log("\n合约检查:");
console.log("  journalHash != bytes32(0):", hash !== "0x0000000000000000000000000000000000000000000000000000000000000000");

// 检查字节数组
console.log("\n字节数组:");
console.log("  长度:", bytes.length);
console.log("  内容:", Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(''));
