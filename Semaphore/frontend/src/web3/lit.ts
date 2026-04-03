import {
  LitAccessControlConditionResource,
  createSiweMessage,
  generateAuthSig,
} from "@lit-protocol/auth-helpers";
import { decryptFromJson, encryptToJson } from "@lit-protocol/encryption";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { type WalletClient } from "viem";

import { getEncryptedSignalContent, type EncryptedSignalJsonPayload } from "./contentStore";
import { resolveSemaphoreProtocolAddress } from "./deployment";

const LIT_CHAIN = "fuji";
const DEFAULT_LIT_NETWORK = "datil-dev";
const SIGNAL_CONTENT_VERSION = 1;
const ACCESS_CONTROL_DECRYPTION_ABILITY = "access-control-condition-decryption";

type SupportedLitNetwork = "datil-dev" | "datil-test" | "datil" | "custom";
type ResourceAbilityRequest = {
  ability: string;
  resource: LitAccessControlConditionResource;
};

let litClientPromise: Promise<LitNodeClient> | null = null;

function getLitNetworkValue(): SupportedLitNetwork {
  const configuredNetwork = import.meta.env.VITE_LIT_NETWORK?.trim();

  if (
    configuredNetwork === "datil-dev" ||
    configuredNetwork === "datil-test" ||
    configuredNetwork === "datil" ||
    configuredNetwork === "custom"
  ) {
    return configuredNetwork;
  }

  return DEFAULT_LIT_NETWORK;
}

function getWalletAccount(walletClient: WalletClient) {
  const account = walletClient.account;

  if (!account) {
    throw new Error("当前没有可用的钱包账户，请重新连接钱包。");
  }

  return account;
}

async function getLitClient() {
  if (!litClientPromise) {
    litClientPromise = (async () => {
      const litClient = new LitNodeClient({
        litNetwork: getLitNetworkValue(),
      });

      await litClient.connect();
      return litClient;
    })();
  }

  return litClientPromise;
}

async function getSessionSigs(
  walletClient: WalletClient,
  resourceAbilityRequests: ResourceAbilityRequest[],
) {
  const litNodeClient = await getLitClient();
  const account = getWalletAccount(walletClient);
  const expiration = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  return litNodeClient.getSessionSigs({
    authNeededCallback: async ({
      expiration,
      nonce,
      uri,
    }) => {
      const toSign = await createSiweMessage({
        chainId: 43113,
        domain: window.location.host,
        expiration: expiration ?? new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        nonce,
        uri: uri ?? window.location.origin,
        walletAddress: account.address,
      });

      return generateAuthSig({
        signer: {
          signMessage: async (message: string) =>
            walletClient.signMessage({
              account,
              message,
            }),
        },
        address: account.address,
        toSign,
      });
    },
    chain: LIT_CHAIN,
    expiration,
    resourceAbilityRequests: resourceAbilityRequests as never,
  });
}

async function buildSignalAccessControlConditions(signalId: string, authorAddress: string) {
  const protocolAddress = await resolveSemaphoreProtocolAddress();

  return [
    {
      chain: LIT_CHAIN,
      conditionType: "evmBasic" as const,
      contractAddress: "",
      method: "",
      parameters: [":userAddress"],
      returnValueTest: {
        comparator: "=",
        value: authorAddress,
      },
      standardContractType: "",
    },
    {
      operator: "or",
    },
    {
      chain: LIT_CHAIN,
      conditionType: "evmContract" as const,
      contractAddress: protocolAddress,
      functionAbi: {
        inputs: [
          {
            internalType: "uint256",
            name: "signalId",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "reader",
            type: "address",
          },
        ],
        name: "hasActiveAccess",
        outputs: [
          {
            internalType: "bool",
            name: "",
            type: "bool",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      functionName: "hasActiveAccess",
      functionParams: [signalId, ":userAddress"],
      returnValueTest: {
        comparator: "=",
        key: "",
        value: "true",
      },
    },
  ];
}

async function buildResourceAbilityRequests(
  payload: EncryptedSignalJsonPayload,
): Promise<ResourceAbilityRequest[]> {
  if (!payload.unifiedAccessControlConditions) {
    throw new Error("缺少 Lit 解密条件，请重新生成这条信号。");
  }

  const resourceString = await LitAccessControlConditionResource.generateResourceString(
    payload.unifiedAccessControlConditions as never,
    payload.dataToEncryptHash,
  );

  return [
    {
      ability: ACCESS_CONTROL_DECRYPTION_ABILITY,
      resource: new LitAccessControlConditionResource(resourceString),
    },
  ];
}

export async function encryptSignalContent(
  params: {
    authorAddress: string;
    contentHtml: string;
    signalId: string;
  },
) {
  const litNodeClient = await getLitClient();
  const unifiedAccessControlConditions = await buildSignalAccessControlConditions(
    params.signalId,
    params.authorAddress,
  );
  const encryptedJson = await encryptToJson({
    chain: LIT_CHAIN,
    litNodeClient,
    string: JSON.stringify({
      contentHtml: params.contentHtml,
      version: SIGNAL_CONTENT_VERSION,
    }),
    unifiedAccessControlConditions,
  });

  const parsedPayload = JSON.parse(encryptedJson) as EncryptedSignalJsonPayload;

  if (parsedPayload.dataType !== "string") {
    throw new Error("Lit 加密结果格式异常，请重试。");
  }

  return parsedPayload;
}

export async function decryptSignalContent(
  walletClient: WalletClient,
  params: {
    encryptedCid: string;
  },
) {
  const encryptedDocument = await getEncryptedSignalContent(params.encryptedCid);

  if (!encryptedDocument || encryptedDocument.kind !== "signal-private-encrypted") {
    throw new Error("还没有找到这条信号的加密正文。");
  }

  const litNodeClient = await getLitClient();
  const resourceAbilityRequests = await buildResourceAbilityRequests(encryptedDocument.payload);
  const sessionSigs = await getSessionSigs(walletClient, resourceAbilityRequests);
  const decrypted = await decryptFromJson({
    litNodeClient,
    parsedJsonData: encryptedDocument.payload,
    sessionSigs,
  });

  if (typeof decrypted !== "string") {
    throw new Error("解密结果格式异常。");
  }

  const parsedPayload = JSON.parse(decrypted) as {
    contentHtml?: string;
    version?: number;
  };

  if (!parsedPayload.contentHtml) {
    throw new Error("正文内容为空，无法显示。");
  }

  return parsedPayload.contentHtml;
}
