package com.web3.herstory.urbanflora.entity.vo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PlantVO {

    private Long id;
    private Long tokenId;
    private String name;
    private String location;
    private String owner;
    private String imageUrl;
    private LocalDateTime createdAt;

    // 👉 自定义字段
    private boolean isMine;
}