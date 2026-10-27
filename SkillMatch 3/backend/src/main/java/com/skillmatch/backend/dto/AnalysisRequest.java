package com.skillmatch.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AnalysisRequest {

    private String jobTitle;

    @NotBlank(message = "Job description is required.")
    @Size(min = 20, message = "Job description must be at least 20 characters.")
    private String jobDescription;

    private String userSkills;

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public String getJobDescription() { return jobDescription; }
    public void setJobDescription(String jobDescription) { this.jobDescription = jobDescription; }

    public String getUserSkills() { return userSkills; }
    public void setUserSkills(String userSkills) { this.userSkills = userSkills; }
}
