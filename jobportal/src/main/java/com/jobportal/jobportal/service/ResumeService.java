package com.jobportal.jobportal.service;

import com.jobportal.jobportal.exception.InvalidRequestException;
import com.jobportal.jobportal.exception.UnauthorizedActionException;
import com.jobportal.jobportal.exception.UserNotFoundException;
import com.jobportal.jobportal.model.Application;
import com.jobportal.jobportal.model.User;
import com.jobportal.jobportal.repository.ApplicationRepository;
import com.jobportal.jobportal.repository.UserRepository;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ResumeService {
	private final UserRepository userRepository;
	private final ApplicationRepository applicationRepository;
	
	public ResumeService(UserRepository userRepository, ApplicationRepository applicationRepository) {
		this.userRepository = userRepository;
		this.applicationRepository = applicationRepository;
	}
	
	public User uploadResume(String email,MultipartFile file) throws Exception{
		User user = userRepository.findByEmail(email)
				.orElseThrow(()-> new UserNotFoundException("User not found"));
		
		String uploadDir = "uploads/";
		
		String fileName = 
				System.currentTimeMillis()+
				"_" + 
				file.getOriginalFilename();
		Path path = Paths.get(uploadDir, fileName);
		Files.copy(
				file.getInputStream(), 
				path, 
				StandardCopyOption.REPLACE_EXISTING);
		user.setResumeName(file.getOriginalFilename());
		user.setResumePath(path.toString());
		
		return userRepository.save(user);
	}
	
	public Resource downloadResume(Long userId, String callerEmail) throws Exception {
		User caller = userRepository.findByEmail(callerEmail)
				.orElseThrow(() -> new UserNotFoundException("Caller not found"));
		User targetUser = userRepository.findById(userId)
				.orElseThrow(() -> new UserNotFoundException("User not found"));

		// Admins can download any resume
		if ("ADMIN".equals(caller.getRole())) {
			// allowed
		} else if ("USER".equals(caller.getRole())) {
			// Candidates can only download their own resume
			if (!caller.getId().equals(userId)) {
				throw new UnauthorizedActionException("You can access only your own resume");
			}
		} else if ("RECRUITER".equals(caller.getRole())) {
			// Recruiters can download resume only if candidate applied to at least one of their posted jobs
			List<Application> apps = applicationRepository.findByUser(targetUser);
			boolean isApplicantToRecruiter = apps.stream().anyMatch(a ->
					a.getJob() != null &&
					a.getJob().getRecruiter() != null &&
					a.getJob().getRecruiter().getId().equals(caller.getId())
			);
			if (!isApplicantToRecruiter) {
				throw new UnauthorizedActionException("You can access resumes only for candidates who applied to your posted jobs");
			}
		} else {
			throw new UnauthorizedActionException("Access denied");
		}

		if (targetUser.getResumePath() == null) {
			throw new InvalidRequestException("Resume not uploaded");
		}

		Path path = Paths.get(targetUser.getResumePath());
		return new UrlResource(path.toUri());
	}

	public Resource downloadResume(Long userId) throws Exception {
		User user = userRepository.findById(userId)
				.orElseThrow(()-> new UserNotFoundException("User not found"));
		if(user.getResumePath()==null) {
			throw new InvalidRequestException("Resume not uploaded");
		}
		
		Path path = Paths.get(user.getResumePath());
		
		return new UrlResource(path.toUri()); 
	}
		 
}
