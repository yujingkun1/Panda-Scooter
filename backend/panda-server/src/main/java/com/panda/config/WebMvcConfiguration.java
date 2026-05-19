package com.panda.config;

import com.panda.interceptor.JwtTokenAdminInterceptor;
import com.panda.interceptor.JwtTokenUserInterceptor;
import com.panda.interceptor.JwtTokenDispatcherInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class WebMvcConfiguration implements WebMvcConfigurer {

    private final JwtTokenUserInterceptor jwtTokenUserInterceptor;
    private final JwtTokenDispatcherInterceptor jwtTokenDispatcherInterceptor;
    private final JwtTokenAdminInterceptor jwtTokenAdminInterceptor;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false)
                .maxAge(3600);
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(jwtTokenUserInterceptor)
                .addPathPatterns("/user/**")
                .excludePathPatterns(
                        "/user/user/signin",
                        "/user/user/login",
                        "/user/user/verification",
                        "/user/user/password",
                        "/v3/api-docs/**",
                        "/swagger-ui/**",
                        "/swagger-ui.html",
                        "/error"
                );

        registry.addInterceptor(jwtTokenDispatcherInterceptor)
                .addPathPatterns("/dispatcher/**")
                .excludePathPatterns(
                        "/dispatcher/user/signin",
                        "/dispatcher/user/login",
                        "/dispatcher/user/verification",
                        "/dispatcher/user/password",
                        "/v3/api-docs/**",
                        "/swagger-ui/**",
                        "/swagger-ui.html",
                        "/error"
                );

        registry.addInterceptor(jwtTokenAdminInterceptor)
                .addPathPatterns("/admin/**")
                .excludePathPatterns(
                        "/admin/log/login",
                        "/v3/api-docs/**",
                        "/swagger-ui/**",
                        "/swagger-ui.html",
                        "/error"
                );
    }
}
