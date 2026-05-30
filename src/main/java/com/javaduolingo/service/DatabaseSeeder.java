package com.javaduolingo.service;

import com.javaduolingo.repository.ExerciseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ScriptUtils;
import org.springframework.jdbc.datasource.init.EncodedResource;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;

@Service
@RequiredArgsConstructor
@Slf4j
public class DatabaseSeeder {

    private final ExerciseRepository exerciseRepository;
    private final DataSource dataSource;

    @EventListener(ApplicationReadyEvent.class)
    @Order(1)
    public void seed() {
        if (exerciseRepository.count() > 0) {
            log.info("Database already seeded — skipping.");
            return;
        }

        log.info("Seeding database from data.sql...");
        try (Connection conn = dataSource.getConnection()) {
            EncodedResource resource = new EncodedResource(
                    new ClassPathResource("data.sql"), StandardCharsets.UTF_8);
            ScriptUtils.executeSqlScript(
                    conn, resource,
                    true,  // continueOnError: ignora duplicatas de runs anteriores
                    false, // ignoreFailedDrops
                    ScriptUtils.DEFAULT_COMMENT_PREFIX,
                    ScriptUtils.DEFAULT_STATEMENT_SEPARATOR,
                    ScriptUtils.DEFAULT_BLOCK_COMMENT_START_DELIMITER,
                    ScriptUtils.DEFAULT_BLOCK_COMMENT_END_DELIMITER);
            log.info("Database seeded successfully. Exercises: {}", exerciseRepository.count());
        } catch (Exception e) {
            log.error("Database seeding failed: {}", e.getMessage(), e);
        }
    }
}
