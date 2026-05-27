package com.example.projectManager.config;

import com.example.projectManager.model.User;
import com.example.projectManager.repo.UserRepo;
import com.example.projectManager.service.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private UserRepo userRepo;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

//        String path = request.getServletPath();
//        if (path.startsWith("/auth")) {
//            filterChain.doFilter(request, response);
//            return;
//        }

        String authHeader = request.getHeader("Authorization");
        String token = null;
        String email = null;

        if(authHeader != null && authHeader.startsWith("Bearer ")){
            token = authHeader.substring(7);      //  remove "Bearer "
            email = jwtUtil.extractEmail(token);
        }
        if(email != null && SecurityContextHolder.getContext().getAuthentication() == null){

            User user = userRepo.findByEmail(email) .orElseThrow(() -> new RuntimeException("User Not Found"));
            if(jwtUtil.validateToken(token)){

                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        user.getEmail(),
                        null,
                        List.of()
                );
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        filterChain.doFilter(request, response);
    }
}
