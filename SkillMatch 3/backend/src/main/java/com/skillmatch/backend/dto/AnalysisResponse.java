package com.skillmatch.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public class AnalysisResponse {

    private Long id;
    private String jobTitle;
    private int matchScore;
    private List<String> matchedSkills;
    private List<String> missingSkills;
    private String explanation;
    private List<String> recommendations;
    private LocalDateTime createdAt;

    public AnalysisResponse() {}

    public AnalysisResponse(Long id, String jobTitle, int matchScore,
                            List<String> matchedSkills, List<String> missingSkills,
                            String explanation, List<String> recommendations,
                            LocalDateTime createdAt) {
        this.id = id;
        this.jobTitle = jobTitle;
        this.matchScore = matchScore;
        this.matchedSkills = matchedSkills;
        this.missingSkills = missingSkills;
        this.explanation = explanation;
        this.recommendations = recommendations;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public int getMatchScore() { return matchScore; }
    public void setMatchScore(int matchScore) { this.matchScore = matchScore; }

    public List<String> getMatchedSkills() { return matchedSkills; }
    public void setMatchedSkills(List<String> matchedSkills) { this.matchedSkills = matchedSkills; }

    public List<String> getMissingSkills() { return missingSkills; }
    public void setMissingSkills(List<String> missingSkills) { this.missingSkills = missingSkills; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public List<String> getRecommendations() { return recommendations; }
    public void setRecommendations(List<String> recommendations) { this.recommendations = recommendations; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
