package com.javaduolingo.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "code_snippets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CodeSnippet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String code;

    @Column(length = 50)
    @Builder.Default
    private String language = "Java";

    @Column(length = 300)
    private String tags;

    @Column(length = 500)
    private String description;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String username = "admin";

    @CreationTimestamp
    private LocalDateTime createdAt;
}
