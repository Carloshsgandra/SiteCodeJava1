package com.javaduolingo.repository;

import com.javaduolingo.model.CodeSnippet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface CodeSnippetRepository extends JpaRepository<CodeSnippet, Long> {

    List<CodeSnippet> findByUsernameOrderByCreatedAtDesc(String username);

    @Query("SELECT s FROM CodeSnippet s WHERE s.username = :username AND " +
           "(LOWER(s.title) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(s.tags) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(s.description) LIKE LOWER(CONCAT('%', :q, '%')))")
    List<CodeSnippet> searchByUsername(String username, String q);
}
