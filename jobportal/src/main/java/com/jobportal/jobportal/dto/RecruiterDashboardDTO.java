package com.jobportal.jobportal.dto;

import java.util.List;

public class RecruiterDashboardDTO {
	
	private Long totalJobs;
	private Long totalApplications;
	private Long shortlisted;
	private Long rejected;
	private Long pending;
	private Long withdrawn;
	private Long hired;
	
	private List<JobStatsDTO> jobStatistics;

	public Long getTotalJobs() {
		return totalJobs;
	}

	public void setTotalJobs(Long totalJobs) {
		this.totalJobs = totalJobs;
	}

	public Long getTotalApplications() {
		return totalApplications;
	}

	public void setTotalApplications(Long totalApplications) {
		this.totalApplications = totalApplications;
	}

	public Long getShortlisted() {
		return shortlisted;
	}

	public void setShortlisted(Long shortlisted) {
		this.shortlisted = shortlisted;
	}

	public Long getRejected() {
		return rejected;
	}

	public void setRejected(Long rejected) {
		this.rejected = rejected;
	}

	public Long getPending() {
		return pending;
	}

	public void setPending(Long pending) {
		this.pending = pending;
	}
	
	

	public Long getWithdrawn() {
		return withdrawn;
	}

	public void setWithdrawn(Long withdrawn) {
		this.withdrawn = withdrawn;
	}

	public List<JobStatsDTO> getJobStatistics() {
		return jobStatistics;
	}
	
	public Long getHired() {
		return hired;
	}

	public void setHired(Long hired) {
		this.hired = hired;
	}

	public void setJobStatistics(List<JobStatsDTO> jobStatistics) {
		this.jobStatistics = jobStatistics;
	}

}
