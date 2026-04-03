import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { avalancheFuji } from "wagmi/chains";

const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "demo-placeholder";

export const wagmiConfig = getDefaultConfig({
  appName: "Rate My Mentor",
  projectId,
  chains: [avalancheFuji],
  ssr: false,
});



// import { getDefaultConfig } from "@rainbow-me/rainbowkit";
// import { mainnet, sepolia, avalancheFuji } from "wagmi/chains";

// const projectId =
//   process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "demo-placeholder";

// export const wagmiConfig = getDefaultConfig({
//   appName: "Rate My Mentor",
//   projectId,
//   chains: [mainnet, sepolia, avalancheFuji],
//   ssr: true,
// });

// // 处理网络超时 - 防止应用崩溃 (同时支持 SSR 和客户端)
// const originalFetch = globalThis.fetch;
// globalThis.fetch = ((...args) => {
//   const controller = new AbortController();
//   const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
  
//   return originalFetch.apply(globalThis, args as any)
//     .then((response) => {
//       clearTimeout(timeoutId);
//       return response;
//     })
//     .catch((error: any) => {
//       clearTimeout(timeoutId);
//       // 识别各种超时错误
//       const isTimeout = 
//         error?.code === "UND_ERR_CONNECT_TIMEOUT" ||
//         error?.code === "ETIMEDOUT" ||
//         error?.cause?.code === "UND_ERR_CONNECT_TIMEOUT" ||
//         error?.message?.includes("timeout") ||
//         error?.message?.includes("ETIMEDOUT");
      
//       if (isTimeout) {
//         console.warn("[Network] Request timeout - using fallback");
//         // 返回空响应，让应用继续运行
//         return new Response(JSON.stringify({ status: "offline" }), { 
//           status: 200,
//           headers: { "Content-Type": "application/json" }
//         });
//       }
//       throw error;
//     });
// }) as typeof fetch;
