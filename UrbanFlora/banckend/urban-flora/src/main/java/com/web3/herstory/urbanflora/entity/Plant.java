package com.web3.herstory.urbanflora.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("plants")
public class Plant {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long tokenId;
    private String name;
    private String location;
    private String owner;
    private String imageUrl;

    private LocalDateTime createdAt;
}
