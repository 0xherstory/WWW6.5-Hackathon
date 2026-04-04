package com.web3.herstory.urbanflora.config;

public class WalletContext {

    private static final ThreadLocal<String> WALLET_HOLDER = new ThreadLocal<>();

    public static void setWallet(String wallet) {
        WALLET_HOLDER.set(wallet);
    }

    public static String getWallet() {
        return WALLET_HOLDER.get();
    }

    public static void clear() {
        WALLET_HOLDER.remove(); // 防止内存泄漏
    }
}
