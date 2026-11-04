
package com.atharva.ai.service;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
public class GroqApiService {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    @Value("${groq.api-url}")
    private String apiUrl;

    @Value("${groq.evaluation.api-key}")
    private String evaluationApiKey;

    @Value("${groq.report.api-key}")
    private String reportApiKey;

    @Value("${groq.evaluation.model}")
    private String evaluationModel;

    @Value("${groq.report.model}")
    private String reportModel;

    public GroqApiService(
            RestClient.Builder restClientBuilder,
            ObjectMapper objectMapper
    ) {
        this.restClient = restClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    public <T> T evaluate(String prompt, Class<T> resultType) {
        return callGroq(
                evaluationApiKey,
                evaluationModel,
                prompt,
                resultType
        );
    }

    public <T> T generateReport(String prompt, Class<T> resultType) {
        return callGroq(
                reportApiKey,
                reportModel,
                prompt,
                resultType
        );
    }

    private <T> T callGroq(
            String apiKey,
            String model,
            String prompt,
            Class<T> resultType
    ) {
        try {
            Map<String, Object> request = Map.of(
                    "model", model,
                    "messages", List.of(
                            Map.of(
                                    "role", "system",
                                    "content",
                                    "Follow the user's instructions. Return valid JSON only, without Markdown fences."
                            ),
                            Map.of(
                                    "role", "user",
                                    "content", prompt
                            )
                    ),
                    "temperature", 0.2,
                    "response_format", Map.of(
                            "type", "json_object"
                    )
            );

            JsonNode response = restClient.post()
                    .uri(apiUrl)
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .body(request)
                    .retrieve()
                    .body(JsonNode.class);

            if (response == null
                    || !response.has("choices")
                    || response.path("choices").isEmpty()) {
                throw new RuntimeException(
                        "Groq returned an empty response."
                );
            }

            String content = response
                    .path("choices")
                    .get(0)
                    .path("message")
                    .path("content")
                    .asText();

            if (content == null || content.isBlank()) {
                throw new RuntimeException(
                        "Groq returned empty message content."
                );
            }

            return objectMapper.readValue(content, resultType);

        } catch (Exception e) {
            throw new RuntimeException(
                    "Groq API request failed: " + e.getMessage(),
                    e
            );
        }
    }
}
