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
        // Se já foi configurado manualmente, não sobrescreve
        if (env("SPRING_DATASOURCE_URL") != null) {
            log("Usando SPRING_DATASOURCE_URL definido manualmente.");
            return;
        }

        // 1. Tenta DATABASE_URL (Railway: postgres://user:pass@host:port/db)
        String rawUrl = env("DATABASE_URL");
        if (rawUrl != null && !rawUrl.isBlank()) {
            try {
                String normalized = rawUrl.replaceFirst("^postgres://", "postgresql://");
                URI uri = new URI(normalized);
                String host = uri.getHost();
                int port = uri.getPort() > 0 ? uri.getPort() : 5432;
                String db = uri.getPath().replaceFirst("^/", "");
                String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + "/" + db;
                String[] info = uri.getUserInfo() != null ? uri.getUserInfo().split(":", 2) : new String[]{"postgres", ""};
                apply(environment, jdbcUrl, info[0], info.length > 1 ? info[1] : "", "DATABASE_URL");
                return;
            } catch (Exception e) {
                log("Falha ao parsear DATABASE_URL: " + e.getMessage());
            }
        }

        // 2. Tenta PGHOST / PGPORT / PGDATABASE / PGUSER / PGPASSWORD
        String pgHost = env("PGHOST");
        if (pgHost != null && !pgHost.isBlank()) {
            String jdbcUrl = "jdbc:postgresql://" + pgHost + ":" + env("PGPORT", "5432")
                    + "/" + env("PGDATABASE", "railway");
            apply(environment, jdbcUrl, env("PGUSER", "postgres"), env("PGPASSWORD", ""), "PGHOST vars");
            return;
        }

        // 3. Tenta RAILWAY_TCP_PROXY_DOMAIN (outro formato que Railway às vezes usa)
        String tcpDomain = env("RAILWAY_TCP_PROXY_DOMAIN");
        String tcpPort   = env("RAILWAY_TCP_PROXY_PORT");
        if (tcpDomain != null && !tcpDomain.isBlank() && tcpPort != null) {
            String jdbcUrl = "jdbc:postgresql://" + tcpDomain + ":" + tcpPort
                    + "/" + env("PGDATABASE", "railway");
            apply(environment, jdbcUrl, env("PGUSER", "postgres"), env("PGPASSWORD", ""), "RAILWAY_TCP_PROXY vars");
            return;
        }

        log("Nenhuma variavel PostgreSQL encontrada — usando fallback H2. Defina DATABASE_URL ou PGHOST no Railway.");
    }

    // Lê do SO diretamente — mais confiável que environment.getProperty() no boot early stage
    private static String env(String key) {
        String v = System.getenv(key);
        return (v != null && !v.isBlank()) ? v : null;
    }

    private static String env(String key, String defaultVal) {
        String v = env(key);
        return v != null ? v : defaultVal;
    }

    private void apply(ConfigurableEnvironment environment, String jdbcUrl, String user, String pass, String source) {
        Map<String, Object> props = new HashMap<>();
        props.put("spring.datasource.url",               jdbcUrl);
        props.put("spring.datasource.username",           user);
        props.put("spring.datasource.password",           pass);
        props.put("spring.datasource.driver-class-name", "org.postgresql.Driver");
        props.put("spring.jpa.database-platform",        "org.hibernate.dialect.PostgreSQLDialect");
        environment.getPropertySources().addFirst(new MapPropertySource("railway-db", props));
        log("PostgreSQL configurado via " + source + " -> " + jdbcUrl.replaceAll(":[^@/]+@", ":***@"));
    }

    private static void log(String msg) {
        System.out.println("[DB-CONFIG] " + msg);
    }
}
