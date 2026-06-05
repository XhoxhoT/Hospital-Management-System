package com.backend.hospital.Configuration;

import com.backend.hospital.Security.JwtAuthFilter;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/swagger-ui-custom.html", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .requestMatchers("/actuator/**").permitAll()
                // Admin-only: departments and users
                .requestMatchers(HttpMethod.POST, "/api/departments").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/departments/**").hasRole("ADMIN")
                .requestMatchers("/admin/**").hasRole("ADMIN")
                // Rooms and beds: ADMIN or privileged DEPARTMENT_STAFF (DEPT_WRITE authority)
                .requestMatchers(HttpMethod.POST, "/api/rooms/room").hasAnyAuthority("ROLE_ADMIN", "DEPT_WRITE")
                .requestMatchers(HttpMethod.POST, "/api/bed/beds").hasAnyAuthority("ROLE_ADMIN", "DEPT_WRITE")
                .requestMatchers(HttpMethod.PATCH, "/api/rooms/**").hasAnyAuthority("ROLE_ADMIN", "DEPT_WRITE")
                .requestMatchers(HttpMethod.PATCH, "/api/beds/*/name").hasAnyAuthority("ROLE_ADMIN", "DEPT_WRITE")
                .requestMatchers(HttpMethod.DELETE, "/api/rooms/**").hasAnyAuthority("ROLE_ADMIN", "DEPT_WRITE")
                .requestMatchers(HttpMethod.DELETE, "/api/beds/**").hasAnyAuthority("ROLE_ADMIN", "DEPT_WRITE")
                // Bed status changes: privileged DEPARTMENT_STAFF or ADMIN
                .requestMatchers(HttpMethod.POST, "/api/beds/*/occupy").hasAnyAuthority("ROLE_ADMIN", "DEPT_WRITE")
                .requestMatchers(HttpMethod.PATCH, "/api/beds/*/status").hasAnyAuthority("ROLE_ADMIN", "DEPT_WRITE")
                // Everything else: any authenticated user
                .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write(
                        "{\"code\":\"UNAUTHORIZED\",\"message\":\"Authentication required\"}"
                    );
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType("application/json");
                    response.getWriter().write(
                        "{\"code\":\"ACCESS_DENIED\",\"message\":\"You do not have permission to perform this action\"}"
                    );
                })
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("http://localhost:*", "http://127.0.0.1:*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
