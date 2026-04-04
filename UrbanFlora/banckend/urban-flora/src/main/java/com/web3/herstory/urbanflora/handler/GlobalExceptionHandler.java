package com.web3.herstory.urbanflora.handler;

import com.web3.herstory.urbanflora.exception.BusinessException;
import com.web3.herstory.urbanflora.exception.WalletNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 处理业务异常
    @ExceptionHandler(BusinessException.class)
    public Result<?> handleBusiness(BusinessException e) {
        return Result.error(Result.BUSINESS_ERROR, e.getMessage());
    }

    @ExceptionHandler(WalletNotFoundException.class)
    public Result<?> handleWalletNoFound(WalletNotFoundException e) {
        return Result.error(Result.PARAM_ERROR, e.getMessage());
    }

    // 处理参数异常
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<?> handleValidationException(MethodArgumentNotValidException e) {
        String msg = e.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                .collect(Collectors.joining("; "));
        return Result.error(Result.PARAM_ERROR, msg);
    }

    // 处理所有未知异常
    @ExceptionHandler(Exception.class)
    public Result<?> handleException(Exception e) {
        // 打印日志（很重要）
        log.error("系统异常", e);
        return Result.error("系统异常，请稍后再试");
    }
}