package com.jobportal.jobportal.config;

import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI jobPortalAPI() {

        final String securitySchemeName = "bearerAuth";

        return new OpenAPI()

                .info(new Info()
                        .title("Job Portal API")
                        .description("""
                                REST APIs for Job Portal
                                
                                Features:
                                - JWT Authentication
                                - Job Management
                                - Resume Upload
                                - Applications
                                - Interviews
                                - Notifications
                                - Dashboard
                                """)
                        .version("1.0")
                        .contact(new Contact()
                                .name("Dakshayani"))
                        .license(new License()
                                .name("MIT License")))

                .externalDocs(new ExternalDocumentation()
                        .description("Job Portal Documentation"))

                // Add Security Requirement
                .addSecurityItem(new SecurityRequirement()
                        .addList(securitySchemeName))

                // Define Security Scheme
                .components(new io.swagger.v3.oas.models.Components()
                        .addSecuritySchemes(
                                securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                        ));
    }
}