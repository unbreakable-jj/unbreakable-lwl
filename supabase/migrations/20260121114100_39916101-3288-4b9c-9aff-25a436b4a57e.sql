-- Add CHECK constraints for input validation

-- Runs table constraints
ALTER TABLE public.runs 
  ADD CONSTRAINT check_distance_positive 
    CHECK (distance_km > 0 AND distance_km < 1000),
  ADD CONSTRAINT check_duration_positive 
    CHECK (duration_seconds > 0 AND duration_seconds < 86400),
  ADD CONSTRAINT check_pace_reasonable
    CHECK (pace_per_km_seconds IS NULL OR (pace_per_km_seconds >= 60 AND pace_per_km_seconds <= 1800)),
  ADD CONSTRAINT check_speed_reasonable
    CHECK (average_speed_kph IS NULL OR (average_speed_kph >= 0.5 AND average_speed_kph <= 50)),
  ADD CONSTRAINT check_elevation_reasonable
    CHECK (elevation_gain_m IS NULL OR (elevation_gain_m >= 0 AND elevation_gain_m < 10000)),
  ADD CONSTRAINT check_calories_reasonable
    CHECK (calories_burned IS NULL OR (calories_burned >= 0 AND calories_burned < 50000)),
  ADD CONSTRAINT check_title_length
    CHECK (title IS NULL OR char_length(title) <= 200),
  ADD CONSTRAINT check_description_length
    CHECK (description IS NULL OR char_length(description) <= 5000),
  ADD CONSTRAINT check_notes_length
    CHECK (notes IS NULL OR char_length(notes) <= 5000),
  ADD CONSTRAINT check_weather_length
    CHECK (weather_conditions IS NULL OR char_length(weather_conditions) <= 100),
  ADD CONSTRAINT check_polyline_length
    CHECK (route_polyline IS NULL OR char_length(route_polyline) <= 500000);

-- Profiles table constraints  
ALTER TABLE public.profiles 
  ADD CONSTRAINT check_username_format 
    CHECK (username IS NULL OR (username ~ '^[a-zA-Z0-9_]{3,30}$')),
  ADD CONSTRAINT check_display_name_length 
    CHECK (display_name IS NULL OR (char_length(display_name) >= 1 AND char_length(display_name) <= 100)),
  ADD CONSTRAINT check_bio_length 
    CHECK (bio IS NULL OR char_length(bio) <= 500),
  ADD CONSTRAINT check_location_length
    CHECK (location IS NULL OR char_length(location) <= 100);

-- Comments table constraints
ALTER TABLE public.comments 
  ADD CONSTRAINT check_content_length 
    CHECK (char_length(content) > 0 AND char_length(content) <= 2000),
  ADD CONSTRAINT check_content_not_whitespace
    CHECK (trim(content) != '');

-- Segments table constraints
ALTER TABLE public.segments
  ADD CONSTRAINT check_segment_name_length
    CHECK (char_length(name) > 0 AND char_length(name) <= 100),
  ADD CONSTRAINT check_segment_description_length
    CHECK (description IS NULL OR char_length(description) <= 500),
  ADD CONSTRAINT check_segment_distance_positive
    CHECK (distance_m > 0 AND distance_m < 100000),
  ADD CONSTRAINT check_segment_elevation_reasonable
    CHECK (elevation_gain_m IS NULL OR (elevation_gain_m >= 0 AND elevation_gain_m < 10000));

-- Segment efforts constraints
ALTER TABLE public.segment_efforts
  ADD CONSTRAINT check_effort_time_positive
    CHECK (elapsed_time_seconds > 0 AND elapsed_time_seconds < 86400),
  ADD CONSTRAINT check_effort_rank_positive
    CHECK (rank IS NULL OR rank > 0);

-- Medals table constraints
ALTER TABLE public.medals
  ADD CONSTRAINT check_medal_name_length
    CHECK (char_length(name) > 0 AND char_length(name) <= 100),
  ADD CONSTRAINT check_medal_code_length
    CHECK (char_length(code) > 0 AND char_length(code) <= 50),
  ADD CONSTRAINT check_medal_description_length
    CHECK (description IS NULL OR char_length(description) <= 500);

-- Personal records constraints
ALTER TABLE public.personal_records
  ADD CONSTRAINT check_pr_distance_positive
    CHECK (distance_km IS NULL OR (distance_km > 0 AND distance_km < 1000)),
  ADD CONSTRAINT check_pr_time_positive
    CHECK (time_seconds IS NULL OR (time_seconds > 0 AND time_seconds < 86400)),
  ADD CONSTRAINT check_pr_pace_reasonable
    CHECK (pace_per_km_seconds IS NULL OR (pace_per_km_seconds >= 60 AND pace_per_km_seconds <= 1800));