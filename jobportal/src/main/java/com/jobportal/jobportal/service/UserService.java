package com.jobportal.jobportal.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Random;

import org.springframework.stereotype.Service;

import com.jobportal.jobportal.dto.ProfileCompletionDTO;
import com.jobportal.jobportal.exception.InvalidOtpException;
import com.jobportal.jobportal.exception.InvalidRequestException;
import com.jobportal.jobportal.exception.UserNotFoundException;
import com.jobportal.jobportal.model.User;
import com.jobportal.jobportal.repository.UserRepository;

import org.springframework.boot.context.config.ConfigDataResourceNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;


@Service
public class UserService {
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final EmailService emailService;
	
	public UserService(UserRepository userRepository,PasswordEncoder passwordEncoder,EmailService emailService) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.emailService = emailService;
	}
	
	public User saveUser(User user) {
		user.setPassword(passwordEncoder.encode(user.getPassword()));
		return userRepository.save(user);
	}
	
	public List<User> getAllUsers(){
		return userRepository.findAll();
	}
	
	public User getUserById(Long id) {
		return userRepository.findById(id).orElseThrow(()-> new UserNotFoundException("User not found"));
	}
	
	public User updateUser(Long id,User userDetails) {
		User user = userRepository.findById(id).orElseThrow(()->new UserNotFoundException("User not found"));
		
		if(user!=null) {
			user.setName(userDetails.getName());
			user.setEmail(userDetails.getEmail());
			user.setSkill(userDetails.getSkill());
			
			return userRepository.save(user);
		}
		
		return null;
	}
	
	public void deleteUser(Long id) {
		userRepository.deleteById(id);
	}

	public Optional<User> findByEmail(String email){
		return userRepository.findByEmail(email);
	}
	
	public User getPriofile(String email) {
		return userRepository.findByEmail(email)
				.orElseThrow(()->new UserNotFoundException("User not found"));
	}
	public User updateProfile(String email, User updatedUser) {
		
		User user = userRepository.findByEmail(email)
				.orElseThrow(()->new UserNotFoundException("User not found"));
		
		if(updatedUser.getName() != null) {
			user.setName(updatedUser.getName());
		}
		
		if(updatedUser.getEmail()!=null) {
			user.setEmail(updatedUser.getEmail());
		}
		
		return userRepository.save(user);
	}
	
	public User addSkill(String email,String skill) {
		User user = userRepository.findByEmail(email)
		.orElseThrow(()->new UserNotFoundException("User not found"));
		
		String existedSkills = user.getSkill();
		
		if(existedSkills == null || existedSkills.isEmpty()) {
			user.setSkill(skill);
		}
		else {
			if(!existedSkills.contains(skill)) {
				user.setSkill(existedSkills + ","+skill); 
			}
		}
		
		return userRepository.save(user);
	}
	
	public User removeSkill(String email, String skill) {
		User user = userRepository.findByEmail(email)
				.orElseThrow(()->new UserNotFoundException("User not found"));
		String skills = user.getSkill();
		if(skills==null) {
			return user;
		}
		String updatedSkills = skills
				.replace(skill+",","")
				.replace(","+skill, "")
				.replace(skill, "");
		
		user.setSkill(updatedSkills);
		
		return userRepository.save(user);
	}
	
	public void changePassword(String email,String oldPassword,String newPassword) {
		User user = userRepository.findByEmail(email)
				.orElseThrow(()->new UserNotFoundException("User not found"));
		if(!passwordEncoder.matches(oldPassword, user.getPassword())) {
			throw new InvalidRequestException("Old password incorrect");
		}
		
		user.setPassword(passwordEncoder.encode(newPassword));
		userRepository.save(user);
	}
	
	public ProfileCompletionDTO getProfileCompletion(
	        String email){

	    User user = userRepository.findByEmail(email)
	            .orElseThrow(() ->
	                    new UserNotFoundException("User not found"));

	    int score = 0;

	    List<String> missingFields =
	            new ArrayList<>();


	    if(user.getName() != null &&
	            !user.getName().isBlank()){

	        score += 20;
	    }
	    else{
	        missingFields.add("Name");
	    }


	    if(user.getEmail() != null &&
	            !user.getEmail().isBlank()){

	        score += 20;
	    }
	    else{
	        missingFields.add("Email");
	    }


	    if(user.getSkill() != null &&
	            !user.getSkill().isBlank()){

	        score += 20;
	    }
	    else{
	        missingFields.add("Skills");
	    }


	    if(user.getResumePath() != null &&
	            !user.getResumePath().isBlank()){

	        score += 20;
	    }
	    else{
	        missingFields.add("Resume");
	    }


	    if(user.getRole().equals("RECRUITER")){

	        if(user.getCompany() != null &&
	                !user.getCompany().isBlank()){

	            score += 20;
	        }
	        else{
	            missingFields.add("Company");
	        }
	    }
	    else{

	        score += 20;
	    }

	    ProfileCompletionDTO dto =
	            new ProfileCompletionDTO();

	    dto.setCompletionPercentage(score);
	    dto.setMissingFields(missingFields);

	    return dto;
	}
	
	private String generateOtp() {

	    Random random = new Random();

	    return String.valueOf(100000 + random.nextInt(900000));

	}
	
	public String forgotPassword(String email) throws Exception {

	    User user = userRepository.findByEmail(email)
	            .orElseThrow(() -> new UserNotFoundException("User not found"));

	    String otp = generateOtp();

	    user.setOtp(otp);

	    user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));

	    userRepository.save(user);

	    emailService.sendOtpMail(
	            email,
	            otp
	    );

	    return "OTP sent successfully.";

	}
	
	public String verifyOtp(String email,String otp){

	    User user = userRepository.findByEmail(email)
	            .orElseThrow(() -> new UserNotFoundException("User not found"));

	    if(user.getOtp()==null)
	        throw new InvalidRequestException("OTP not generated");

	    if(!user.getOtp().equals(otp))
	        throw new InvalidOtpException("Invalid OTP");

	    if(user.getOtpExpiry().isBefore(LocalDateTime.now()))
	        throw new InvalidRequestException("OTP expired");

	    return "OTP verified successfully";

	}
	
	public String resetPassword(
	        String email,
	        String otp,
	        String newPassword){

	    User user = userRepository.findByEmail(email)
	            .orElseThrow(() -> new UserNotFoundException("User not found"));

	    if(!user.getOtp().equals(otp))
	        throw new InvalidOtpException("Invalid OTP");

	    if(user.getOtpExpiry().isBefore(LocalDateTime.now()))
	        throw new InvalidRequestException("OTP expired");

	    user.setPassword(passwordEncoder.encode(newPassword));

	    user.setOtp(null);

	    user.setOtpExpiry(null);

	    userRepository.save(user);

	    return "Password updated successfully";

	}
}
