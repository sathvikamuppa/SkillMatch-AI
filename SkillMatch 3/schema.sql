-- SkillMatch AI — Database Schema
-- Run this on your MySQL server before starting the backend.

CREATE DATABASE IF NOT EXISTS skillmatch_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE skillmatch_db;

-- The JPA entity will auto-create the 'analyses' table via spring.jpa.hibernate.ddl-auto=update
-- This file is provided for reference and manual setup if needed.

-- Manual table creation (optional, Hibernate will handle this automatically):
CREATE TABLE IF NOT EXISTS analyses (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_title      VARCHAR(255),
    job_description LONGTEXT NOT NULL,
    user_skills    LONGTEXT,
    match_score    INT NOT NULL,
    matched_skills LONGTEXT,
    missing_skills LONGTEXT,
    explanation    LONGTEXT,
    recommendations LONGTEXT,
    created_at     DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
