package com.jobportal.jobportal.service;


import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.jobportal.jobportal.model.Job;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {
	private final JavaMailSender mailSender;

	public EmailService(JavaMailSender mailSender) {
		this.mailSender = mailSender;
	}
	
	public void sendApplicationMail(String email)
            throws Exception {

        MimeMessage message =
                mailSender.createMimeMessage();

        MimeMessageHelper helper =
                new MimeMessageHelper(message,true);

        helper.setTo(email);

        helper.setSubject(
                "Application Submitted Successfully"
        );

        String html = """
            <html>
            <body>
                <h2 style='color:green'>
                    Application Submitted
                </h2>

                <p>
                    Your application has been submitted.
                </p>
            </body>
            </html>
            """;

        helper.setText(html,true);

        mailSender.send(message);
    }
	
	public void sendShortlistedMail(
	        String email,
	        String jobTitle)
	        throws Exception {

	    MimeMessage message =
	            mailSender.createMimeMessage();

	    MimeMessageHelper helper =
	            new MimeMessageHelper(message,true);

	    helper.setTo(email);

	    helper.setSubject(
	            "Congratulations! You are Shortlisted"
	    );

	    String html = """
	        <html>
	        <body>

	        <h2 style='color:green'>
	        Congratulations!
	        </h2>

	        <p>
	        You have been shortlisted for:
	        <b>
	        """ + jobTitle + """
	        </b>
	        </p>

	        <p>
	        Our team will contact you soon.
	        </p>

	        </body>
	        </html>
	        """;

	    helper.setText(html,true);

	    mailSender.send(message);
	}
	
	public void sendRejectedMail(
	        String email,
	        String jobTitle)
	        throws Exception {

	    MimeMessage message =
	            mailSender.createMimeMessage();

	    MimeMessageHelper helper =
	            new MimeMessageHelper(message,true);

	    helper.setTo(email);

	    helper.setSubject(
	            "Application Status Update"
	    );

	    String html = """
	        <html>
	        <body>

	        <h2 style='color:red'>
	        Application Update
	        </h2>

	        <p>
	        Thank you for applying for
	        <b>
	        """ + jobTitle + """
	        </b>
	        </p>

	        <p>
	        Unfortunately you were not selected.
	        </p>

	        <p>
	        We encourage you to apply for future jobs.
	        </p>

	        </body>
	        </html>
	        """;

	    helper.setText(html,true);

	    mailSender.send(message);
	}
	
	public void sendSelectedMail(
	        String email,
	        String jobTitle)
	        throws Exception {

	    MimeMessage message =
	            mailSender.createMimeMessage();

	    MimeMessageHelper helper =
	            new MimeMessageHelper(message,true);

	    helper.setTo(email);

	    helper.setSubject(
	            "Congratulations! You are Selected"
	    );

	    String html = """
	        <html>
	        <body>

	        <h2 style='color:green'>
	        Congratulations!
	        </h2>

	        <p>
	        You have been selected for:
	        <b>
	        """ + jobTitle + """
	        </b>
	        </p>

	        <p>
	        Our HR team will contact you soon.
	        </p>

	        </body>
	        </html>
	        """;

	    helper.setText(html,true);

	    mailSender.send(message);
	}
	
	public void sendInterviewMail(
	        String email,
	        String jobTitle,
	        String date,
	        String time,
	        String meetingLink,
	        String remarks)
	        throws Exception {

	    MimeMessage message = mailSender.createMimeMessage();

	    MimeMessageHelper helper =
	            new MimeMessageHelper(message, true);

	    helper.setTo(email);

	    helper.setSubject("Interview Scheduled");

	    String html =
	            "<html>" +
	            "<body>" +

	            "<h2 style='color:blue'>Interview Scheduled</h2>" +

	            "<p>Your interview has been scheduled for: <b>"
	            + jobTitle +
	            "</b></p>" +

	            "<p><b>Date:</b> "
	            + date +
	            "</p>" +

	            "<p><b>Time:</b> "
	            + time +
	            "</p>" +

	            "<p><b>Meeting Link:</b><br>" +
	            "<a href='" + meetingLink + "'>" +
	            "Join Interview" +
	            "</a></p>" +

	            "<p><b>Remarks:</b> "
	            + remarks +
	            "</p>" +

	            "</body>" +
	            "</html>";

	    helper.setText(html, true);

	    mailSender.send(message);
	}
	
	public void sendOfferMail(
	        String email,
	        String jobTitle) throws Exception {

	    MimeMessage message =
	            mailSender.createMimeMessage();

	    MimeMessageHelper helper =
	            new MimeMessageHelper(message, true);

	    helper.setTo(email);

	    helper.setSubject("Job Offer 🎉");

	    String html = """
	        <html>
	        <body style="font-family:Arial">

	        <h2 style="color:green">
	        Congratulations!
	        </h2>

	        <p>
	        We are pleased to offer you the position of
	        <b>
	        """ + jobTitle + """
	        </b>.
	        </p>

	        <p>
	        Please login to the portal and respond to this offer.
	        </p>

	        <br>

	        <p>
	        Best Wishes,<br>
	        Recruitment Team
	        </p>

	        </body>
	        </html>
	        """;

	    helper.setText(html, true);

	    mailSender.send(message);
	}
	
	public void sendHiredMail(
	        String email,
	        String jobTitle) throws Exception {

	    MimeMessage message =
	            mailSender.createMimeMessage();

	    MimeMessageHelper helper =
	            new MimeMessageHelper(message, true);

	    helper.setTo(email);

	    helper.setSubject("Congratulations! You're Hired");

	    String html = """
	        <html>
	        <body style="font-family:Arial">

	        <h2 style="color:green">
	        Welcome to the Team!
	        </h2>

	        <p>

	        Congratulations!

	        </p>

	        <p>

	        You have officially been hired for

	        <b>
	        """ + jobTitle + """
	        </b>.

	        </p>

	        <p>

	        Our HR team will contact you shortly regarding your onboarding.

	        </p>

	        </body>
	        </html>
	        """;

	    helper.setText(html,true);

	    mailSender.send(message);
	}
	
	public void sendJobAlertMail(
	        String email,
	        Job job)
	        throws Exception {

	    MimeMessage message =
	            mailSender.createMimeMessage();

	    MimeMessageHelper helper =
	            new MimeMessageHelper(message,true);

	    helper.setTo(email);

	    helper.setSubject(
	            "New Job Matching Your Skills"
	    );

	    String html = """
	        <html>
	        <body>

	        <h2 style='color:blue'>
	        New Job Alert
	        </h2>

	        <p>
	        A new job matching your skills
	        has been posted.
	        </p>

	        <p>
	        <b>Title:</b>
	        """ + job.getTitle() + """
	        </p>

	        <p>
	        <b>Company:</b>
	        """ + job.getCompany() + """
	        </p>

	        <p>
	        <b>Location:</b>
	        """ + job.getLocation() + """
	        </p>

	        </body>
	        </html>
	        """;

	    helper.setText(html,true);

	    mailSender.send(message);
	}
	
	public void sendOtpMail(String email,String otp) throws Exception{
		
		 MimeMessage message =
		            mailSender.createMimeMessage();

		    MimeMessageHelper helper =
		            new MimeMessageHelper(message,true);
         helper.setTo(email);

	    String subject="Password Reset OTP";

	    String body="""
	    		
	    		<html>
	    		<body>
	            <h2>Password Reset</h2>

	            <p>Your OTP is</p>

	            <h1>%s</h1>

	            <p>This OTP is valid for 10 minutes.</p>
	            </body>
	            </html>

	            """
	            .formatted(otp);
	    
	    helper.setSubject(subject);
	    helper.setText(body,true);
	    
	    mailSender.send(message);

	    

	}
	
}
