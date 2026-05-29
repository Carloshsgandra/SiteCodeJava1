package com.javaduolingo;

import com.javaduolingo.repository.ExerciseRepository;
import com.javaduolingo.repository.ModuleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;

@SpringBootApplication
@RequiredArgsConstructor
@Slf4j
public class JavaDuolingoApplication {

    private final ModuleRepository moduleRepository;
    private final ExerciseRepository exerciseRepository;

    public static void main(String[] args) {
        SpringApplication.run(JavaDuolingoApplication.class, args);
    }

    @EventListener(ApplicationReadyEvent.class)
    public void verifySeeding() {
        long modules = moduleRepository.count();
        long exercises = exerciseRepository.count();
        log.info("=== JavaDuolingo Ready === Modules: {} | Exercises: {}", modules, exercises);
        if (modules == 0 || exercises == 0) {
            log.error("DATABASE SEEDING FAILED — modules={} exercises={}", modules, exercises);
        }
    }
}
