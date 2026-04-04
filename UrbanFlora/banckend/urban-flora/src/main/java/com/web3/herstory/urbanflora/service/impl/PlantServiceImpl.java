package com.web3.herstory.urbanflora.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.web3.herstory.urbanflora.entity.Plant;
import com.web3.herstory.urbanflora.entity.dto.PlantCreateDTO;
import com.web3.herstory.urbanflora.entity.vo.PlantVO;
import com.web3.herstory.urbanflora.exception.BusinessException;
import com.web3.herstory.urbanflora.mapper.PlantMapper;
import com.web3.herstory.urbanflora.service.PlantService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PlantServiceImpl implements PlantService {

    @Autowired
    private PlantMapper plantMapper;

    public PlantVO createPlant(PlantCreateDTO dto, String owner) {
        Long tokenId = dto.getTokenId();
        if (tokenId == null) {
            throw new BusinessException("tokenId不能为空");
        }
        QueryWrapper<Plant> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("token_id", dto.getTokenId());
        Plant queryPlant = plantMapper.selectOne(queryWrapper);
        if (queryPlant != null) {
            throw new BusinessException("已经插入相同的tokenId，请勿重复插入");
        }

        Plant plant = new Plant();
        BeanUtils.copyProperties(dto, plant); // 复制属性
        plant.setOwner(owner);
        plant.setCreatedAt(LocalDateTime.now());

        plantMapper.insert(plant);

        PlantVO vo = new PlantVO();
        BeanUtils.copyProperties(plant, vo);
        vo.setMine(true); // 自己创建的
        return vo;
    }

    @Override
    public List<PlantVO> getPlants(String currentUser) {
        List<Plant> plants = plantMapper.selectList(null);

        return plants.stream().map(p -> {
            PlantVO vo = new PlantVO();
            BeanUtils.copyProperties(p, vo);

            //核心逻辑
            vo.setMine(currentUser != null && currentUser.equalsIgnoreCase(p.getOwner()));

            return vo;
        }).collect(Collectors.toList());
    }

    @Override
    public Plant getById(Long id) {
        if (id == null) {
            throw new BusinessException("植物ID不能为空");
        }
        Plant plant = plantMapper.selectById(id);
        if (plant == null) {
            throw new BusinessException("记录对应的植物不存在");
        }
        return plant;
    }
}