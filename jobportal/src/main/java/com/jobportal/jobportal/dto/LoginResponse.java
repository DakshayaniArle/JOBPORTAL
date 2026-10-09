package com.jobportal.jobportal.dto;

public class LoginResponse {
	private Long id;
	private String name;
	private String email;
	private String role;
	private String token;
	
    public LoginResponse() {
    	
    }
	
	public LoginResponse(Long id,String name,String email,String role,String token) {
		this.id= id;
		this.name = name;
		this.email=email;
		this.role = role;
		this.token = token;
	}

	public Long getId() {
		return id;
	}

	public String getName() {
		return name;
	}

	public String getEmail() {
		return email;
	}

	public String getRole() {
		return role;
	}

	public String getToken() {
		return token;
	}

	public void setToken(String token) {
		this.token = token;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public void setName(String name) {
		this.name = name;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public void setRole(String role) {
		this.role = role;
	}
	
	
}
