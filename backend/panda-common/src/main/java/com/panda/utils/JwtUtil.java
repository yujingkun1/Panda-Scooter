package com.panda.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

public class JwtUtil {

    private JwtUtil() {
    }

    public static String createJWT(String secretKey, Long ttlMillis, Map<String, Object> claims) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + ttlMillis);
        return Jwts.builder()
                .claims(claims)
                .issuedAt(now)
                .expiration(exp)
                .signWith(getSecretKey(secretKey), SignatureAlgorithm.HS256)
                .compact();
    }

    public static Claims parseJWT(String secretKey, String token) {
        return Jwts.parser()
                .verifyWith(getSecretKey(secretKey))
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private static SecretKey getSecretKey(String secretKey) {
        return Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
    }
}
