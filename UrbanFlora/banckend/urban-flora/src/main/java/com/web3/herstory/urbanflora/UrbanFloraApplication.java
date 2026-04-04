package com.web3.herstory.urbanflora;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@MapperScan("com.web3.herstory.urbanflora.mapper")
@SpringBootApplication
public class UrbanFloraApplication {

    public static void main(String[] args) {
        SpringApplication.run(UrbanFloraApplication.class, args);
    }

}
