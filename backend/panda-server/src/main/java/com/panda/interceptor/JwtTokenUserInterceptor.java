package com.panda.interceptor;

import com.panda.context.BaseContext;
import com.panda.exception.BaseException;
import com.panda.properties.JwtProperties;
import com.panda.utils.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
public class JwtTokenUserInterceptor implements HandlerInterceptor {

    private final JwtProperties jwtProperties;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String token = request.getHeader("Authorization");
        if (token == null || token.isBlank()) {
            throw new BaseException("NOT_LOGIN");
        }
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        try {
            Claims claims = JwtUtil.parseJWT(jwtProperties.getSecretKey(), token);
            Long userId = Long.valueOf(claims.get("userId").toString());
            BaseContext.setCurrentId(userId);
            return true;
        } catch (Exception e) {
            throw new BaseException("登录失效");
        }
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        BaseContext.removeCurrentId();
    }
}
