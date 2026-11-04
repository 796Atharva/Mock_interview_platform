package com.atharva.ai.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "interviews")
public class Interview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    @Column(nullable = false)
    private Integer currentQuestionOrder = 1;

    @Column(nullable = false)
    private String status = "IN_PROGRESS";

    private String vapiCallId;

    private LocalDateTime startedAt;

    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {
        startedAt = LocalDateTime.now();

        if (currentQuestionOrder == null) {
            currentQuestionOrder = 1;
        }

        if (status == null) {
            status = "IN_PROGRESS";
        }
    }

    public Long getId() {
        return id;
    }

    public Resume getResume() {
        return resume;
    }

    public void setResume(Resume resume) {
        this.resume = resume;
    }

    public Integer getCurrentQuestionOrder() {
        return currentQuestionOrder;
    }

    public void setCurrentQuestionOrder(Integer currentQuestionOrder) {
        this.currentQuestionOrder = currentQuestionOrder;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getVapiCallId() {
        return vapiCallId;
    }

    public void setVapiCallId(String vapiCallId) {
        this.vapiCallId = vapiCallId;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }
}