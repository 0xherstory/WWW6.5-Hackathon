package com.web3.herstory.urbanflora.service;

import com.web3.herstory.urbanflora.entity.Plant;
import com.web3.herstory.urbanflora.entity.dto.PlantCreateDTO;
import com.web3.herstory.urbanflora.entity.vo.PlantVO;

import java.util.List;

public interface PlantService {

    PlantVO createPlant(PlantCreateDTO plant, String owner);

    List<PlantVO> getPlants(String currentUser);

    Plant getById(Long id);
}
