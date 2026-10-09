package com.jobportal.jobportal.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.jobportal.jobportal.dto.InterviewRequest;
import com.jobportal.jobportal.enums.ApplicationStatus;
import com.jobportal.jobportal.exception.ApplicationNotFoundException;
import com.jobportal.jobportal.exception.RecruiterNotFoundException;
import com.jobportal.jobportal.exception.UnauthorizedActionException;
import com.jobportal.jobportal.exception.UserNotFoundException;
import com.jobportal.jobportal.model.Application;
import com.jobportal.jobportal.model.Interview;
import com.jobportal.jobportal.model.User;
import com.jobportal.jobportal.repository.ApplicationRepository;
import com.jobportal.jobportal.repository.InterviewRepository;
import com.jobportal.jobportal.repository.UserRepository;

@Service
public class InterviewService {
	private final InterviewRepository interviewRepository;
	private final ApplicationRepository applicationRepository;
	private final UserRepository userRepository;
	private final EmailService emailService;
	private final NotificationService notificationService;
	
	
	public InterviewService(InterviewRepository interviewRepository, ApplicationRepository applicationRepository,
			UserRepository userRepository, EmailService emailService,NotificationService notificationService) {
		this.interviewRepository = interviewRepository;
		this.applicationRepository = applicationRepository;
		this.userRepository = userRepository;
		this.emailService = emailService;
		this.notificationService = notificationService;
	}
	
	public Interview scheduleInterview(
	        InterviewRequest request,
	        String recruiterEmail) throws Exception {

	    Application application =
	            applicationRepository.findById(
	                    request.getApplicationId())
	            .orElseThrow(() ->
	                    new ApplicationNotFoundException("Application not found"));

	    User recruiter =
	            userRepository.findByEmail(recruiterEmail)
	            .orElseThrow(() ->
	                    new RecruiterNotFoundException("Recruiter not found"));

	    if(application.getJob().getRecruiter() == null) {
	        throw new UnauthorizedActionException(
	                "Recruiter not assigned to job");
	    }

	    if(!application.getJob()
	            .getRecruiter()
	            .getId()
	            .equals(recruiter.getId())) {

	        throw new UnauthorizedActionException(
	                "You can schedule interviews only for your own jobs");
	    }

	    Interview interview = new Interview();

	    interview.setApplication(application);
	    interview.setInterviewDate(request.getInterviewDate());
	    interview.setInterviewTime(request.getInterviewTime());
	    interview.setMeetingLink(request.getMeetingLink());
	    interview.setRemarks(request.getRemarks());

	    application.setStatus(
	            ApplicationStatus.INTERVIEW_SCHEDULED);

	    applicationRepository.save(application);

	    Interview savedInterview =
	            interviewRepository.save(interview);
	    
	    notificationService.createNotification(
	            application.getUser(),
	            "Interview Scheduled",
	            "Your interview is scheduled on "
	            + interview.getInterviewDate()
	            + " at "
	            + interview.getInterviewTime(),
	            "INTERVIEW"
	    );

	    emailService.sendInterviewMail(
	            application.getUser().getEmail(),
	            application.getJob().getTitle(),
	            request.getInterviewDate().toString(),
	            request.getInterviewTime().toString(),
	            request.getMeetingLink(),
	            request.getRemarks()
	    );

	    return savedInterview;
	}
	
	public List<Interview> getMyInterviews(
	        String email){

	    User user =
	            userRepository.findByEmail(email)
	            .orElseThrow(() ->
	                    new UserNotFoundException("User not found"));

	    return interviewRepository
	            .findByApplication_User(user);
	}
	
	public List<Interview> getRecruiterInterviews(
	        String recruiterEmail){

	    User recruiter =
	            userRepository.findByEmail(recruiterEmail)
	            .orElseThrow(() ->
	                    new RecruiterNotFoundException("Recruiter not found"));

	    return interviewRepository
	            .findAll()
	            .stream()
	            .filter(i ->
	                    i.getApplication()
	                     .getJob()
	                     .getRecruiter()
	                     != null
	                    &&
	                    i.getApplication()
	                     .getJob()
	                     .getRecruiter()
	                     .getId()
	                     .equals(recruiter.getId()))
	            .toList();
	}
}
