package com.javaduolingo.service;

import com.javaduolingo.repository.ModuleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
@Slf4j
public class DatabaseSeeder {

    private final ModuleRepository moduleRepository;
    private final JdbcTemplate jdbcTemplate;

    @EventListener(ApplicationReadyEvent.class)
    @Order(1)
    @Transactional
    public void seed() {
        if (moduleRepository.count() > 0) {
            log.info("Database already seeded — skipping.");
            return;
        }

        log.info("Seeding database from data.sql...");
        try {
            ClassPathResource resource = new ClassPathResource("data.sql");
            String sql = new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);

            int count = 0;
            for (String raw : sql.split(";")) {
                String stmt = raw.replaceAll("(?m)^\\s*--[^\n]*\n?", "").trim();
                if (!stmt.isEmpty()) {
                    try {
                        jdbcTemplate.execute(stmt);
                        count++;
                    } catch (Exception e) {
                        log.warn("Seed statement skipped: {}", e.getMessage());
                    }
                }
            }
            log.info("Database seeded — {} statements executed.", count);
        } catch (IOException e) {
            log.error("Failed to read data.sql: {}", e.getMessage());
        }
    }
}
