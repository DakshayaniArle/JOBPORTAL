package com.jobportal.jobportal.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jobportal.jobportal.model.Interview;
import com.jobportal.jobportal.model.Application;
import com.jobportal.jobportal.model.User;

public interface InterviewRepository
        extends JpaRepository<Interview, Long> {

    List<Interview> findByApplication_User(User user);

    Interview findByApplication(Application application);
    
    List<Interview> findAll();
}