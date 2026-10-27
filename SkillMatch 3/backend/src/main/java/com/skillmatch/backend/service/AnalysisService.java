package com.skillmatch.backend.service;

import com.skillmatch.backend.dto.AnalysisRequest;
import com.skillmatch.backend.dto.AnalysisResponse;
import com.skillmatch.backend.model.Analysis;
import com.skillmatch.backend.repository.AnalysisRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class AnalysisService {

    // Comprehensive technical skill keyword dictionary
    private static final List<String> KNOWN_SKILLS = List.of(
        // Languages
        "java", "python", "javascript", "typescript", "kotlin", "swift", "c++", "c#",
        "go", "rust", "ruby", "php", "scala", "matlab", "bash", "shell", "sql",
        "html", "css", "dart", "objective-c", "elixir", "haskell", "clojure", "lua",
        // Frontend
        "react", "angular", "vue", "next.js", "nuxt.js", "svelte", "redux", "mobx",
        "webpack", "vite", "rollup", "sass", "tailwind", "bootstrap", "material ui",
        "graphql", "rest", "ajax", "jquery", "d3.js", "three.js", "webgl",
        // Backend
        "spring", "spring boot", "django", "flask", "fastapi", "express", "node.js",
        "rails", "laravel", "asp.net", "hibernate", "jpa", "jdbc", "grpc", "kafka",
        "rabbitmq", "redis", "elasticsearch", "microservices", "mvc",
        // Databases
        "mysql", "postgresql", "mongodb", "sqlite", "oracle", "cassandra", "dynamodb",
        "firebase", "supabase", "neo4j", "mariadb", "couchdb",
        // Cloud & DevOps
        "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ansible",
        "jenkins", "github actions", "ci/cd", "linux", "nginx", "apache",
        "cloud computing", "serverless", "lambda", "ec2", "s3",
        // AI / ML
        "machine learning", "deep learning", "tensorflow", "pytorch", "scikit-learn",
        "keras", "nlp", "computer vision", "data science", "pandas", "numpy",
        "matplotlib", "hugging face", "llm", "neural network",
        // Tools & Methodologies
        "git", "github", "gitlab", "bitbucket", "jira", "confluence", "figma",
        "agile", "scrum", "kanban", "tdd", "bdd", "unit testing", "integration testing",
        "junit", "jest", "pytest", "selenium", "cypress", "postman", "swagger",
        "design patterns", "solid principles", "clean code", "oop", "functional programming",
        // Soft skills (broad)
        "communication", "teamwork", "problem solving", "leadership", "collaboration",
        "time management", "critical thinking", "presentation", "mentoring"
    );

    private static final Map<String, List<String>> SKILL_RECOMMENDATIONS = new HashMap<>();

    static {
        SKILL_RECOMMENDATIONS.put("react", List.of(
            "Complete the official React documentation and tutorial at react.dev",
            "Build 2-3 small projects using React hooks and state management"
        ));
        SKILL_RECOMMENDATIONS.put("spring boot", List.of(
            "Follow the Spring Boot Getting Started guides at spring.io",
            "Build a REST API with Spring Boot and connect it to a database"
        ));
        SKILL_RECOMMENDATIONS.put("docker", List.of(
            "Complete the Docker official getting-started tutorial",
            "Containerise an existing application and use Docker Compose"
        ));
        SKILL_RECOMMENDATIONS.put("aws", List.of(
            "Enroll in AWS Cloud Practitioner Essentials (free on AWS Skill Builder)",
            "Deploy a simple application to EC2 or use AWS Lambda"
        ));
        SKILL_RECOMMENDATIONS.put("machine learning", List.of(
            "Complete Andrew Ng's Machine Learning Specialisation on Coursera",
            "Implement classic ML algorithms from scratch using Python and scikit-learn"
        ));
        SKILL_RECOMMENDATIONS.put("sql", List.of(
            "Practice SQL queries on platforms like LeetCode or SQLZoo",
            "Design a relational database schema for a real project"
        ));
        SKILL_RECOMMENDATIONS.put("python", List.of(
            "Work through Python.org's official beginner tutorial",
            "Build an automation script or data analysis project using Python"
        ));
        SKILL_RECOMMENDATIONS.put("typescript", List.of(
            "Read the TypeScript Handbook at typescriptlang.org",
            "Migrate an existing JavaScript project to TypeScript"
        ));
        SKILL_RECOMMENDATIONS.put("kubernetes", List.of(
            "Complete the Kubernetes basics tutorial on kubernetes.io",
            "Deploy a multi-container application using Kubernetes locally with minikube"
        ));
        SKILL_RECOMMENDATIONS.put("graphql", List.of(
            "Read the official GraphQL documentation and build a simple API",
            "Integrate a GraphQL client like Apollo into a React application"
        ));
    }

    private final AnalysisRepository analysisRepository;

    public AnalysisService(AnalysisRepository analysisRepository) {
        this.analysisRepository = analysisRepository;
    }

    public AnalysisResponse analyze(AnalysisRequest request) {
        String jobDescription = request.getJobDescription().toLowerCase();
        String userSkillsRaw = request.getUserSkills() != null ? request.getUserSkills().toLowerCase() : "";
        String jobTitle = request.getJobTitle() != null && !request.getJobTitle().isBlank()
                ? request.getJobTitle().trim() : "Unspecified Role";

        // Extract skills from job description
        List<String> requiredSkills = extractSkills(jobDescription);

        // Extract skills from user input
        List<String> userSkillList = extractSkills(userSkillsRaw);

        // If user provided free-form text, also split by commas/newlines and normalise
        if (!userSkillsRaw.isBlank()) {
            String[] rawParts = userSkillsRaw.split("[,\\n;]+");
            for (String part : rawParts) {
                String normalised = part.trim().toLowerCase();
                if (!normalised.isBlank() && !userSkillList.contains(normalised)) {
                    userSkillList.add(normalised);
                }
            }
        }

        // Determine matched and missing skills
        List<String> matchedSkills = new ArrayList<>();
        List<String> missingSkills = new ArrayList<>();

        for (String skill : requiredSkills) {
            boolean matched = userSkillList.stream()
                    .anyMatch(us -> us.contains(skill) || skill.contains(us));
            if (matched) {
                matchedSkills.add(capitalise(skill));
            } else {
                missingSkills.add(capitalise(skill));
            }
        }

        // Remove duplicates while preserving order
        matchedSkills = deduplicate(matchedSkills);
        missingSkills = deduplicate(missingSkills);

        // Calculate match score
        int matchScore = calculateScore(requiredSkills.size(), matchedSkills.size());

        // Generate explanation
        String explanation = buildExplanation(jobTitle, matchScore, matchedSkills.size(), missingSkills.size(), requiredSkills.size());

        // Generate recommendations
        List<String> recommendations = buildRecommendations(missingSkills);

        // Persist to database
        Analysis entity = new Analysis();
        entity.setJobTitle(jobTitle);
        entity.setJobDescription(request.getJobDescription());
        entity.setUserSkills(request.getUserSkills());
        entity.setMatchScore(matchScore);
        entity.setMatchedSkills(String.join(", ", matchedSkills));
        entity.setMissingSkills(String.join(", ", missingSkills));
        entity.setExplanation(explanation);
        entity.setRecommendations(String.join(" | ", recommendations));

        Analysis saved = analysisRepository.save(entity);

        return new AnalysisResponse(
                saved.getId(),
                jobTitle,
                matchScore,
                matchedSkills,
                missingSkills,
                explanation,
                recommendations,
                saved.getCreatedAt()
        );
    }

    public List<AnalysisResponse> getRecentAnalyses() {
        return analysisRepository.findTop10ByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private AnalysisResponse toResponse(Analysis a) {
        List<String> matched = splitAndFilter(a.getMatchedSkills());
        List<String> missing = splitAndFilter(a.getMissingSkills());
        List<String> recs = a.getRecommendations() != null
                ? List.of(a.getRecommendations().split(" \\| "))
                : List.of();
        return new AnalysisResponse(
                a.getId(), a.getJobTitle(), a.getMatchScore(),
                matched, missing, a.getExplanation(), recs, a.getCreatedAt()
        );
    }

    private List<String> splitAndFilter(String csv) {
        if (csv == null || csv.isBlank()) return List.of();
        return Arrays.stream(csv.split(",\\s*"))
                .filter(s -> !s.isBlank())
                .collect(Collectors.toList());
    }

    private List<String> extractSkills(String text) {
        List<String> found = new ArrayList<>();
        for (String skill : KNOWN_SKILLS) {
            // Use word-boundary matching to avoid partial-word false positives
            // (e.g., "go" should not match inside "algorithm", "r" inside "requirements")
            String escaped = Pattern.quote(skill);
            // For skills containing only word characters, wrap in \b; otherwise use simple contains
            String regex = skill.matches("[a-z0-9]+")
                    ? "(?<![a-z0-9])" + escaped + "(?![a-z0-9])"
                    : Pattern.quote(skill);
            if (Pattern.compile(regex).matcher(text).find()) {
                found.add(skill);
            }
        }
        return found;
    }

    private int calculateScore(int totalRequired, int matched) {
        if (totalRequired == 0) return 0;
        double ratio = (double) matched / totalRequired;
        // Scale to 0-100, minimum 0, maximum 100
        return Math.min(100, (int) Math.round(ratio * 100));
    }

    private String buildExplanation(String jobTitle, int score, int matched, int missing, int total) {
        String tier = score >= 80 ? "strong" : score >= 60 ? "good" : score >= 40 ? "moderate" : "limited";
        return String.format(
            "Keyword-based skill matching found %d of %d required skills in your profile, " +
            "giving a %s match score of %d%% for the %s role. " +
            "%d skill%s identified as gaps to address.",
            matched, total, tier, score, jobTitle,
            missing, missing == 1 ? " was" : "s were"
        );
    }

    private List<String> buildRecommendations(List<String> missingSkills) {
        List<String> recs = new ArrayList<>();
        for (String skill : missingSkills) {
            String key = skill.toLowerCase();
            if (SKILL_RECOMMENDATIONS.containsKey(key)) {
                recs.addAll(SKILL_RECOMMENDATIONS.get(key));
                if (recs.size() >= 4) break;
            }
        }
        if (recs.isEmpty() && !missingSkills.isEmpty()) {
            recs.add("Research and practise " + String.join(", ", missingSkills.subList(0, Math.min(3, missingSkills.size()))) + " through online tutorials and hands-on projects.");
            recs.add("Build a small project that incorporates the missing skills to demonstrate practical experience.");
        }
        if (recs.isEmpty()) {
            recs.add("Great match! Keep refining your skills and tailor your portfolio to highlight the matched technologies.");
            recs.add("Consider deepening expertise in advanced topics related to your strong areas.");
        }
        return recs.stream().distinct().limit(5).collect(Collectors.toList());
    }

    private List<String> deduplicate(List<String> list) {
        return list.stream().distinct().collect(Collectors.toList());
    }

    private String capitalise(String s) {
        if (s == null || s.isBlank()) return s;
        return s.substring(0, 1).toUpperCase() + s.substring(1);
    }
}
