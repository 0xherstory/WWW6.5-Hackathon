import PinataSDK from '@pinata/sdk';
import { requireEnv } from './env';

let _pinataClient: PinataSDK | null = null;

// 懒加载：调用 IPFS 功能时才校验 Pinata 配置
export function getPinataClient(): PinataSDK {
  if (_pinataClient) return _pinataClient;
  const { PINATA_API_KEY, PINATA_API_SECRET } = requireEnv([
    'PINATA_API_KEY',
    'PINATA_API_SECRET',
  ] as const);
  _pinataClient = new PinataSDK({
    pinataApiKey: PINATA_API_KEY,
    pinataSecretApiKey: PINATA_API_SECRET,
  });
  return _pinataClient;
}