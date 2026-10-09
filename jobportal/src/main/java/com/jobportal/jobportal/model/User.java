package com.jobportal.jobportal.model;


import jakarta.persistence.*;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name="users")
public class User {
	@Id
	@GeneratedValue(strategy= GenerationType.IDENTITY)
	private Long id;
	
	@NotBlank(message = "Name is required")
	private String name;
	
	@Column(unique=true)
	@Email(message = "Enter a valid email")
    @NotBlank(message = "Email is required")
	private String email;
	
	@NotBlank(message = "Skill is required")
	private String skill;
	
	@Size(min = 8, message = "Password must be at least 8 characters")
	private String password;
	private String role;
	private String resumeName;
	private String resumePath;
	private String company;
	
	@OneToMany(mappedBy = "user")
	@JsonIgnore
	private List<Notification> notifications = new ArrayList<>();
	
	private String otp;

	private LocalDateTime otpExpiry;
	public User() {}
	
	
	
	public User(Long id, String name, String email, String skill, String password, String role, String company) {
		super();
		this.id = id;
		this.name = name;
		this.email = email;
		this.skill = skill;
		this.password = password;
		this.role = role;
		this.company = company;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getRole() {
		return role;
	}

	public void setRole(String role) {
		this.role = role;
	}

	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getName() {
		return name;
	}
	public String getResumeName() {
		return resumeName;
	}

	public void setResumeName(String resumeName) {
		this.resumeName = resumeName;
	}

	public String getResumePath() {
		return resumePath;
	}

	public void setResumePath(String resumePath) {
		this.resumePath = resumePath;
	}

	public void setName(String name) {
		this.name = name;
	}
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public String getSkill() {
		return skill;
	}
	public void setSkill(String skill) {
		this.skill = skill;
	}

	public String getCompany() {
		return company;
	}

	public void setCompany(String company) {
		this.company = company;
	}



	public List<Notification> getNotifications() {
		return notifications;
	}



	public void setNotifications(List<Notification> notifications) {
		this.notifications = notifications;
	}



	public String getOtp() {
		return otp;
	}



	public void setOtp(String otp) {
		this.otp = otp;
	}



	public LocalDateTime getOtpExpiry() {
		return otpExpiry;
	}



	public void setOtpExpiry(LocalDateTime otpExpiry) {
		this.otpExpiry = otpExpiry;
	}
	
	
	
	
}
