package com.jobportal.jobportal.dto;

import java.time.LocalDateTime;
import java.util.Map;

public class ValidationErrorResponse {

    private boolean success;

    private int status;

    private Map<String,String> errors;

    private LocalDateTime timestamp;

	public ValidationErrorResponse(boolean success, int status, Map<String, String> errors, LocalDateTime timestamp) {
		this.success = success;
		this.status = status;
		this.errors = errors;
		this.timestamp = timestamp;
	}

	public boolean isSuccess() {
		return success;
	}

	public void setSuccess(boolean success) {
		this.success = success;
	}

	public int getStatus() {
		return status;
	}

	public void setStatus(int status) {
		this.status = status;
	}

	public Map<String, String> getErrors() {
		return errors;
	}

	public void setErrors(Map<String, String> errors) {
		this.errors = errors;
	}

	public LocalDateTime getTimestamp() {
		return timestamp;
	}

	public void setTimestamp(LocalDateTime timestamp) {
		this.timestamp = timestamp;
	}
	
	
    
}