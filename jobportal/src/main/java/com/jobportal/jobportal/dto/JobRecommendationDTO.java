package com.jobportal.jobportal.dto;

import com.jobportal.jobportal.model.Job;

public class JobRecommendationDTO {
	private Job job;
	private int matchPercentage;
	
	
	public JobRecommendationDTO(Job job, int matchPercentage) {
		this.job = job;
		this.matchPercentage = matchPercentage;
	}
	
	
	public Job getJob() {
		return job;
	}
	public void setJob(Job job) {
		this.job = job;
	}
	public int getMatchPercentage() {
		return matchPercentage;
	}
	public void setMatchPercentage(int matchPercentage) {
		this.matchPercentage = matchPercentage;
	}
	
	
	
}
