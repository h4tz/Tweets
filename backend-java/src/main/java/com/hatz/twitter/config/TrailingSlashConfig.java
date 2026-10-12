package com.hatz.twitter.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Django serves its routes with trailing slashes (/api/register/) while this
 * app maps them without. Enable trailing-slash matching so both variants work,
 * like the Express version does by default.
 */
@Configuration
public class TrailingSlashConfig implements WebMvcConfigurer {
  @Override
  public void configurePathMatch(PathMatchConfigurer configurer) {
    configurer.setUseTrailingSlashMatch(true);
  }
}
