package com.atharva.ai.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "interview_video_metrics")
public class InterviewVideoMetrics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_id", nullable = false, unique = true)
    private Interview interview;

    private Double facePresencePercentage;

    private Double attentionScore;

    private Double cameraActivePercentage;

    @Column(length = 50)
    private String headMovement;

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

    public Double getFacePresencePercentage() {
        return facePresencePercentage;
    }

    public void setFacePresencePercentage(
            Double facePresencePercentage) {
        this.facePresencePercentage =
                facePresencePercentage;
    }

    public Double getAttentionScore() {
        return attentionScore;
    }

    public void setAttentionScore(
            Double attentionScore) {
        this.attentionScore =
                attentionScore;
    }

    public Double getCameraActivePercentage() {
        return cameraActivePercentage;
    }

    public void setCameraActivePercentage(
            Double cameraActivePercentage) {
        this.cameraActivePercentage =
                cameraActivePercentage;
    }

    public String getHeadMovement() {
        return headMovement;
    }

    public void setHeadMovement(
            String headMovement) {
        this.headMovement = headMovement;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}