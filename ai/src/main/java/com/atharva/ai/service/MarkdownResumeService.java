package com.atharva.ai.service;

import org.springframework.stereotype.Service;

@Service
public class MarkdownResumeService {

    public String convertToMarkdown(String text) {

        if (text == null || text.isBlank()) {
            throw new IllegalArgumentException(
                    "No text could be extracted from resume"
            );
        }

        String cleaned = text
                .replace("\r\n", "\n")
                .replace("\r", "\n")
                .replaceAll("\n{3,}", "\n\n")
                .trim();

        return """
                # Resume

                %s
                """.formatted(cleaned);
    }
}