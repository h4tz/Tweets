package com.hatz.twitter.security;

import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Stateless JWT security. Public reads (GET) are open, matching Django's
 * IsAuthenticatedOrReadOnly / AllowAny permissions; everything else requires
 * authentication, which produces DRF-shaped 401/403 bodies.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {
  private final JwtAuthFilter jwtAuthFilter;
  private final DrfAuthenticationEntryPoint authenticationEntryPoint;
  private final DrfAccessDeniedHandler accessDeniedHandler;

  public SecurityConfig(
      JwtAuthFilter jwtAuthFilter,
      DrfAuthenticationEntryPoint authenticationEntryPoint,
      DrfAccessDeniedHandler accessDeniedHandler) {
    this.jwtAuthFilter = jwtAuthFilter;
    this.authenticationEntryPoint = authenticationEntryPoint;
    this.accessDeniedHandler = accessDeniedHandler;
  }

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .csrf(csrf -> csrf.disable())
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth ->
            auth
                // auth endpoints are open
                .requestMatchers(HttpMethod.POST, "/api/register/**", "/api/login/**", "/api/refresh/**")
                .permitAll()
                .requestMatchers("/api/health/**").permitAll()
                // public reads
                .requestMatchers(HttpMethod.GET, "/api/tweets/**", "/api/users/**", "/api/feed/**")
                .permitAll()
                // everything else (writes, /me/) needs a valid token
                .anyRequest()
                .authenticated())
        .exceptionHandling(ex ->
            ex.authenticationEntryPoint(authenticationEntryPoint)
                .accessDeniedHandler(accessDeniedHandler))
        .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
    return http.build();
  }

  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOriginPatterns(List.of("*"));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
  }
}
