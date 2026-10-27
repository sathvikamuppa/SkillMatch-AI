package com.skillmatch.backend;

import com.skillmatch.backend.dto.AnalysisRequest;
import com.skillmatch.backend.dto.AnalysisResponse;
import com.skillmatch.backend.service.AnalysisService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analyses")
public class AnalysisController {

    private final AnalysisService analysisService;

    public AnalysisController(AnalysisService analysisService) {
        this.analysisService = analysisService;
    }

    @PostMapping
    public ResponseEntity<AnalysisResponse> analyze(@Valid @RequestBody AnalysisRequest request) {
        AnalysisResponse response = analysisService.analyze(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<AnalysisResponse>> getRecentAnalyses() {
        return ResponseEntity.ok(analysisService.getRecentAnalyses());
    }

    @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationErrors(
            org.springframework.web.bind.MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getAllErrors().stream()
                .map(org.springframework.validation.ObjectError::getDefaultMessage)
                .findFirst()
                .orElse("Validation failed.");
        return ResponseEntity.badRequest().body(Map.of("error", message));
    }
}
