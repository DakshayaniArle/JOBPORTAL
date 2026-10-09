package com.jobportal.jobportal.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.jobportal.jobportal.dto.JobStatsDTO;
import com.jobportal.jobportal.dto.RecruiterDashboardDTO;
import com.jobportal.jobportal.enums.ApplicationStatus;
import com.jobportal.jobportal.exception.RecruiterNotFoundException;
import com.jobportal.jobportal.model.Job;
import com.jobportal.jobportal.model.User;
import com.jobportal.jobportal.repository.ApplicationRepository;
import com.jobportal.jobportal.repository.JobRepository;
import com.jobportal.jobportal.repository.SavedJobRepository;
import com.jobportal.jobportal.repository.UserRepository;

@Service
public class RecruiterDashboardService {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final SavedJobRepository savedJobRepository;

    public RecruiterDashboardService(
            UserRepository userRepository,
            JobRepository jobRepository,
            ApplicationRepository applicationRepository,
            SavedJobRepository savedJobRepository){

        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.savedJobRepository = savedJobRepository;
    }

    public RecruiterDashboardDTO getDashboard(
            String recruiterEmail) {

        User recruiter =
                userRepository.findByEmail(recruiterEmail)
                .orElseThrow(() ->
                        new RecruiterNotFoundException("Recruiter not found"));

        List<Job> jobs =
                jobRepository.findByRecruiter(recruiter);

        RecruiterDashboardDTO dashboard =
                new RecruiterDashboardDTO();

        dashboard.setTotalJobs(
                (long) jobs.size());

        long totalApplications = 0;
        long totalShortlisted = 0;
        long totalRejected = 0;
        long totalPending = 0;
        long totalWithdrawn=0;
        long totalHired =0;

        List<JobStatsDTO> jobStats =
                new ArrayList<>();

        for(Job job : jobs){

            long applications =
                    applicationRepository.countByJob(job);

            long shortlisted =
                    applicationRepository.countByJobAndStatus(
                            job,
                            ApplicationStatus.SHORTLISTED);

            long rejected =
                    applicationRepository.countByJobAndStatus(
                            job,
                            ApplicationStatus.REJECTED);
            long savedCount =
                    savedJobRepository.countByJob(job);
            
            long withdrawn =
                    applicationRepository
                            .countByJobAndStatus(
                                    job,
                                    ApplicationStatus.WITHDRAWN);

            Long views = job.getViews();
            long hired = applicationRepository.countByJobAndStatus(job, ApplicationStatus.HIRED);

            long pending = applicationRepository.countByJobAndStatus(job, ApplicationStatus.APPLIED);
            
            double conversionRate = 0.0;

            if(views != null && views > 0){
                conversionRate =
                        (applications * 100.0) / views;
            }
            
            totalApplications += applications;
            totalShortlisted += shortlisted;
            totalRejected += rejected;
            totalPending += pending;
            totalWithdrawn += withdrawn;
            totalHired +=hired;

            jobStats.add(
                    new JobStatsDTO(
                            job.getId(),
                            job.getTitle(),
                            views,
                            savedCount,
                            applications,
                            shortlisted,
                            rejected,
                            pending,
                            withdrawn,
                            hired,
                            conversionRate
                    )
            );
        }

        dashboard.setTotalApplications(
                totalApplications);

        dashboard.setShortlisted(
                totalShortlisted);

        dashboard.setRejected(
                totalRejected);

        dashboard.setPending(
                totalPending);
        
        dashboard.setWithdrawn(
        		totalWithdrawn);
        dashboard.setHired(totalHired);
        

        dashboard.setJobStatistics(
                jobStats);

        return dashboard;
    }
}