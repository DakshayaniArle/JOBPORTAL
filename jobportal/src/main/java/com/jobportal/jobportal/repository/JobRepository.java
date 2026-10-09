package com.jobportal.jobportal.repository;

import java.util.List;

import org.springframework.boot.data.autoconfigure.web.DataWebProperties.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.jobportal.jobportal.enums.JobType;
import com.jobportal.jobportal.model.Job;
import com.jobportal.jobportal.model.User;

public interface JobRepository extends JpaRepository<Job,Long>{


	List<Job> findByTitleContainingIgnoreCase(String keyword);
	
	@Query("""
			SELECT j FROM Job j
			WHERE
			(:title IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :title, '%')))
			AND
			(:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%')))
			AND
			(:company IS NULL OR LOWER(j.company) LIKE LOWER(CONCAT('%', :company, '%')))
			AND
			(:skill IS NULL OR LOWER(j.requiredSkills) LIKE LOWER(CONCAT('%', :skill, '%')))
			AND
			(:jobType IS NULL OR j.jobType = :jobType)
			AND
			(:experience IS NULL OR j.experience <= :experience)
			AND
			(:minSalary IS NULL OR j.salary >= :minSalary)
			""")
			List<Job> filterJobs(
			        @Param("title") String title,
			        @Param("location") String location,
			        @Param("company") String company,
			        @Param("skill") String skill,
			        @Param("jobType") JobType jobType,
			        @Param("experience") Integer experience,
			        @Param("minSalary") Double minSalary
			);
	   List<Job> findByRecruiter(User recruiter);
	   Page<Job> findByActiveTrue(org.springframework.data.domain.Pageable pageable);
}
 