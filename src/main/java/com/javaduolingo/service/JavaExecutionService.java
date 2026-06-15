package com.javaduolingo.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.tools.DiagnosticCollector;
import javax.tools.JavaCompiler;
import javax.tools.JavaFileObject;
import javax.tools.ToolProvider;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.List;
import java.util.Map;
import java.util.concurrent.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class JavaExecutionService {

    private final GeminiService geminiService;

    private static final int TIMEOUT_SECONDS = 10;
    private static final int MAX_OUTPUT_CHARS = 8000;

    private static final Pattern CLASS_NAME_PATTERN =
            Pattern.compile("\\bpublic\\s+class\\s+(\\w+)");

    public Map<String, String> execute(String code) {
        // Se o JDK não estiver disponível no servidor, usa IA como simulador
        if (ToolProvider.getSystemJavaCompiler() == null) {
            log.info("JDK compiler not available — falling back to AI simulation");
            Map<String, String> result = geminiService.simulateExecution(code);
            String output = result.get("output");
            boolean isError = "error".equals(result.get("type"));
            String note = isError ? output : output + "\n\n⚡ Executado via IA (JDK indisponível no servidor)";
            return Map.of("output", note, "type", result.getOrDefault("type", "success"));
        }

        String wrapped = wrapIfNeeded(code);
        String className = extractClassName(wrapped);

        Path tempDir = null;
        try {
            tempDir = Files.createTempDirectory("javaduolingo_");
            Path sourceFile = tempDir.resolve(className + ".java");
            Files.writeString(sourceFile, wrapped, StandardCharsets.UTF_8);

            // Compile
            String compileError = compile(sourceFile, tempDir);
            if (compileError != null) {
                return Map.of("output", compileError, "type", "error");
            }

            // Execute
            return run(className, tempDir);

        } catch (Exception e) {
            log.error("Internal execution error: {}", e.getMessage());
            // Tenta IA como último recurso
            log.info("Falling back to AI simulation after error");
            return geminiService.simulateExecution(code);
        } finally {
            if (tempDir != null) {
                deleteQuietly(tempDir);
            }
        }
    }

    private String compile(Path sourceFile, Path outputDir) {
        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        if (compiler == null) {
            // Fallback message when running on JRE instead of JDK
            return "Compilador Java não disponível no servidor. Certifique-se de usar JDK.";
        }

        DiagnosticCollector<JavaFileObject> diagnostics = new DiagnosticCollector<>();
        try (var fileManager = compiler.getStandardFileManager(diagnostics, null, StandardCharsets.UTF_8)) {
            var compilationUnits = fileManager.getJavaFileObjects(sourceFile);
            var options = List.of("-d", outputDir.toString(), "-encoding", "UTF-8");

            JavaCompiler.CompilationTask task = compiler.getTask(
                    null, fileManager, diagnostics, options, null, compilationUnits);

            boolean success = task.call();
            if (!success) {
                StringBuilder sb = new StringBuilder();
                for (var d : diagnostics.getDiagnostics()) {
                    if (d.getKind() == javax.tools.Diagnostic.Kind.ERROR) {
                        long line = d.getLineNumber();
                        String msg = d.getMessage(null);
                        // Remove the full path from the error message
                        String srcName = sourceFile.getFileName().toString();
                        msg = msg.replace(sourceFile.toString(), srcName);
                        if (line > 0) {
                            sb.append("Linha ").append(line).append(": ").append(msg).append("\n");
                        } else {
                            sb.append(msg).append("\n");
                        }
                    }
                }
                return sb.isEmpty() ? "Erro de compilação desconhecido." : sb.toString().trim();
            }
        } catch (IOException e) {
            return "Erro ao abrir o compilador: " + e.getMessage();
        }
        return null; // success
    }

    private Map<String, String> run(String className, Path classDir) throws Exception {
        ProcessBuilder pb = new ProcessBuilder(
                "java",
                "-cp", classDir.toString(),
                "-Xmx64m",         // limita memória a 64MB
                "-Xss512k",        // limita stack
                className
        );
        pb.directory(classDir.toFile());
        pb.redirectErrorStream(true);

        Process process = pb.start();

        // Fecha o stdin imediatamente para Scanner não bloquear
        process.getOutputStream().close();

        // Lê o output em thread separada
        CompletableFuture<String> outputFuture = CompletableFuture.supplyAsync(() -> {
            try (var reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    if (sb.length() < MAX_OUTPUT_CHARS) {
                        sb.append(line).append("\n");
                    } else {
                        sb.append("\n[... saída truncada após ").append(MAX_OUTPUT_CHARS).append(" caracteres]");
                        break;
                    }
                }
                return sb.toString();
            } catch (IOException e) {
                return "";
            }
        });

        boolean finished = process.waitFor(TIMEOUT_SECONDS, TimeUnit.SECONDS);
        if (!finished) {
            process.destroyForcibly();
            return Map.of(
                "output", "⏰ Tempo limite excedido (" + TIMEOUT_SECONDS + "s).\nVerifique se há loop infinito ou uso de Scanner sem entrada.",
                "type", "error"
            );
        }

        String output;
        try {
            output = outputFuture.get(2, TimeUnit.SECONDS);
        } catch (TimeoutException e) {
            output = "";
        }

        int exitCode = process.exitValue();
        if (exitCode != 0 && output.isBlank()) {
            output = "Programa encerrado com código de saída " + exitCode;
        }

        String result = output.trim();
        return Map.of(
            "output", result.isEmpty() ? "(sem saída)" : result,
            "type", exitCode == 0 ? "success" : "error"
        );
    }

    private String wrapIfNeeded(String code) {
        if (code.contains("class ")) return code;
        String indented = code.lines()
                .map(l -> "        " + l)
                .reduce("", (a, b) -> a + b + "\n");
        return "public class Main {\n    public static void main(String[] args) {\n"
                + indented
                + "    }\n}";
    }

    private String extractClassName(String code) {
        Matcher m = CLASS_NAME_PATTERN.matcher(code);
        return m.find() ? m.group(1) : "Main";
    }

    private void deleteQuietly(Path dir) {
        try {
            try (var walk = Files.walk(dir)) {
                walk.sorted(java.util.Comparator.reverseOrder())
                    .map(Path::toFile)
                    .forEach(File::delete);
            }
        } catch (Exception ignored) {}
    }
}
