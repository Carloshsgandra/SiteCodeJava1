package com.javaduolingo.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

/**
 * Converte DATABASE_URL do Railway (postgres://user:pass@host:port/db)
 * para as propriedades JDBC que o Spring Boot entende.
 * Só age se DATABASE_URL estiver presente e SPRING_DATASOURCE_URL não estiver definido.
 */
public class RailwayEnvironmentPostProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String rawUrl = environment.getProperty("DATABASE_URL");
        if (rawUrl == null || rawUrl.isBlank()) return;

        // Se o usuário já definiu SPRING_DATASOURCE_URL manualmente, não sobrescreve
        if (environment.getProperty("SPRING_DATASOURCE_URL") != null) return;

        try {
            // Railway pode usar postgres:// ou postgresql://
            String normalized = rawUrl
                    .replaceFirst("^postgres://", "postgresql://");

            URI uri = new URI(normalized);
            String host = uri.getHost();
            int port = uri.getPort() > 0 ? uri.getPort() : 5432;
            String db   = uri.getPath().replaceFirst("^/", "");

            // Sem forçar sslmode — driver usa "prefer" por padrão (tenta SSL, cai em plain se não disponível)
            String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + "/" + db;

            String[] userInfo = uri.getUserInfo() != null
                    ? uri.getUserInfo().split(":", 2)
                    : new String[]{"postgres", ""};
            String username = userInfo[0];
            String password = userInfo.length > 1 ? userInfo[1] : "";

            Map<String, Object> props = new HashMap<>();
            props.put("spring.datasource.url",               jdbcUrl);
            props.put("spring.datasource.username",           username);
            props.put("spring.datasource.password",           password);
            props.put("spring.datasource.driver-class-name", "org.postgresql.Driver");
            props.put("spring.jpa.database-platform",        "org.hibernate.dialect.PostgreSQLDialect");

            environment.getPropertySources()
                    .addFirst(new MapPropertySource("railway-database-config", props));

        } catch (Exception e) {
            // Falha silenciosa — cai no fallback H2
        }
    }
}
