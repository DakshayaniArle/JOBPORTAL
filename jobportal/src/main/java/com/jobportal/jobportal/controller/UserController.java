package com.jobportal.jobportal.controller;


import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.jobportal.jobportal.security.JwtUtil;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


import java.util.List;
import java.util.Optional;

import com.jobportal.jobportal.model.User;
import com.jobportal.jobportal.service.UserService;

import jakarta.validation.Valid;

import com.jobportal.jobportal.dto.*;
import com.jobportal.jobportal.exception.RecruiterNotFoundException;
import com.jobportal.jobportal.exception.UnauthorizedException;
import com.jobportal.jobportal.exception.UserNotFoundException;
import com.jobportal.jobportal.service.ResumeService;


@RestController
@RequestMapping("/users")
public class UserController {
	
	private final PasswordEncoder passwordEncoder;
	private final UserService userService;
	private final JwtUtil jwtUtil;
	private final ResumeService resumeService;
	
 
	
	public UserController(UserService userService,PasswordEncoder passwordEncoder,JwtUtil jwtUtil,ResumeService resumeService) {
		this.userService = userService;
		this.passwordEncoder = passwordEncoder;
		this.jwtUtil = jwtUtil;
		this.resumeService = resumeService;
	}
	

	
	//save users
	@PostMapping
	public User createUser(@Valid @RequestBody User user) {
		return userService.saveUser(user);
	}
	
	//get All users
	@GetMapping
	public List<User> getAllUsers(){
		return userService.getAllUsers();
	}
	
	@GetMapping("/{id}")
	public User getUserById(@PathVariable Long id, Authentication authentication) {
		User caller = userService.findByEmail(authentication.getName())
				.orElseThrow(() -> new UserNotFoundException("User not found"));
		if (!"ADMIN".equals(caller.getRole()) && !caller.getId().equals(id)) {
			throw new com.jobportal.jobportal.exception.UnauthorizedActionException("You can access only your own user details");
		}
		return userService.getUserById(id);
	}
	
	@PutMapping("/{id}")
	public User updateUser(@PathVariable Long id, @Valid @RequestBody User user, Authentication authentication) {
		User caller = userService.findByEmail(authentication.getName())
				.orElseThrow(() -> new UserNotFoundException("User not found"));
		if (!"ADMIN".equals(caller.getRole()) && !caller.getId().equals(id)) {
			throw new com.jobportal.jobportal.exception.UnauthorizedActionException("You can update only your own user details");
		}
		return userService.updateUser(id, user);
	}
	
	@DeleteMapping("/{id}")
	public void deleteUser(@PathVariable Long id, Authentication authentication) {
		User caller = userService.findByEmail(authentication.getName())
				.orElseThrow(() -> new UserNotFoundException("User not found"));
		if (!"ADMIN".equals(caller.getRole())) {
			throw new com.jobportal.jobportal.exception.UnauthorizedActionException("Only administrators can delete user accounts");
		}
		userService.deleteUser(id);
	}
	
	@PostMapping("/register")
	public User registerUser(@Valid @RequestBody User user) {
		user.setRole("USER");
		return userService.saveUser(user);
	}
	
	@PostMapping("/recruiters/register")
	public User registerRecruiter(@Valid @RequestBody User recruiter){

	    recruiter.setRole("RECRUITER");

	    return userService.saveUser(recruiter);
	}
	
	@PostMapping("/login")
	public LoginResponse  loginUser(@Valid @RequestBody LoginRequest request) {
//		User existingUser = userService.findByEmail(user.getEmail());
		User existingUser = userService.findByEmail(request.getEmail())
		        .orElseThrow(() -> new UserNotFoundException("User not found"));
		
//		System.out.println("User from DB: " + existingUser);
//
//	    if(existingUser == null){
//	        throw new RuntimeException("User not found");
//	    }
//	    
//	    boolean match = passwordEncoder.matches(user.getPassword(),existingUser.getPassword());
//	    System.out.println("Password Match "+match);
		
		if(existingUser!=null && passwordEncoder.matches(request.getPassword(),existingUser.getPassword())) {
			String token = jwtUtil.generateToken(existingUser.getEmail());
			

			LoginResponse response = new LoginResponse();

			response.setId(existingUser.getId());
			response.setName(existingUser.getName());
			response.setEmail(existingUser.getEmail());
			response.setRole(existingUser.getRole());
			response.setToken(token);

			return response;
		}
	    
//	   if(match) {
//		   return new LoginResponse(
//				   existingUser.getId(),
//					existingUser.getName(),
//					existingUser.getEmail(),
//					existingUser.getRole()
//		   );
//	   }
		
		throw new UnauthorizedException("Invalid Credentials");
	}
	
	@PostMapping("/recruiters/login")
	public LoginResponse recruiterLogin(@Valid @RequestBody RecruiterLoginRequest request){
//		System.out.println(request);
	    User recruiter = userService.findByEmail(request.getEmail())
	            .orElseThrow(() -> new RecruiterNotFoundException("Recruiter not found"));
	    

	    if(!"RECRUITER".equals(recruiter.getRole())){
	        throw new UnauthorizedException("Not a recruiter account");
	    }

	    if(passwordEncoder.matches(
	            request.getPassword(),
	            recruiter.getPassword())){

	    	String token = jwtUtil.generateToken(recruiter.getEmail());

	    	LoginResponse response = new LoginResponse();

	    	response.setId(recruiter.getId());
	    	response.setName(recruiter.getName());
	    	response.setEmail(recruiter.getEmail());
	    	response.setRole(recruiter.getRole());
	    	response.setToken(token);

	    	return response;
	    }

	    throw new UnauthorizedException("Invalid credentials");
	}
	
	
	
	@GetMapping("/profile")
	public User getProfile(Authentication authentication) {
		return userService.getPriofile(authentication.getName());
	}
	
	@PatchMapping("/profile")
	public User updateProfile(Authentication authentication,
			@Valid @RequestBody User user) {
		return userService.updateProfile(authentication.getName(), user);
	}
	
	@PostMapping("/skills")
	public User addSkill(Authentication authentication,
			@RequestBody AddSkillRequest request) {
		return userService.addSkill(authentication.getName(), request.getSkill());
	}
	
	@DeleteMapping("/skills")
	public User removeSkill(
	        Authentication authentication,
	        @RequestBody AddSkillRequest request){

	    return userService.removeSkill(
	            authentication.getName(),
	            request.getSkill());
	}
	
	@PatchMapping("/change-password")
	public String changePassword(
	        Authentication authentication,
	        @RequestBody ChangePasswordRequest request){

	    userService.changePassword(
	            authentication.getName(),
	            request.getOldPassword(),
	            request.getNewPassword());

	    return "Password changed successfully";
	}
	
	@PostMapping("/upload-resume")
	public User uploadResume(
			@RequestParam("file") MultipartFile file) throws Exception{
		
		System.out.println("===== CONTROLLER =====");
	    System.out.println("FILE NAME = " + file.getOriginalFilename());
	    System.out.println("FILE SIZE = " + file.getSize());
	    System.out.println("FILE EMPTY = " + file.isEmpty());

		 String email = 
				  SecurityContextHolder
				  .getContext()
				  .getAuthentication()
				  .getName();
		 return resumeService.uploadResume(email, file);
	}
	
	@GetMapping("/resume/{userId}")
	public ResponseEntity<Resource> downloadResume(
			@PathVariable Long userId,
			Authentication authentication) throws Exception{
		String callerEmail = authentication.getName();
		Resource resource = resumeService.downloadResume(userId, callerEmail);
		
		return ResponseEntity.ok()
				.header(
					HttpHeaders.CONTENT_DISPOSITION,
					"attachment;filename=\"" + resource.getFilename() + "\""
					)
				.body(resource);
	} 
	
	@GetMapping("/profile-completion")
	public ProfileCompletionDTO getProfileCompletion(){

	    String email =
	            SecurityContextHolder
	                    .getContext()
	                    .getAuthentication()
	                    .getName();

	    return userService
	            .getProfileCompletion(email);
	}
	
	@PostMapping("/forgot-password")
	public String forgotPassword(
	        @RequestBody ForgotPasswordRequest request) throws Exception{

	    return userService.forgotPassword(
	            request.getEmail());

	}
	@PostMapping("/verify-otp")
	public String verifyOtp(
	        @RequestBody VerifyOtpRequest request){

	    return userService.verifyOtp(
	            request.getEmail(),
	            request.getOtp());

	}
	
	@PostMapping("/reset-password")
	public String resetPassword(
	        @RequestBody ResetPasswordRequest request){

	    return userService.resetPassword(
	            request.getEmail(),
	            request.getOtp(),
	            request.getNewPassword());

	}
	
}
