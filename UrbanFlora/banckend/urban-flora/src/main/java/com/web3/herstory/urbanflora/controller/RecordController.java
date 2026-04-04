package com.web3.herstory.urbanflora.controller;

import com.web3.herstory.urbanflora.entity.Record;
import com.web3.herstory.urbanflora.entity.dto.RecordCreateDTO;
import com.web3.herstory.urbanflora.handler.Result;
import com.web3.herstory.urbanflora.service.RecordService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/records")
public class RecordController {

    @Autowired
    private RecordService recordService;

    @PostMapping("/create")
    public Result<Record> create(@RequestBody @Valid RecordCreateDTO record) {
        return Result.success(recordService.createRecord(record));
    }

    @GetMapping("/list")
    public Result<List<Record>> list(@RequestParam Long plantId) {
        return Result.success(recordService.getRecordsByPlantId(plantId));
    }
}