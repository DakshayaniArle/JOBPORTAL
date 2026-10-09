package com.jobportal.jobportal.exception;

public class SavedJobNotFoundException extends RuntimeException {

    public SavedJobNotFoundException(String message) {
        super(message);
    }

}