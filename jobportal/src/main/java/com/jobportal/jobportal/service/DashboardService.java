package com.jobportal.jobportal.service;

import org.springframework.stereotype.Service;

import com.jobportal.jobportal.repository.*;
import com.jobportal.jobportal.dto.CandidateDashboardDTO;
import com.jobportal.jobportal.dto.DashboardResponse;
import com.jobportal.jobportal.enums.ApplicationStatus;
import com.jobportal.jobportal.exception.UserNotFoundException;
import com.jobportal.jobportal.model.User;

@Service
public class DashboardService {
	
	private final UserRepository userRepository;
	private final JobRepository jobRepository;
	private final ApplicationRepository applicationRepository;
	private final InterviewRepository interviewRepository;
	private final SavedJobRepository savedJobRepository;
	
	public DashboardService(UserRepository userRepository,
			JobRepository jobRepository,
			ApplicationRepository applicationRepository,
			InterviewRepository interviewRepository,
			SavedJobRepository savedJobRepository) {
		this.userRepository = userRepository;
		this.jobRepository = jobRepository;
		this.applicationRepository = applicationRepository;
		this.interviewRepository = interviewRepository;
		this.savedJobRepository = savedJobRepository;
	}
	
	public DashboardResponse getDashboardStats() {
		long totalJobs = jobRepository.count();
		long totalUsers = userRepository.count();
		long totalApplications = applicationRepository.count();
		
		
		return new DashboardResponse(totalUsers,totalJobs,totalApplications);
	}
	
	public CandidateDashboardDTO getCandidateDashboard(
	        String email){

	    User user =
	            userRepository.findByEmail(email)
	            .orElseThrow(() ->
	                    new UserNotFoundException("User not found"));

	    CandidateDashboardDTO dto =
	            new CandidateDashboardDTO();

	    dto.setTotalApplications(
	            applicationRepository.countByUser(user));

	    dto.setSavedJobs(
	            savedJobRepository.countByUser(user));

	    dto.setShortlisted(
	            applicationRepository.countByUserAndStatus(
	                    user,
	                    ApplicationStatus.SHORTLISTED));

	    dto.setSelected(
	            applicationRepository.countByUserAndStatus(
	                    user,
	                    ApplicationStatus.SELECTED));

	    dto.setRejected(
	            applicationRepository.countByUserAndStatus(
	                    user,
	                    ApplicationStatus.REJECTED));
	    dto.setWithdrawn(
	    		applicationRepository.countByUserAndStatus(user, ApplicationStatus.WITHDRAWN));

	    dto.setInterviews(
	            applicationRepository.countByUserAndStatus(
	                    user,
	                    ApplicationStatus.INTERVIEW_SCHEDULED));
	    dto.setOffers(
	    		applicationRepository.countByUserAndStatus(
	    				user,
	    				ApplicationStatus.OFFERED));
	    dto.setHired(
	    		applicationRepository.countByUserAndStatus(
	    				user,
	    				ApplicationStatus.HIRED));
	    dto.setPending(
	    		applicationRepository.countByUserAndStatus(
	    				user,
	    				ApplicationStatus.APPLIED));

	    long total =
	            applicationRepository.countByUser(user);

	    long shortlisted =
	            applicationRepository.countByUserAndStatus(
	                    user,
	                    ApplicationStatus.SHORTLISTED);

	    long selected =
	            applicationRepository.countByUserAndStatus(
	                    user,
	                    ApplicationStatus.SELECTED);

	    long rejected =
	            applicationRepository.countByUserAndStatus(
	                    user,
	                    ApplicationStatus.REJECTED);
	    long withdrawn = 
	    		applicationRepository.countByUserAndStatus(user, ApplicationStatus.WITHDRAWN);

	   long hired = applicationRepository.countByUserAndStatus(user, ApplicationStatus.HIRED);
	   
	   long offers = applicationRepository.countByUserAndStatus(user, ApplicationStatus.OFFERED);
	   
	   long pending  = applicationRepository.countByUserAndStatus(user, ApplicationStatus.APPLIED);

	    return dto;
	}
	
}
