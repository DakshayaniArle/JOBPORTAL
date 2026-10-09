package com.jobportal.jobportal.exception;

import java.time.LocalDateTime;

public class ErrorResponse {

    private boolean success;

    private int status;

    private String message;

    private LocalDateTime timestamp;

    public ErrorResponse() {
    }

    public ErrorResponse(boolean success,
                         int status,
                         String message,
                         LocalDateTime timestamp) {

        this.success = success;
        this.status = status;
        this.message = message;
        this.timestamp = timestamp;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

}