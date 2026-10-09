package com.jobportal.jobportal.model;



import com.jobportal.jobportal.enums.JobType;


import jakarta.persistence.*;
import jakarta.validation.constraints.*;


import java.time.LocalDate;
 
@Entity
public class Job {
	 
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@NotBlank(message = "Job title is required")
	private String title;
	
	@NotBlank(message = "Company is required")
	private String company;
	
	@Column(nullable=false)
	private Long views= 0L;
	private String description;
	
	@NotBlank(message = "Location is required")
	private String location;
	
	@Positive(message = "Salary must be greater than 0")
	private Double salary;
	private Integer experience;
	private String experienceLevel;
	
	@Enumerated(EnumType.STRING)
	private JobType jobType;
	
	@NotBlank(message = "Required skills are required")
	private String requiredSkills;
	
	@ManyToOne
	private User recruiter;
	private LocalDate postedDate;
	private LocalDate expiryDate;
	private boolean active;
	
	public Job() {}
	

	public Job(Long id, String title, String company, String description, String location, Double salary,
			Integer experience, JobType jobType, String requiredSkills, User recruiter) {
		super();
		this.id = id;
		this.title = title;
		this.company = company;
		this.description = description;
		this.location = location;
		this.salary = salary;
		this.experience = experience;
		this.jobType = jobType;
		this.requiredSkills = requiredSkills;
		this.recruiter = recruiter;
	}

	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getTitle() {
		return title;
	}
	public void setTitle(String title) {
		this.title = title;
	}
	public String getCompany() {
		return company;
	}
	public void setCompany(String company) {
		this.company = company;
	}
	public String getDescription() {
		return description;
	}
	public void setDescription(String description) {
		this.description = description;
	}
	public String getLocation() {
		return location;
	}
	public void setLocation(String location) {
		this.location = location;
	}
	public Double getSalary() {
		return salary;
	}
	public void setSalary(Double salary) {
		this.salary = salary;
	}
	public Integer getExperience() {
		return experience;
	}

	public void setExperience(Integer experience) {
		this.experience = experience;
	}

	public String getExperienceLevel() {
		return experienceLevel;
	}

	public void setExperienceLevel(String experienceLevel) {
		this.experienceLevel = experienceLevel;
	}

	
	public JobType getJobType() {
		return jobType;
	}


	public void setJobType(JobType jobType) {
		this.jobType = jobType;
	}


	public String getRequiredSkills() {
		return requiredSkills;
	}
	public void setRequiredSkills(String requiredSkills) {
		this.requiredSkills = requiredSkills;
	}

	public User getRecruiter() {
		return recruiter;
	}

	public void setRecruiter(User recruiter) {
		this.recruiter = recruiter;
	}


	public Long getViews() {
		return views;
	}


	public void setViews(Long views) {
		this.views = views;
	}


	public LocalDate getPostedDate() {
		return postedDate;
	}


	public void setPostedDate(LocalDate postedDate) {
		this.postedDate = postedDate;
	}


	public LocalDate getExpiryDate() {
		return expiryDate;
	}


	public void setExpiryDate(LocalDate expiryDate) {
		this.expiryDate = expiryDate;
	}


	public boolean isActive() {
		return active;
	}


	public void setActive(boolean active) {
		this.active = active;
	}
	
	
	
}
