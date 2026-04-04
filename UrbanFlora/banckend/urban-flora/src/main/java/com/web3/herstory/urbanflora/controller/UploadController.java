package com.web3.herstory.urbanflora.controller;

import com.web3.herstory.urbanflora.handler.Result;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;

@RestController
@RequestMapping("/upload")
public class UploadController {

    @PostMapping
    public Result<String> upload(@RequestParam("file") MultipartFile file) throws IOException {

        // 使用项目运行目录
        String uploadDir = System.getProperty("user.dir") + "/uploads/";

        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();

        File dest = new File(uploadDir + fileName);

        System.out.println("保存路径: " + dest.getAbsolutePath());

        file.transferTo(dest);

        return Result.success("http://localhost:8080/uploads/" + fileName);
    }
}
