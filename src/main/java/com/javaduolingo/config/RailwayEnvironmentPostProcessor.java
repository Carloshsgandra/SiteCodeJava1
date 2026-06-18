package com.javaduolingo.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

public class RailwayEnvironmentPostProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        if (environment.getProperty("SPRING_DATASOURCE_URL") != null) {
            System.out.println("[DB-CONFIG] Usando SPRING_DATASOURCE_URL definido manualmente.");
            return;
        }

        // Tenta DATABASE_URL primeiro (formato postgres://user:pass@host:port/db)
        String rawUrl = environment.getProperty("DATABASE_URL");
        if (rawUrl != null && !rawUrl.isBlank()) {
            try {
                String normalized = rawUrl.replaceFirst("^postgres://", "postgresql://");
                URI uri = new URI(normalized);
                String host = uri.getHost();
                int port = uri.getPort() > 0 ? uri.getPort() : 5432;
                String db = uri.getPath().replaceFirst("^/", "");
                String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + "/" + db;
                String[] userInfo = uri.getUserInfo() != null
                        ? uri.getUserInfo().split(":", 2)
                        : new String[]{"postgres", ""};
                String username = userInfo[0];
                String password = userInfo.length > 1 ? userInfo[1] : "";
                applyPostgres(environment, jdbcUrl, username, password, "DATABASE_URL");
                return;
            } catch (Exception e) {
                System.out.println("[DB-CONFIG] Falha ao parsear DATABASE_URL: " + e.getMessage());
            }
        }

        // Fallback: variáveis individuais PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSWORD
        String pgHost = environment.getProperty("PGHOST");
        if (pgHost != null && !pgHost.isBlank()) {
            String pgPort = environment.getProperty("PGPORT", "5432");
            String pgDb   = environment.getProperty("PGDATABASE", "railway");
            String pgUser = environment.getProperty("PGUSER", "postgres");
            String pgPass = environment.getProperty("PGPASSWORD", "");
            String jdbcUrl = "jdbc:postgresql://" + pgHost + ":" + pgPort + "/" + pgDb;
            applyPostgres(environment, jdbcUrl, pgUser, pgPass, "PGHOST vars");
            return;
        }

        System.out.println("[DB-CONFIG] Nenhuma variável de banco PostgreSQL encontrada — usando fallback H2.");
    }

    private void applyPostgres(ConfigurableEnvironment env, String jdbcUrl, String username, String password, String source) {
        Map<String, Object> props = new HashMap<>();
        props.put("spring.datasource.url",               jdbcUrl);
        props.put("spring.datasource.username",           username);
        props.put("spring.datasource.password",           password);
        props.put("spring.datasource.driver-class-name", "org.postgresql.Driver");
        props.put("spring.jpa.database-platform",        "org.hibernate.dialect.PostgreSQLDialect");
        env.getPropertySources().addFirst(new MapPropertySource("railway-database-config", props));
        System.out.println("[DB-CONFIG] PostgreSQL configurado via " + source + " -> " +
                jdbcUrl.replaceAll(":[^@/]+@", ":***@"));
    }
}
