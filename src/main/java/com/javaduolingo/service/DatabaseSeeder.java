package com.javaduolingo.service;

import com.javaduolingo.repository.ModuleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ScriptUtils;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;

@Service
@RequiredArgsConstructor
@Slf4j
public class DatabaseSeeder {

    private final ModuleRepository moduleRepository;
    private final DataSource dataSource;

    @EventListener(ApplicationReadyEvent.class)
    @Order(1)
    public void seed() {
        if (moduleRepository.count() > 0) {
            log.info("Database already seeded — skipping.");
            return;
        }

        log.info("Seeding database from data.sql...");
        try (Connection conn = dataSource.getConnection()) {
            ScriptUtils.executeSqlScript(conn, new ClassPathResource("data.sql"));
            log.info("Database seeded successfully.");
        } catch (Exception e) {
            log.error("Database seeding failed: {}", e.getMessage(), e);
        }
    }
}
