package com.jobportal.jobportal.service;



import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import com.jobportal.jobportal.repository.*;
import com.jobportal.jobportal.enums.ApplicationStatus;
import com.jobportal.jobportal.exception.ApplicationNotFoundException;
import com.jobportal.jobportal.exception.JobNotFoundException;
import com.jobportal.jobportal.exception.RecruiterNotFoundException;
import com.jobportal.jobportal.exception.ResourceAlreadyExistsException;
import com.jobportal.jobportal.exception.UnauthorizedActionException;
import com.jobportal.jobportal.exception.UnauthorizedException;
import com.jobportal.jobportal.exception.UserNotFoundException;
import com.jobportal.jobportal.model.*;

@Service
public class ApplicationService {
	private final ApplicationRepository applicationRepository;
	private final  JobRepository jobRepository;
	private final UserRepository userRepository;
	private final EmailService emailService;
	private final NotificationService notificationService;
	
	
	
	public ApplicationService(ApplicationRepository applicationRepository, JobRepository jobRepository,
			UserRepository userRepository, EmailService emailService,NotificationService notificationService) {
		this.applicationRepository = applicationRepository;
		this.jobRepository = jobRepository;
		this.userRepository = userRepository;
		this.emailService = emailService;
		this.notificationService=notificationService;
	}

	public Application applyJob(Long jobId,String email) throws Exception {
		Job  job = jobRepository.findById(jobId)
				.orElseThrow(() -> new JobNotFoundException("Job not Found"));
		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new UserNotFoundException("User not Found"));
		Application application = new Application();
		
		if(!job.isActive()){
		    throw new JobNotFoundException("Job is closed.");
		}

		if(job.getExpiryDate().isBefore(LocalDate.now())){
		    throw new JobNotFoundException("Job has expired.");
		}
		
		if(applicationRepository.existsByUserAndJob(user, job)){
		    throw new ResourceAlreadyExistsException("Already applied for this job");
		}
		
		application.setUser(user);
		application.setJob(job);	
		application.setAppliedDate(LocalDate.now());
		application.setStatus(ApplicationStatus.APPLIED);
		Application savedApplication =  applicationRepository.save(application);
		
		notificationService.createNotification(
		        user,
		        "Application Submitted",
		        "Your application for " + job.getTitle() + " has been submitted successfully.",
		        "APPLICATION"
		);

		if (job.getRecruiter() != null) {
			notificationService.createNotification(
			        job.getRecruiter(),
			        "New Application Received",
			        user.getName() + " applied for your job opening: " + job.getTitle(),
			        "APPLICATION"
			);
		}
		
		emailService.sendApplicationMail(
				user.getEmail()
		);
		
		return savedApplication;
	}
	
	public List<Application> getMyApplications(String email) {

	    User user = userRepository.findByEmail(email)
	            .orElseThrow(() -> new UserNotFoundException("User not found"));

	    return applicationRepository.findByUser(user);
	}
	
	public List<Application> getApplicationsByJob(Long jobId) {

	    Job job = jobRepository.findById(jobId)
	            .orElseThrow(() -> new JobNotFoundException("Job not found"));

	    return applicationRepository.findByJob(job);
	}

	public List<Application> getApplicationsByJob(Long jobId, String email) {

	    Job job = jobRepository.findById(jobId)
	            .orElseThrow(() -> new JobNotFoundException("Job not found"));

	    User caller = userRepository.findByEmail(email)
	            .orElseThrow(() -> new UserNotFoundException("User not found"));

	    if ("RECRUITER".equals(caller.getRole())) {
	        if (job.getRecruiter() == null || !job.getRecruiter().getId().equals(caller.getId())) {
	            throw new UnauthorizedActionException("You can view applications only for your own jobs");
	        }
	    } else if (!"ADMIN".equals(caller.getRole())) {
	        throw new UnauthorizedActionException("Access denied");
	    }

	    return applicationRepository.findByJob(job);
	}
	
	
	public List<Application> getApplicantsForRecruiterJob(Long jobId, String email){

	    Job job = jobRepository.findById(jobId)
	            .orElseThrow(() -> new JobNotFoundException("Job not found"));

	    User recruiter = userRepository.findByEmail(email)
	            .orElseThrow(() -> new RecruiterNotFoundException("Recruiter not found"));

	    if(!job.getRecruiter().getId().equals(recruiter.getId())){
	        throw new UnauthorizedActionException("You can only view applicants for your own jobs");
	    }
 
	    return applicationRepository.findByJob(job);
	}
	
	private void sendStatusMail(Application application) throws Exception {

	    ApplicationStatus status = application.getStatus();

	    if(status == ApplicationStatus.SHORTLISTED) {

	        emailService.sendShortlistedMail(
	                application.getUser().getEmail(),
	                application.getJob().getTitle()
	        );
	        
	        notificationService.createNotification(
	                application.getUser(),
	                "Application Shortlisted",
	                "Congratulations! Your application for " + application.getJob().getTitle() + " has been shortlisted.",
	                "STATUS"
	        );
	    }

	    else if(status==ApplicationStatus.REJECTED) {

	        emailService.sendRejectedMail(
	                application.getUser().getEmail(),
	                application.getJob().getTitle()
	        );
	        
	        notificationService.createNotification(
	                application.getUser(),
	                "Application Rejected",
	                "Your application for " + application.getJob().getTitle() + " was not selected.",
	                "STATUS"
	        );
	    }
	    
	    else if(status == ApplicationStatus.SELECTED){

	        emailService.sendSelectedMail(
	                application.getUser().getEmail(),
	                application.getJob().getTitle()
	        );
	    }
	    
	    else if(status == ApplicationStatus.OFFERED) {
	    	emailService.sendOfferMail(
	    			application.getUser().getEmail(),
	    			application.getJob().getTitle());
	    	notificationService.createNotification(
	    			application.getUser(),
	    			"Job Offer Received! 🎉",
	    			"Congratulations! You received a job offer for " + application.getJob().getTitle() + " at " + application.getJob().getCompany() + ". Please review and accept.",
	    			"OFFER"
	    	);
	    }
	    
	    else if(status == ApplicationStatus.HIRED) {
	    	emailService.sendHiredMail(
	    			application.getUser().getEmail(),
	    			application.getJob().getTitle());
	    	notificationService.createNotification(
	    			application.getUser(),
	    			"Officially Hired! 🎊",
	    			"Congratulations! You have been hired for " + application.getJob().getTitle() + " at " + application.getJob().getCompany() + "!",
	    			"HIRED"
	    	);
	    }
	}
	
	public Application updateStatus(
	        Long applicationId,
	        ApplicationStatus status) throws Exception {

	    Application application =
	            applicationRepository.findById(applicationId)
	            .orElseThrow(() ->
	                    new ApplicationNotFoundException("Application Not Found"));

	    application.setStatus(status);

	    Application savedApplication =
	            applicationRepository.save(application);

	    sendStatusMail(savedApplication);

	    return savedApplication;
	}
	
	public Application recruiterUpdateStatus(
	        Long applicationId,
	        ApplicationStatus status,
	        String recruiterEmail) throws Exception {

	    Application application =
	            applicationRepository.findById(applicationId)
	            .orElseThrow(() ->
	                    new ApplicationNotFoundException("Application not found"));

	    User recruiter =
	            userRepository.findByEmail(recruiterEmail)
	            .orElseThrow(() ->
	                    new RecruiterNotFoundException("Recruiter not found"));

	    if(!application.getJob()
	            .getRecruiter()
	            .getId()
	            .equals(recruiter.getId())) {

	        throw new UnauthorizedActionException(
	                "You can update only your own job applications"
	        );
	    }
	    
	    ApplicationStatus currentStatus =
	            application.getStatus();


	    if(!isValidTransition(currentStatus, status)){
	        throw new RuntimeException(
	                "Invalid status transition from "
	                + currentStatus
	                + " to "
	                + status);
	    }

	    application.setStatus(status);


	    Application saved =
	            applicationRepository.save(application);

	    sendStatusMail(saved);

	    return saved;
	}
	
	public Application withdrawApplication(
	        Long applicationId,
	        String userEmail){

	    Application application =
	            applicationRepository.findById(applicationId)
	            .orElseThrow(() ->
	                    new ApplicationNotFoundException(
	                            "Application not found"));

	    // Only applicant can withdraw
	    if(!application.getUser()
	            .getEmail()
	            .equals(userEmail)){

	        throw new UnauthorizedActionException(
	                "You can withdraw only your own application");
	    }

	    // Optional validation
	    if(application.getStatus() ==
	            ApplicationStatus.SHORTLISTED){

	        throw new UnauthorizedActionException(
	                "Shortlisted applications cannot be withdrawn");
	    }
	    
	    if(application.getStatus() == ApplicationStatus.OFFERED
	            || application.getStatus() == ApplicationStatus.ACCEPTED
	            || application.getStatus() == ApplicationStatus.HIRED){

	        throw new UnauthorizedActionException(
	                "Application cannot be withdrawn now.");
	    }

	    application.setStatus(
	            ApplicationStatus.WITHDRAWN);

	    Application saved = applicationRepository.save(application);

	    if (application.getJob() != null && application.getJob().getRecruiter() != null) {
	        notificationService.createNotification(
	                application.getJob().getRecruiter(),
	                "Application Withdrawn",
	                application.getUser().getName() + " withdrew their application for " + application.getJob().getTitle(),
	                "APPLICATION"
	        );
	    }

	    notificationService.createNotification(
	            application.getUser(),
	            "Application Withdrawn",
	            "You withdrew your application for " + application.getJob().getTitle(),
	            "APPLICATION"
	    );

	    return saved;
	}
	
	public Application acceptOffer(
	        Long applicationId,
	        String email){

	    Application application =
	            applicationRepository.findById(applicationId)
	            .orElseThrow(() ->
	                    new ApplicationNotFoundException("Application not found"));

	    if(!application.getUser().getEmail().equals(email)){
	        throw new UnauthorizedActionException(
	                "You can accept only your own offer");
	    }

	    if(application.getStatus()
	            != ApplicationStatus.OFFERED){

	        throw new UnauthorizedException(
	                "Offer has not been made yet");
	    }

	    application.setStatus(
	            ApplicationStatus.ACCEPTED);

	    Application saved = applicationRepository.save(application);

	    if (application.getJob() != null && application.getJob().getRecruiter() != null) {
	        notificationService.createNotification(
	                application.getJob().getRecruiter(),
	                "Offer Accepted! 🎉",
	                application.getUser().getName() + " has accepted the job offer for " + application.getJob().getTitle() + "!",
	                "OFFER"
	        );
	    }

	    notificationService.createNotification(
	            application.getUser(),
	            "Offer Accepted! 🎉",
	            "You accepted the offer for " + application.getJob().getTitle() + ". Next step: Hired!",
	            "OFFER"
	    );

	    return saved;
	}
	
	private boolean isValidTransition(
	        ApplicationStatus currentStatus,
	        ApplicationStatus newStatus){

	    switch (currentStatus){

	        case APPLIED:
	            return newStatus == ApplicationStatus.SHORTLISTED
	                    || newStatus == ApplicationStatus.REJECTED;

	        case SHORTLISTED:
	            return newStatus == ApplicationStatus.INTERVIEW_SCHEDULED
	                    || newStatus == ApplicationStatus.REJECTED;

	        case INTERVIEW_SCHEDULED:
	            return newStatus == ApplicationStatus.OFFERED
	                    || newStatus == ApplicationStatus.REJECTED;

	        case OFFERED:
	            return newStatus == ApplicationStatus.REJECTED;

	        case ACCEPTED:
	            return newStatus == ApplicationStatus.HIRED;

	        default:
	            return false;
	    }
	}
} 
