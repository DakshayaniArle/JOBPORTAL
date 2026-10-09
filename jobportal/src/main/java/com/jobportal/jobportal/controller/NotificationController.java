package com.jobportal.jobportal.controller;

import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.jobportal.jobportal.model.Notification;
import com.jobportal.jobportal.service.NotificationService;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService){
        this.notificationService = notificationService;
    }

    @GetMapping("/my")
    public List<Notification> myNotifications(){

        String email =
                SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        return notificationService.getMyNotifications(email);
    }

    @GetMapping("/unread-count")
    public long unreadCount(){

        String email =
                SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        return notificationService.unreadCount(email);
    }

    @PutMapping("/mark-all-read")
    public void markAllAsRead(){
        String email =
                SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();
        notificationService.markAllAsRead(email);
    }

    @PutMapping("/read-all")
    public void readAll(){
        String email =
                SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();
        notificationService.markAllAsRead(email);
    }

    @PutMapping("/{id}/read")
    public void markAsRead(@PathVariable Long id){
        String email =
                SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();
        notificationService.markAsRead(id, email);
    }

}
