import PinataSDK from '@pinata/sdk';
import { getIpfsEnv } from './env';

let _pinataClient: PinataSDK | null = null;

/**
 * 获取 Pinata Client（懒加载 + 单例）
 * - 只有在真正调用 IPFS 功能时才校验环境变量
 * - 全项目复用同一个实例
 */
export function getPinataClient(): PinataSDK {
  if (_pinataClient) return _pinataClient;

  const { PINATA_API_KEY, PINATA_API_SECRET } = getIpfsEnv();

  _pinataClient = new PinataSDK({
    pinataApiKey: PINATA_API_KEY,
    pinataSecretApiKey: PINATA_API_SECRET,
  });

  return _pinataClient;
}



//import PinataSDK from '@pinata/sdk';
//import { env } from './env';

// 初始化Pinata IPFS客户端，用于上传/读取评价内容
//export const pinataClient = new PinataSDK({
//  pinataApiKey: env.PINATA_API_KEY,
//  pinataSecretApiKey: env.PINATA_API_SECRET,
//});

//G的修改建议：
//第一，不建议直接用福安版本，因为它会在模块加载时就依赖 env.PINATA_API_KEY 和 env.PINATA_API_SECRET。
//  这和你们现在“服务先启动、功能按需校验”的总体策略不一致。你可能暂时不测 IPFS，但它也会提前绑死。
//第二，不建议原样照搬易为版本，因为它走的是 requireEnv()，而你们现在已经把 env.ts 升级成了按模块分组的配置层。
//  既然已经有 getIpfsEnv()，这里就应该统一从配置层取，别再绕回去手动传 key 名字。
