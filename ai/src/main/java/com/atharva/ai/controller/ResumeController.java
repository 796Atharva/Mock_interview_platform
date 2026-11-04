package com.atharva.ai.controller;

import com.atharva.ai.entity.Resume;
import com.atharva.ai.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.atharva.ai.dto.ResumeAnalysisResponse;
import java.util.Map;

@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;

    @PostMapping(
            value = "/upload",
            consumes = "multipart/form-data"
    )
    public ResponseEntity<?> uploadResume(
            @RequestParam("file") MultipartFile file,
            @RequestParam("name") String name,
            @RequestParam("email") String email
    ) {

        try {

            Resume resume = resumeService.processResume(
                    file,
                    name,
                    email
            );

            return ResponseEntity.ok(
                    Map.of(
                            "message", "Resume processed successfully",
                            "resumeId", resume.getId(),
                            "candidateId",
                            resume.getCandidate().getId()
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "error",
                                    e.getMessage()
                            )
                    );
        }
    }
    @GetMapping("/{id}")
    public ResponseEntity<ResumeAnalysisResponse> getResume(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                resumeService.getResumeAnalysis(id)
        );
    }
}