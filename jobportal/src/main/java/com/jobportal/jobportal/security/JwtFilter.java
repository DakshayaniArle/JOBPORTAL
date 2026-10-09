package com.jobportal.jobportal.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.jobportal.jobportal.model.User;
import com.jobportal.jobportal.repository.UserRepository;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.IOException;
import java.util.List;


@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public JwtFilter(JwtUtil jwtUtil,UserRepository userRepository){
        this.jwtUtil = jwtUtil;
		this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if(authHeader != null && authHeader.startsWith("Bearer ")){

            String token = authHeader.substring(7);

            if(jwtUtil.validateToken(token)){
                String email = jwtUtil.extractEmail(token);

                System.out.println("Valid Token for: " + email);
                
      
                User user = userRepository.findByEmail(email).orElse(null);

                if (user != null && user.getRole() != null && !user.getRole().isBlank()) {

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    email,
                                    null,
                                    List.of(new SimpleGrantedAuthority(user.getRole()))
                            );

                    SecurityContextHolder.getContext().setAuthentication(authentication);

                    System.out.println("Authentication Set: "
                            + SecurityContextHolder.getContext().getAuthentication());
                }
            }
        }
        
//        System.out.println("URI = " + request.getRequestURI());

        filterChain.doFilter(request,response);
    }
}