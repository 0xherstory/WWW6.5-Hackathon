package com.web3.herstory.urbanflora.entity.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PlantCreateDTO {

    private Long tokenId;

    @NotBlank(message = "植物名称不能为空")
    private String name;

    @NotBlank(message = "植物位置不能为空")
    private String location;

    @NotBlank(message = "图片URL不能为空")
    private String imageUrl;
}