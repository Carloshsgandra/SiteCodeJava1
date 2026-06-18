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
    public DataSource dataSource() {  // public required for Spring proxy
        // 1. Variáveis individuais PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSWORD
        String pgHost = genv("PGHOST");
        if (pgHost != null) {
            String url = "jdbc:postgresql://" + pgHost
                    + ":" + genv("PGPORT", "5432")
                    + "/" + genv("PGDATABASE", "railway");
            return pg(url, genv("PGUSER", "postgres"), genv("PGPASSWORD", ""), "PGHOST");
        }

        // 2. DATABASE_URL (postgres://user:pass@host:port/db)
        String rawUrl = genv("DATABASE_URL");
        if (rawUrl != null) {
            try {
                String norm = rawUrl.replaceFirst("^postgres://", "postgresql://");
                URI uri  = new URI(norm);
                String url = "jdbc:postgresql://" + uri.getHost()
                        + ":" + (uri.getPort() > 0 ? uri.getPort() : 5432)
                        + uri.getPath();
                String[] ui = uri.getUserInfo() != null ? uri.getUserInfo().split(":", 2) : new String[]{"postgres",""};
                return pg(url, ui[0], ui.length > 1 ? ui[1] : "", "DATABASE_URL");
            } catch (Exception e) {
                System.err.println("[DataSource] Falha ao parsear DATABASE_URL: " + e.getMessage());
            }
        }

        // 3. SPRING_DATASOURCE_URL (variável manual no Railway)
        String sdUrl = genv("SPRING_DATASOURCE_URL");
        if (sdUrl != null && sdUrl.startsWith("jdbc:postgresql")) {
            return pg(sdUrl, genv("SPRING_DATASOURCE_USERNAME",""), genv("SPRING_DATASOURCE_PASSWORD",""), "SPRING_DATASOURCE_URL");
        }

        // 4. Fallback H2 (desenvolvimento local)
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
}
