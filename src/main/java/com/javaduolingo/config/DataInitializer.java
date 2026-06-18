package com.javaduolingo.config;

import com.javaduolingo.model.User;
import com.javaduolingo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.findByUsername("admin").isEmpty()) {
            userRepository.save(User.builder()
                    .username("admin")
                    .email("admin@javaduolingo.local")
                    .password("588327")
                    .role("ROLE_USER")
                    .build());
            System.out.println("[DataInitializer] Usuário admin criado.");
        }
    }
}
