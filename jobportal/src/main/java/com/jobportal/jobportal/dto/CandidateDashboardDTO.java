package com.jobportal.jobportal.dto;

public class CandidateDashboardDTO {
	private long totalApplications;
	private long savedJobs;
	private long shortlisted;
	private long interviews;
	private long selected;
	private long rejected;
	private long pending;
	private long withdrawn;
	private long hired;
	private long offers;
	public long getTotalApplications() {
		return totalApplications;
	}
	public void setTotalApplications(long totalApplications) {
		this.totalApplications = totalApplications;
	}
	public long getSavedJobs() {
		return savedJobs;
	}
	public void setSavedJobs(long savedJobs) {
		this.savedJobs = savedJobs;
	}
	public long getShortlisted() {
		return shortlisted;
	}
	public void setShortlisted(long shortlisted) {
		this.shortlisted = shortlisted;
	}
	public long getInterviews() {
		return interviews;
	}
	public void setInterviews(long interviews) {
		this.interviews = interviews;
	}
	public long getSelected() {
		return selected;
	}
	public void setSelected(long selected) {
		this.selected = selected;
	}
	public long getRejected() {
		return rejected;
	}
	public void setRejected(long rejected) {
		this.rejected = rejected;
	}
	public long getPending() {
		return pending;
	}
	public void setPending(long pending) {
		this.pending = pending;
	}
	public long getWithdrawn() {
		return withdrawn;
	}
	public void setWithdrawn(long withdrawn) {
		this.withdrawn = withdrawn;
	}
	public long getHired() {
		return hired;
	}
	public void setHired(long hired) {
		this.hired = hired;
	}
	public long getOffers() {
		return offers;
	}
	public void setOffers(long offers) {
		this.offers = offers;
	}
	
}
