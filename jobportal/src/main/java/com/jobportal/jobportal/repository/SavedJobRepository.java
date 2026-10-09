
package com.jobportal.jobportal.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jobportal.jobportal.model.Job;
import com.jobportal.jobportal.model.SavedJob;
import com.jobportal.jobportal.model.User;


public interface SavedJobRepository extends JpaRepository<SavedJob,Long>{ 
	List<SavedJob> findByUser(User user);
	
	boolean existsByUserAndJob(User user, Job job);
	
	void deleteByUserAndJob(User user,Job job);
	
	long countByJob(Job job);
	
	long countByUser(User user);
	
	
}