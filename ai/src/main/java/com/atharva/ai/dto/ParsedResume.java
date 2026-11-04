package com.atharva.ai.dto;

import java.util.List;

public record ParsedResume(

        String summary,

        List<String> skills,

        List<Project> projects,

        List<Experience> experience,

        List<Education> education,

        List<String> certifications
) {

    public record Project(
            String name,
            String description,
            List<String> technologies
    ) {}

    public record Experience(
            String company,
            String role,
            String duration,
            String description
    ) {}

    public record Education(
            String institution,
            String degree,
            String duration
    ) {}
}