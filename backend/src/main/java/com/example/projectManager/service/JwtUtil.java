package com.example.projectManager.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class JwtUtil {

    private static final String SECRET = "mysecretkeymysecretkeymysecretkeymysecretkey";

    public String generateToken(String email, String name){

        return Jwts.builder()
                .setSubject(email)
                .claim("name",name)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60))      // 1 hr
                .signWith(SignatureAlgorithm.HS256, SECRET)
                .compact();
    }

    public String extractEmail(String token){

        return Jwts.parser()
                .setSigningKey(SECRET)
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public boolean validateToken(String token){
        try {
            extractEmail(token);
            return true;
        }
        catch (Exception e){
            return false;
        }
    }

}
