package com.atharva.ai.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "interview_reports")
public class InterviewReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "interview_id",
            nullable = false,
            unique = true
    )
    private Interview interview;

    private Integer overallScore;

    private Integer technicalKnowledgeScore;

    private Integer problemSolvingScore;

    private Integer communicationScore;

    private Integer practicalKnowledgeScore;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(columnDefinition = "TEXT")
    private String strengths;

    @Column(columnDefinition = "TEXT")
    private String weaknesses;

    @Column(columnDefinition = "TEXT")
    private String recommendations;

    @Column(length = 100)
    private String finalVerdict;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Interview getInterview() {
        return interview;
    }

    public void setInterview(Interview interview) {
        this.interview = interview;
    }

    public Integer getOverallScore() {
        return overallScore;
    }

    public void setOverallScore(Integer overallScore) {
        this.overallScore = overallScore;
    }

    public Integer getTechnicalKnowledgeScore() {
        return technicalKnowledgeScore;
    }

    public void setTechnicalKnowledgeScore(
            Integer technicalKnowledgeScore
    ) {
        this.technicalKnowledgeScore =
                technicalKnowledgeScore;
    }

    public Integer getProblemSolvingScore() {
        return problemSolvingScore;
    }

    public void setProblemSolvingScore(
            Integer problemSolvingScore
    ) {
        this.problemSolvingScore =
                problemSolvingScore;
    }

    public Integer getCommunicationScore() {
        return communicationScore;
    }

    public void setCommunicationScore(
            Integer communicationScore
    ) {
        this.communicationScore =
                communicationScore;
    }

    public Integer getPracticalKnowledgeScore() {
        return practicalKnowledgeScore;
    }

    public void setPracticalKnowledgeScore(
            Integer practicalKnowledgeScore
    ) {
        this.practicalKnowledgeScore =
                practicalKnowledgeScore;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getStrengths() {
        return strengths;
    }

    public void setStrengths(String strengths) {
        this.strengths = strengths;
    }

    public String getWeaknesses() {
        return weaknesses;
    }

    public void setWeaknesses(String weaknesses) {
        this.weaknesses = weaknesses;
    }

    public String getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(String recommendations) {
        this.recommendations = recommendations;
    }

    public String getFinalVerdict() {
        return finalVerdict;
    }

    public void setFinalVerdict(String finalVerdict) {
        this.finalVerdict = finalVerdict;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}