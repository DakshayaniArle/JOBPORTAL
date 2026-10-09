package com.jobportal.jobportal.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jobportal.jobportal.enums.ApplicationStatus;
import com.jobportal.jobportal.model.Application;
import com.jobportal.jobportal.model.Job;
import com.jobportal.jobportal.model.User;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
	List<Application> findByUser(User user);
	boolean existsByUserAndJob(User user, Job job);
	List<Application> findByJob(Job job);
	long countByJob(Job job);

    long countByJobAndStatus(Job job, ApplicationStatus status);
    long countByUser(User user);

    long countByUserAndStatus(
            User user,
            ApplicationStatus status);
}