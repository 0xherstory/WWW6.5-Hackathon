package com.web3.herstory.urbanflora.exception;

public class WalletNotFoundException extends RuntimeException {
    public WalletNotFoundException() {
        super("钱包地址不能为空");
    }
}