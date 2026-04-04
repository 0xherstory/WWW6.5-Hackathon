package com.web3.herstory.urbanflora.service;

import com.web3.herstory.urbanflora.entity.Record;
import com.web3.herstory.urbanflora.entity.dto.RecordCreateDTO;

import java.util.List;

public interface RecordService {

    Record createRecord(RecordCreateDTO record);

    List<Record> getRecordsByPlantId(Long plantId);
}