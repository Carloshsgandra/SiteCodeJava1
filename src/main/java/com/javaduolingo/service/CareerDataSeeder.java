package com.javaduolingo.service;

import com.javaduolingo.repository.GuidedProjectRepository;
import com.javaduolingo.repository.InterviewQuestionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.support.EncodedResource;
import org.springframework.jdbc.datasource.init.ScriptUtils;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;

@Service
@RequiredArgsConstructor
@Slf4j
public class CareerDataSeeder {

    private final GuidedProjectRepository projectRepository;
    private final InterviewQuestionRepository interviewRepository;
    private final DataSource dataSource;

    @EventListener(ApplicationReadyEvent.class)
    @Order(2)
    public void seed() {
        boolean needsProjects = projectRepository.count() == 0;
        boolean needsInterview = interviewRepository.count() == 0;

        if (!needsProjects && !needsInterview) {
            log.info("Career data already seeded — skipping.");
            return;
        }

        log.info("Seeding career data from career_data.sql...");
        try (Connection conn = dataSource.getConnection()) {
            EncodedResource resource = new EncodedResource(
                    new ClassPathResource("career_data.sql"), StandardCharsets.UTF_8);
            ScriptUtils.executeSqlScript(
                    conn, resource,
                    true, false,
                    ScriptUtils.DEFAULT_COMMENT_PREFIX,
                    ScriptUtils.DEFAULT_STATEMENT_SEPARATOR,
                    ScriptUtils.DEFAULT_BLOCK_COMMENT_START_DELIMITER,
                    ScriptUtils.DEFAULT_BLOCK_COMMENT_END_DELIMITER);
            log.info("Career data seeded. Projects: {}, Interview questions: {}",
                    projectRepository.count(), interviewRepository.count());
        } catch (Exception e) {
            log.error("Career data seeding failed: {}", e.getMessage(), e);
        }
    }
}
