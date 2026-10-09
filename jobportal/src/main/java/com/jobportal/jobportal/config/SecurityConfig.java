package com.jobportal.jobportal.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.HttpRequestMethodNotSupportedException;

import com.jobportal.jobportal.security.*;
@Configuration
public class SecurityConfig {
	
	@Bean
	public PasswordEncoder passEncoder() {
		return new BCryptPasswordEncoder();
	}
	

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtFilter jwtFilter) throws Exception {

	    http
	        .cors(cors -> {})
	        .csrf(csrf -> csrf.disable())
	        .authorizeHttpRequests(auth -> auth
	        		.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
	                .requestMatchers("/users/register", "/users/login").permitAll()
	                .requestMatchers("/users/recruiters/register","/users/recruiters/login").permitAll()
	                .requestMatchers(
	                		"/users/forgot-password",
	                		"/users/verify-otp",
	                		"/users/reset-password"
	                		).permitAll()
	                .requestMatchers("/ws/**").permitAll()
	                .requestMatchers("/notifications/**").hasAnyAuthority("ADMIN","RECRUITER","USER")                
	                .requestMatchers(HttpMethod.POST, "/jobs").hasAnyAuthority("ADMIN","RECRUITER")               
	                .requestMatchers(HttpMethod.DELETE, "/jobs/**").hasAnyAuthority("ADMIN","RECRUITER")
	                .requestMatchers(HttpMethod.PUT,"/jobs/*/close").hasAnyAuthority("ADMIN","RECRUITER")
	                .requestMatchers(HttpMethod.PUT,"/jobs/*/extend").hasAnyAuthority("ADMIN","RECRUITER")
	                .requestMatchers(HttpMethod.PUT,"/jobs/*/reopen").hasAnyAuthority("ADMIN","RECRUITER")
	                .requestMatchers(HttpMethod.PUT, "/jobs/**").hasAnyAuthority("ADMIN","RECRUITER")
	                .requestMatchers(HttpMethod.GET,"/jobs/recommended").authenticated()
	                .requestMatchers(HttpMethod.GET, "/jobs/**").permitAll()
	                .requestMatchers(HttpMethod.GET, "/jobs").permitAll()
	                .requestMatchers(HttpMethod.GET,"/applications/recruiter/**").hasAnyAuthority("ADMIN","RECRUITER")  
	                .requestMatchers(HttpMethod.PUT,"/applications/recruiter/**").hasAnyAuthority("ADMIN","RECRUITER")
	                .requestMatchers(HttpMethod.GET,"/applications/job/**").hasAnyAuthority("ADMIN","RECRUITER")
	                .requestMatchers(HttpMethod.POST,"/applications/apply/**").hasAnyAuthority("USER","ADMIN")
	                .requestMatchers(HttpMethod.GET,"/applications/my").hasAnyAuthority("USER","ADMIN")
	                .requestMatchers(HttpMethod.PUT,"/applications/*/withdraw","/applications/*/accept-offer").hasAnyAuthority("USER","ADMIN")
	                .requestMatchers(HttpMethod.PUT,"/applications/**").hasAuthority("ADMIN")
	                .requestMatchers(HttpMethod.GET,"/dashboard/candidate").hasAuthority("USER")
	                .requestMatchers(HttpMethod.GET,"/dashboard/recruiter").hasAuthority("RECRUITER")
	                .requestMatchers(HttpMethod.GET,"/dashboard/**").hasAuthority("ADMIN")
	                .requestMatchers(HttpMethod.GET,"/users/resume/**").hasAnyAuthority("ADMIN","RECRUITER","USER")
	                .requestMatchers(HttpMethod.PATCH,"/users/profile").hasAnyAuthority("USER","RECRUITER","ADMIN")
	                .requestMatchers(HttpMethod.GET,"/users/profile").hasAnyAuthority("USER","RECRUITER","ADMIN")
	                .requestMatchers(HttpMethod.POST,"/users/skills","/users/upload-resume").hasAnyAuthority("USER","ADMIN")
	                .requestMatchers(HttpMethod.DELETE,"/users/skills").hasAnyAuthority("USER","ADMIN")
	                .requestMatchers(HttpMethod.PATCH,"/users/change-password").hasAnyAuthority("USER","RECRUITER","ADMIN")
	                .requestMatchers(HttpMethod.POST,"/users").hasAuthority("ADMIN")
	                .requestMatchers(HttpMethod.GET,"/users").hasAuthority("ADMIN")
	                .requestMatchers(HttpMethod.DELETE,"/users/**").hasAuthority("ADMIN")
	                .requestMatchers("/saved-jobs/**").hasAnyAuthority("USER","ADMIN")  
	                .requestMatchers(HttpMethod.POST,"/interviews/schedule").hasAuthority("RECRUITER")
	                .requestMatchers(HttpMethod.GET,"/interviews/my-interviews").hasAuthority("USER")
	                .requestMatchers(HttpMethod.GET,"/interviews/recruiter").hasAuthority("RECRUITER")
	                .requestMatchers(HttpMethod.GET,"/users/profile-completion").hasAnyAuthority("USER","RECRUITER","ADMIN")
	                .requestMatchers(
	                        "/v3/api-docs/**",
	                        "/swagger-ui/**",
	                        "/swagger-ui.html"
	                ).permitAll()
//	                .requestMatchers("/jobs/**").permitAll() 
	                .anyRequest().authenticated()
	        ) 
	        .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
 
	    return http.build();
	}

}
