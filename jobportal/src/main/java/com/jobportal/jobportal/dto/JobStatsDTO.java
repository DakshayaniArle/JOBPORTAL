package com.jobportal.jobportal.dto;

public class JobStatsDTO {
	private Long jobId;
	private String jobTitle;
	private Long views;
	private Long savedCount;
	private Long applications;
	private Long shortlisted;
	private Long rejected;
	private Long pending;
	private Long withdrawn;
	private Long hired;
	private Double conversionRate;
	
	public JobStatsDTO() {}
	
	

	public JobStatsDTO(Long jobId, String jobTitle, Long views, Long savedCount, Long applications, Long shortlisted,
			Long rejected, Long pending, Long withdrawn, Long hired, Double conversionRate) {
		this.jobId = jobId;
		this.jobTitle = jobTitle;
		this.views = views;
		this.savedCount = savedCount;
		this.applications = applications;
		this.shortlisted = shortlisted;
		this.rejected = rejected;
		this.pending = pending;
		this.withdrawn = withdrawn;
		this.hired = hired;
		this.conversionRate = conversionRate;
	}



	public Long getJobId() {
		return jobId;
	}


	public void setJobId(Long jobId) {
		this.jobId = jobId;
	}


	public String getJobTitle() {
		return jobTitle;
	}


	public void setJobTitle(String jobTitle) {
		this.jobTitle = jobTitle;
	}


	public Long getApplications() {
		return applications;
	}


	public void setApplications(Long applicatons) {
		this.applications = applicatons;
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

	public Long getViews() {
		return views;
	}

	public void setViews(Long views) {
		this.views = views;
	}

	public Long getSavedCount() {
		return savedCount;
	}

	public void setSavedCount(Long savedCount) {
		this.savedCount = savedCount;
	}
	

	public Long getWithdrawn() {
		return withdrawn;
	}

	public void setWithdrawn(Long withdrawn) {
		this.withdrawn = withdrawn;
	}

	public Double getConversionRate() {
		return conversionRate;
	}

	public void setConversionRate(Double conversionRate) {
		this.conversionRate = conversionRate;
	}

	public Long getHired() {
		return hired;
	}

	public void setHired(Long hired) {
		this.hired = hired;
	}
	
	
}
