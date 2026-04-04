package com.web3.herstory.urbanflora.config;

import com.web3.herstory.urbanflora.exception.WalletNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class WalletInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) {
        String wallet = request.getHeader("X-Wallet-Address");

        if (wallet == null || wallet.isBlank()) {
            throw new WalletNotFoundException(); // 钱包为空直接抛异常
        }

        WalletContext.setWallet(wallet); // 放到 ThreadLocal

        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request,
                                HttpServletResponse response,
                                Object handler, Exception ex) {
        WalletContext.clear(); // 请求结束清理
    }
}