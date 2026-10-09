package com.jobportal.jobportal.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.jobportal.jobportal.model.Job;
import com.jobportal.jobportal.model.User;
import com.jobportal.jobportal.repository.UserRepository;

@Service
public class JobAlertService {
	private final UserRepository userRepository;
	private final EmailService emailService;
	private final NotificationService notificationService;
	
	
	public JobAlertService(UserRepository userRepository, EmailService emailService,NotificationService notificationService) {
		this.userRepository = userRepository;
		this.emailService = emailService;
		this.notificationService = notificationService;
	}
	
	public void notifyUsers(Job job)
	        throws Exception {

	    List<User> users =
	            userRepository.findAll();

	    for(User user : users){

	        // Only candidates (USER role) should receive skill match alerts; recruiters and admins should never receive them
	        if(user.getRole() == null || !"USER".equalsIgnoreCase(user.getRole().trim())){
	            continue;
	        }

	        if(user.getSkill() == null || user.getSkill().trim().isEmpty())
	            continue;

	        String userSkills =
	                user.getSkill().toLowerCase();

	        if(job.getRequiredSkills() == null || job.getRequiredSkills().trim().isEmpty())
	            continue;

	        String requiredSkills =
	                job.getRequiredSkills()
	                        .toLowerCase();

	        boolean match = false;

	        for(String skill :
	                requiredSkills.split(",")){

	            if(userSkills.contains(
	                    skill.trim())){

	                match = true;
	                break;
	            }
	        }

	        if(match){

	            emailService.sendJobAlertMail(
	                    user.getEmail(),
	                    job
	            );
	            
	            notificationService.createNotification(
	                    user,
	                    "New Job Match",
	                    "A new " + job.getTitle() + " job matches your skills.",
	                    "JOB"
	            );
	        }
	    }
	}
	
}
