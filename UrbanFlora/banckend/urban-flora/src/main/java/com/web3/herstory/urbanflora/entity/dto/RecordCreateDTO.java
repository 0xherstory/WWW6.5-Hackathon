package com.web3.herstory.urbanflora.entity.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RecordCreateDTO {

    private Long plantId;

    @NotBlank(message = "植物状态不能为空")
    private String stage;

    private String description;

    private String imageUrl;
}
