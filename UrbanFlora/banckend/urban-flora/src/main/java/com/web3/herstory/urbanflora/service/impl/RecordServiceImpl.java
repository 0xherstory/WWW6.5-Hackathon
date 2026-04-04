package com.web3.herstory.urbanflora.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.web3.herstory.urbanflora.entity.Record;
import com.web3.herstory.urbanflora.entity.dto.RecordCreateDTO;
import com.web3.herstory.urbanflora.mapper.RecordMapper;
import com.web3.herstory.urbanflora.service.PlantService;
import com.web3.herstory.urbanflora.service.RecordService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RecordServiceImpl implements RecordService {

    @Autowired
    private PlantService plantService;
    @Autowired
    private RecordMapper recordMapper;

    @Override
    public Record createRecord(RecordCreateDTO recordCreateDTO) {
        Long plantId = recordCreateDTO.getPlantId();
        plantService.getById(plantId);

        Record record = new Record();
        BeanUtils.copyProperties(recordCreateDTO, record);
        record.setCreatedAt(LocalDateTime.now());
        recordMapper.insert(record);
        return record;
    }

    @Override
    public List<Record> getRecordsByPlantId(Long plantId) {
        //校验植物是否存在
        plantService.getById(plantId);

        QueryWrapper<Record> wrapper = new QueryWrapper<>();
        wrapper.eq("plant_id", plantId)
                .orderByAsc("created_at");

        return recordMapper.selectList(wrapper);
    }
}