package com.web3.herstory.urbanflora.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("records")
public class Record {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long plantId;
    private String stage;
    private String description;
    private String imageUrl;

    private LocalDateTime createdAt;
}