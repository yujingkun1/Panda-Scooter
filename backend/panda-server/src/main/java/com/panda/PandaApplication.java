package com.panda;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@MapperScan("com.panda.mapper")
@SpringBootApplication(scanBasePackages = "com.panda")
public class PandaApplication {

    public static void main(String[] args) {
        SpringApplication.run(PandaApplication.class, args);
    }
}
