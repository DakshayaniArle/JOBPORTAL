package com.jobportal.jobportal.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.jobportal.jobportal.dto.NotificationMessage;
import com.jobportal.jobportal.exception.UserNotFoundException;
import com.jobportal.jobportal.model.Notification;
import com.jobportal.jobportal.model.User;
import com.jobportal.jobportal.repository.NotificationRepository;
import com.jobportal.jobportal.repository.UserRepository;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(NotificationRepository notificationRepository,
                               UserRepository userRepository,SimpMessagingTemplate messagingTemplate){

        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.messagingTemplate =messagingTemplate;
    }

    public void createNotification(
            User user,
            String title,
            String message,
            String type){

        // Never send JOB matching alerts to recruiters or admins
        if (("JOB".equalsIgnoreCase(type) || (title != null && title.toLowerCase().contains("job match"))) && (user.getRole() == null || !"USER".equalsIgnoreCase(user.getRole().trim()))) {
            return;
        }

        Notification notification = new Notification();

        notification.setUser(user);

        notification.setTitle(title);

        notification.setMessage(message);

        notification.setType(type);

        notification.setRead(false);

        notification.setCreatedAt(LocalDateTime.now());

        notificationRepository.save(notification);
        
        NotificationMessage notificationMessage =
                new NotificationMessage(
                        title,
                        message,
                        type
                );

        messagingTemplate.convertAndSend(
                "/topic/notifications/" + user.getEmail(),
                notificationMessage
        );


    }

    public List<Notification> getMyNotifications(String email){

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        List<Notification> list = notificationRepository.findByUserOrderByCreatedAtDesc(user);
        // If caller is not a candidate (e.g. recruiter or admin), filter out any JOB matching alerts
        if (!"USER".equalsIgnoreCase(user.getRole())) {
            return list.stream()
                    .filter(n -> !"JOB".equalsIgnoreCase(n.getType()) && (n.getTitle() == null || !n.getTitle().toLowerCase().contains("job match")))
                    .toList();
        }

        return list;

    }

    public long unreadCount(String email){

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (!"USER".equalsIgnoreCase(user.getRole())) {
            return notificationRepository.findByUserAndIsReadFalse(user).stream()
                    .filter(n -> !"JOB".equalsIgnoreCase(n.getType()) && (n.getTitle() == null || !n.getTitle().toLowerCase().contains("job match")))
                    .count();
        }

        return notificationRepository.countByUserAndIsReadFalse(user);

    }

    public void markAllAsRead(String email){
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        List<Notification> unreadList = notificationRepository.findByUserAndIsReadFalse(user);
        for(Notification n : unreadList){
            n.setRead(true);
        }
        notificationRepository.saveAll(unreadList);
    }

    public void markAsRead(Long notificationId, String email){
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if(notification.getUser() != null && notification.getUser().getId().equals(user.getId())){
            notification.setRead(true);
            notificationRepository.save(notification);
        }
    }

}