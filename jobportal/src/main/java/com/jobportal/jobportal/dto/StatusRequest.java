package com.jobportal.jobportal.dto;

import com.jobportal.jobportal.enums.ApplicationStatus;

public class StatusRequest {
	
	private ApplicationStatus status;

	public ApplicationStatus getStatus() {
		return status;
	}

	public void setStatus(ApplicationStatus status) {
		this.status = status;
	}
	
	
}
