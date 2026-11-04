package com.atharva.ai.service;

import org.apache.tika.Tika;
import org.apache.tika.exception.TikaException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class DocumentExtractionService {

    private final Tika tika = new Tika();

    public String extractText(MultipartFile file) throws IOException, TikaException {

        if (file.isEmpty()) {
            throw new IllegalArgumentException("Resume file is empty");
        }

        String contentType = file.getContentType();
        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";

        boolean isPdf = (contentType != null && (contentType.equals("application/pdf") || contentType.equals("application/x-pdf")))
                || filename.endsWith(".pdf");
        boolean isDocx = (contentType != null && (contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document")
                || contentType.equals("application/msword")))
                || filename.endsWith(".docx") || filename.endsWith(".doc");

        if (!isPdf && !isDocx) {
            throw new IllegalArgumentException(
                    "Only PDF and DOCX resumes are supported. Received: " + (contentType != null ? contentType : filename)
            );
        }

        return tika.parseToString(file.getInputStream());
    }
}