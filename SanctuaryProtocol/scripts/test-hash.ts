// 测试哈希生成
import { keccak256, toBytes, stringToBytes } from "viem";

// 模拟 CID
const cid = "QmPQdnbo7SwdUk64ZTancEf8yz9jcs9STXmTPfrQKKquJt";

console.log("CID:", cid);
console.log("CID 长度:", cid.length);

// 方法1: toBytes(cid) - 可能有问题
const bytes1 = toBytes(cid);
console.log("\n方法1 - toBytes(cid):");
console.log("  字节长度:", bytes1.length);
console.log("  字节:", bytes1);

const hash1 = keccak256(bytes1);
console.log("  哈希:", hash1);
console.log("  哈希长度:", hash1.length);

// 方法2: stringToBytes(cid)
const bytes2 = stringToBytes(cid);
console.log("\n方法2 - stringToBytes(cid):");
console.log("  字节长度:", bytes2.length);
console.log("  字节:", bytes2);

const hash2 = keccak256(bytes2);
console.log("  哈希:", hash2);
console.log("  哈希长度:", hash2.length);

// 方法3: 直接使用 keccak256
const hash3 = keccak256(stringToBytes(cid));
console.log("\n方法3 - keccak256(stringToBytes(cid)):");
console.log("  哈希:", hash3);

// 检查 bytes32 格式
console.log("\n检查 bytes32 格式:");
console.log("  期望长度: 66 (0x + 64个十六进制字符)");
console.log("  实际长度:", hash1.length);
