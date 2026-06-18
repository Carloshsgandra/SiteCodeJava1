package com.javaduolingo.config;

import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DataSourceConfig {

    @Bean
    @Primary
    public DataSource dataSource() {
        // 1. Variáveis individuais do PostgreSQL (PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSWORD)
        String pgHost = genv("PGHOST");
        if (pgHost != null) {
            String url = "jdbc:postgresql://" + pgHost
                    + ":" + genv("PGPORT", "5432")
                    + "/" + genv("PGDATABASE", "railway");
            return pg(url, genv("PGUSER", "postgres"), genv("PGPASSWORD", ""), "PGHOST vars");
        }

        // 2. Tenta DATABASE_URL e SPRING_DATASOURCE_URL — aceita tanto postgres:// quanto jdbc:postgresql://
        String[] candidates = { genv("DATABASE_URL"), genv("SPRING_DATASOURCE_URL") };
        for (String raw : candidates) {
            if (raw == null || raw.isBlank()) continue;

            // Já no formato JDBC — usa direto
            if (raw.startsWith("jdbc:postgresql")) {
                String user = firstNonNull(genv("SPRING_DATASOURCE_USERNAME"), genv("PGUSER"), "postgres");
                String pass = firstNonNull(genv("SPRING_DATASOURCE_PASSWORD"), genv("PGPASSWORD"), "");
                return pg(raw, user, pass, "jdbc:postgresql URL");
            }

            // Formato postgres:// ou postgresql:// — converte para JDBC
            if (raw.startsWith("postgres://") || raw.startsWith("postgresql://")) {
                try {
                    String norm = raw.replaceFirst("^postgres://", "postgresql://");
                    URI uri = new URI(norm);
                    String url = "jdbc:postgresql://" + uri.getHost()
                            + ":" + (uri.getPort() > 0 ? uri.getPort() : 5432)
                            + uri.getPath();
                    String[] ui = uri.getUserInfo() != null
                            ? uri.getUserInfo().split(":", 2)
                            : new String[]{firstNonNull(genv("PGUSER"), "postgres"),
                                           firstNonNull(genv("PGPASSWORD"), "")};
                    return pg(url, ui[0], ui.length > 1 ? ui[1] : "", "postgres:// URL");
                } catch (Exception e) {
                    System.err.println("[DataSource] Falha ao converter URL postgres://: " + e.getMessage());
                }
            }
        }

        // 3. Fallback H2 para desenvolvimento local
        System.out.println("[DataSource] Nenhuma variavel PostgreSQL encontrada — usando H2 local.");
        return DataSourceBuilder.create()
                .url("jdbc:h2:file:./data/javaduolingo;DB_CLOSE_DELAY=-1;AUTO_SERVER=TRUE")
                .username("sa").password("")
                .driverClassName("org.h2.Driver")
                .build();
    }

    private static DataSource pg(String url, String user, String pass, String source) {
        System.out.println("[DataSource] PostgreSQL via " + source + " -> " + url);
        return DataSourceBuilder.create()
                .url(url).username(user).password(pass)
                .driverClassName("org.postgresql.Driver")
                .build();
    }

    private static String genv(String key) {
        String v = System.getenv(key);
        return (v != null && !v.isBlank()) ? v : null;
    }

    private static String genv(String key, String def) {
        String v = genv(key);
        return v != null ? v : def;
    }

    private static String firstNonNull(String... values) {
        for (String v : values) if (v != null && !v.isBlank()) return v;
        return "";
    }
}
