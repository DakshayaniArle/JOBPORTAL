package com.jobportal.jobportal.dto;

public class DashboardResponse {
	private long totalUsers;
	private long totalJobs;
	private long totalApplications;
	public DashboardResponse(long totalUsers, long totalJobs, long totalApplications) {
		this.totalUsers = totalUsers;
		this.totalJobs = totalJobs;
		this.totalApplications = totalApplications;
	}
	public long getTotalUsers() {
		return totalUsers;
	}
	public long getTotalJobs() {
		return totalJobs;
	}
	public long getTotalApplications() {
		return totalApplications;
	}
	
	
	
	
	
	
}
