package com.web3.herstory.urbanflora.controller;

import com.web3.herstory.urbanflora.config.WalletContext;
import com.web3.herstory.urbanflora.entity.dto.PlantCreateDTO;
import com.web3.herstory.urbanflora.entity.vo.PlantVO;
import com.web3.herstory.urbanflora.handler.Result;
import com.web3.herstory.urbanflora.service.PlantService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/plants")
public class PlantController {

    @Autowired
    private PlantService plantService;

    @PostMapping("/create")
    public Result<PlantVO> create(@RequestBody @Valid PlantCreateDTO plant) {
        String walletAddress = WalletContext.getWallet();
        PlantVO plantVO = plantService.createPlant(plant, walletAddress);
        return Result.success(plantVO);
    }

    @GetMapping("/list")
    public Result<List<PlantVO>> list() {
        String walletAddress = WalletContext.getWallet();
        List<PlantVO> plantVOS = plantService.getPlants(walletAddress);
        return Result.success(plantVOS);
    }
}