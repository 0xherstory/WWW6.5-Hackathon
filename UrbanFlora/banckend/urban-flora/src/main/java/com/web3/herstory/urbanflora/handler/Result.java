package com.web3.herstory.urbanflora.handler;

import lombok.Data;

@Data
public class Result<T> {

    public static final int SUCCESS = 0;
    public static final int BUSINESS_ERROR = 3;
    public static final int PARAM_ERROR = 2;
    public static final int SYSTEM_ERROR = 1;

    private int code;       // 状态码
    private String message; // 状态描述
    private T data;         // 返回数据

    // 成功
    public static <T> Result<T> success(T data) {
        Result<T> result = new Result<>();
        result.setCode(SUCCESS);
        result.setMessage("success");
        result.setData(data);
        return result;
    }

    // 失败
    public static <T> Result<T> error(String message) {
        Result<T> result = new Result<>();
        result.setCode(SYSTEM_ERROR);
        result.setMessage(message);
        result.setData(null);
        return result;
    }

    // 自定义错误码
    public static <T> Result<T> error(int code, String message) {
        Result<T> result = new Result<>();
        result.setCode(code);
        result.setMessage(message);
        result.setData(null);
        return result;
    }
}
