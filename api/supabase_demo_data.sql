-- NeighBid demo data
-- Run in: Supabase Dashboard → SQL Editor → New query

-- Neighbourhoods
INSERT INTO neighbourhoods (id, name, centroid_lat, centroid_lng) VALUES
  (1, 'West Adams, Los Angeles',  34.0326, -118.3331),
  (2, 'Koreatown, Los Angeles',   34.0617, -118.3006),
  (3, 'Echo Park, Los Angeles',   34.0782, -118.2606);

-- Users (hashed_password NULL — auth via Supabase Auth)
INSERT INTO users (id, email, full_name, phone, role, neighborhood, address, latitude, longitude, neighbourhood_id, is_verified) VALUES
  (1, 'alice@neighbid.com',   'Alice Smith',       '(310) 555-0101', 'homeowner', 'West Adams',  '42 Oak Lane, Los Angeles, CA 90016',     34.0326, -118.3331, 1, TRUE),
  (2, 'marcus@neighbid.com',  'Marcus Johnson',    '(310) 555-0102', 'homeowner', 'West Adams',  '87 Adams Blvd, Los Angeles, CA 90016',   34.0311, -118.3298, 1, TRUE),
  (3, 'priya@neighbid.com',   'Priya Patel',       '(323) 555-0103', 'homeowner', 'Koreatown',   '3200 Wilshire Blvd #4B, LA, CA 90010',  34.0617, -118.3006, 2, TRUE),
  (4, 'profix@neighbid.com',  'ProFix Plumbing',   '(213) 555-0201', 'provider',  'West Adams',  '900 La Brea Ave, Los Angeles, CA 90019', 34.0400, -118.3370, 1, TRUE),
  (5, 'greenlawn@neighbid.com','GreenLawn Co',      '(310) 555-0202', 'provider',  'West Adams',  '1200 Crenshaw Blvd, LA, CA 90019',       34.0355, -118.3394, 1, TRUE),
  (6, 'sparkclean@neighbid.com','SparkClean LA',    '(323) 555-0203', 'provider',  'Koreatown',   '450 S Vermont Ave, LA, CA 90020',        34.0580, -118.2920, 2, TRUE),
  (7, 'admin@neighbid.com',   'HOA Admin',         '(310) 555-0301', 'admin',     'West Adams',  '100 Community Dr, Los Angeles, CA 90016',34.0320, -118.3340, 1, TRUE);

-- HOA
INSERT INTO hoas (id, name, neighborhood, admin_user_id, type, unit_count, master_invite_code) VALUES
  (1, 'West Adams Community HOA', 'West Adams, Los Angeles', 7, 'HOA', 48, 'WESTADAMS2024');

-- Community members
INSERT INTO community_members (user_id, hoa_id, eligibility, address) VALUES
  (1, 1, 'verified', '42 Oak Lane, Los Angeles, CA 90016'),
  (2, 1, 'verified', '87 Adams Blvd, Los Angeles, CA 90016'),
  (3, 1, 'pending',  '3200 Wilshire Blvd #4B, LA, CA 90010');

-- Provider profiles
INSERT INTO provider_profiles (user_id, company_name, bio, trades, service_radius_mi, address, neighborhood, working_hours_start, working_hours_end, working_days, is_insured, is_licensed) VALUES
  (4, 'ProFix Plumbing',  'Licensed plumber with 12 years in the LA basin. Specialise in leak repair, drain clearing and fixture installs.',
      'plumbing',  8, '900 La Brea Ave, LA 90019', 'West Adams', '07:00', '18:00', 'Mon,Tue,Wed,Thu,Fri,Sat', TRUE,  TRUE),
  (5, 'GreenLawn Co',     'Full-service lawn and garden care for residential and multi-unit properties. Free group-rate quotes.',
      'lawn,gutter', 10, '1200 Crenshaw Blvd, LA 90019', 'West Adams', '07:00', '17:00', 'Mon,Tue,Wed,Thu,Fri,Sat', TRUE,  FALSE),
  (6, 'SparkClean LA',    'Move-in/move-out, post-reno and recurring cleaning. HEPA equipment, eco products.',
      'cleaning',  6, '450 S Vermont Ave, LA 90020',  'Koreatown',  '08:00', '18:00', 'Mon,Tue,Wed,Thu,Fri',     FALSE, FALSE);

-- Homeowner profiles
INSERT INTO homeowner_profiles (user_id, service_radius_mi, notif_bids, notif_groups, notif_savings) VALUES
  (1, 4, TRUE, TRUE,  TRUE),
  (2, 4, TRUE, FALSE, TRUE),
  (3, 4, TRUE, TRUE,  FALSE);

-- Request groups
INSERT INTO request_groups (id, category, neighbourhood_id, neighborhood, status, grouping_closes_at, created_by_user_id) VALUES
  (1, 'lawn',     1, 'West Adams', 'bidding',  '2026-06-20 23:59:00', 1),
  (2, 'plumbing', 1, 'West Adams', 'grouping', '2026-06-18 23:59:00', 2);

-- Service requests
INSERT INTO service_requests (id, user_id, group_id, title, description, category, neighborhood, status, budget_min, budget_max) VALUES
  (1, 1, 1, 'Front yard lawn mowing + edging',
      'Full front yard mow, edge along driveway and footpath, blow clippings. Approx 800 sq ft.',
      'lawn', 'West Adams', 'live', 8000, 15000),
  (2, 2, 1, 'Backyard lawn care and trim',
      'Mow backyard, trim hedges along fence line, remove clippings. About 600 sq ft.',
      'lawn', 'West Adams', 'live', 7000, 13000),
  (3, 1, NULL, 'Kitchen sink drain — slow + gurgling',
      'Kitchen sink drains slowly and gurgles when the washing machine runs. Need inspection and clearing.',
      'plumbing', 'West Adams', 'live', 15000, 35000),
  (4, 2, NULL, 'Gutter cleaning before rainy season',
      'Two-storey home. Front and back gutters full of debris. Need clearing and downspout flush.',
      'gutter', 'West Adams', 'live', 12000, 22000),
  (5, 3, NULL, 'Move-out deep clean — 2 bed/1 bath condo',
      'Moving out end of June. Need full deep clean including oven, bathroom, inside cabinets, floors.',
      'cleaning', 'Koreatown', 'closed', 18000, 28000),
  (6, 1, NULL, 'HVAC tune-up before summer heat',
      'Central AC unit hasn''t been serviced in 2 years. Needs annual maintenance before LA summer.',
      'hvac', 'West Adams', 'live', 10000, 20000);

-- Group members
INSERT INTO group_members (group_id, user_id, request_id, approval_status) VALUES
  (1, 1, 1, 'approved'),
  (1, 2, 2, 'approved');

-- Bids
INSERT INTO bids (id, request_id, provider_id, amount, estimated_days, work_days_csv, status) VALUES
  (1, 1, 5, 9500,  1, 'Sat',         'pending'),
  (2, 1, 4, 11000, 1, 'Sat,Sun',     'pending'),
  (3, 2, 5, 8500,  1, 'Sat',         'pending'),
  (4, 3, 4, 22000, 2, 'Mon,Tue',     'accepted'),
  (5, 3, 6, 27500, 2, 'Wed,Thu',     'declined'),
  (6, 4, 5, 16500, 1, 'Fri',         'pending'),
  (7, 5, 6, 22000, 1, 'Mon',         'accepted'),
  (8, 5, 4, 26000, 1, 'Tue',         'declined'),
  (9, 6, 4, 14500, 1, 'Thu',         'pending');

-- Reviews (for closed request #5)
INSERT INTO reviews (provider_id, homeowner_id, bid_id, stars, comment, tag) VALUES
  (6, 3, 7, 5, 'SparkClean were on time, thorough and left the place spotless. Would 100% rebook.', 'Reliable'),
  (4, 1, 4, 5, 'ProFix diagnosed the issue fast and fixed the drain same day. Very professional.', 'Great communication');

-- Schedule items (ProFix — upcoming jobs)
INSERT INTO schedule_items (provider_id, request_id, title, address, scheduled_at, duration_minutes, status) VALUES
  (4, 3, 'Kitchen Drain Fix — Alice Smith',  '42 Oak Lane, LA 90016',        '2026-06-14 09:00:00', 120, 'scheduled'),
  (5, 1, 'Lawn Mow — Adams Blvd Group',      '42 Oak Lane, LA 90016',         '2026-06-15 08:00:00',  90, 'scheduled'),
  (5, 2, 'Lawn Mow — Adams Blvd Group',      '87 Adams Blvd, LA 90016',       '2026-06-15 10:00:00',  90, 'scheduled'),
  (6, 5, 'Deep Clean — Priya Patel',         '3200 Wilshire Blvd #4B, LA',    '2026-06-11 09:00:00', 240, 'completed');

-- Conversations (Alice ↔ ProFix)
INSERT INTO conversations (id, user_a_id, user_b_id) VALUES
  (1, 1, 4),
  (2, 3, 6);

-- Messages
INSERT INTO messages (sender_id, conversation_id, text) VALUES
  (1, 1, 'Hi ProFix — will you need access to the crawl space for the drain job?'),
  (4, 1, 'Hi Alice! Yes, briefly — just to inspect the main line. Takes about 10 mins. I''ll bring a flashlight.'),
  (1, 1, 'Perfect, I''ll leave the side gate unlocked. See you Saturday.'),
  (3, 2, 'Hi SparkClean — do you bring your own supplies or should I have anything ready?'),
  (6, 2, 'We bring everything! Just make sure we have water access. You don''t need to do anything. 😊'),
  (3, 2, 'Great, see you Monday at 9.');

-- Group channels (for the lawn group)
INSERT INTO group_channels (id, request_id) VALUES
  (1, 1);

INSERT INTO channel_members (channel_id, user_id) VALUES
  (1, 1),
  (1, 2),
  (1, 5);

INSERT INTO messages (sender_id, channel_id, text) VALUES
  (1, 1, 'Hey Marcus — GreenLawn just submitted a group bid at $180 total. That''s $90 each, down from $95 solo. Worth it!'),
  (2, 1, 'Nice! I''m in. Let''s accept.'),
  (5, 1, 'Thanks for grouping — I can do both yards back to back on Saturday morning. Confirm and I''ll lock in the slot.');

-- HOA tables
INSERT INTO hoa_announcements (hoa_id, title, body, pinned, created_by_id) VALUES
  (1, 'Summer Community Cleanup — June 21', 'Join us for our annual block cleanup. Supplies provided. Meet at the community garden at 9am.', 1, 7),
  (1, 'Water Restriction Reminder', 'LA DWP Stage 2 restrictions are in effect. Please water lawns before 9am or after 6pm only.', 0, 7);

INSERT INTO hoa_rules (hoa_id, title, description, sort_order, created_by_id) VALUES
  (1, 'Noise Hours',        'No loud noise between 10pm and 7am on weekdays, 11pm and 8am on weekends.', 1, 7),
  (1, 'Trash Bin Schedule', 'Bins must be brought in within 24 hours of collection. Do not leave on the street overnight.', 2, 7),
  (1, 'Parking Policy',     'Visitor parking limited to 48 hours. Contact admin for extended stay permits.', 3, 7);

INSERT INTO hoa_polls (hoa_id, title, description, category, budget_min, budget_max, status, closes_at, created_by_id) VALUES
  (1, 'Install EV Charging Stations in Car Park?',
      'Proposal to install 4 Level 2 EV chargers in the common car park. Cost shared across all units.',
      'Infrastructure', 800000, 1200000, 'open', '2026-06-30 23:59:00', 7),
  (1, 'Repaint Common Hallways',
      'The hallway paint is overdue for a refresh. Vote on whether to proceed this summer.',
      'Maintenance', 200000, 400000, 'open', '2026-06-25 23:59:00', 7);

-- Notifications
INSERT INTO notifications (user_id, type, title, body, action_url, read) VALUES
  (1, 'bid',         'New bid on your drain request',   'ProFix Plumbing bid $220 on "Kitchen sink drain — slow + gurgling"', '/homeowner/bids', FALSE),
  (2, 'group_alert', 'Your lawn request joined a group', 'Your request was matched with a neighbor. Group bid saved you $15.',  '/homeowner/bids', FALSE),
  (3, 'bid',         'Your cleaning bid was accepted',   'You accepted SparkClean LA''s bid. Job confirmed for June 11.',        '/homeowner/bids', TRUE);

-- Reset sequences so future INSERTs get correct IDs
SELECT setval(pg_get_serial_sequence('neighbourhoods',  'id'), (SELECT MAX(id) FROM neighbourhoods),  TRUE);
SELECT setval(pg_get_serial_sequence('users',           'id'), (SELECT MAX(id) FROM users),           TRUE);
SELECT setval(pg_get_serial_sequence('hoas',            'id'), (SELECT MAX(id) FROM hoas),            TRUE);
SELECT setval(pg_get_serial_sequence('request_groups',  'id'), (SELECT MAX(id) FROM request_groups),  TRUE);
SELECT setval(pg_get_serial_sequence('service_requests','id'), (SELECT MAX(id) FROM service_requests),TRUE);
SELECT setval(pg_get_serial_sequence('bids',            'id'), (SELECT MAX(id) FROM bids),            TRUE);
SELECT setval(pg_get_serial_sequence('conversations',   'id'), (SELECT MAX(id) FROM conversations),   TRUE);
SELECT setval(pg_get_serial_sequence('group_channels',  'id'), (SELECT MAX(id) FROM group_channels),  TRUE);
SELECT setval(pg_get_serial_sequence('messages',        'id'), (SELECT MAX(id) FROM messages),        TRUE);
SELECT setval(pg_get_serial_sequence('schedule_items',  'id'), (SELECT MAX(id) FROM schedule_items),  TRUE);
SELECT setval(pg_get_serial_sequence('reviews',         'id'), (SELECT MAX(id) FROM reviews),         TRUE);
SELECT setval(pg_get_serial_sequence('notifications',   'id'), (SELECT MAX(id) FROM notifications),   TRUE);
SELECT setval(pg_get_serial_sequence('community_members','id'),(SELECT MAX(id) FROM community_members),TRUE);
SELECT setval(pg_get_serial_sequence('provider_profiles','id'),(SELECT MAX(id) FROM provider_profiles),TRUE);
SELECT setval(pg_get_serial_sequence('homeowner_profiles','id'),(SELECT MAX(id) FROM homeowner_profiles),TRUE);
SELECT setval(pg_get_serial_sequence('group_members',   'id'), (SELECT MAX(id) FROM group_members),   TRUE);
SELECT setval(pg_get_serial_sequence('channel_members', 'id'), (SELECT MAX(id) FROM channel_members), TRUE);
SELECT setval(pg_get_serial_sequence('hoa_announcements','id'),(SELECT MAX(id) FROM hoa_announcements),TRUE);
SELECT setval(pg_get_serial_sequence('hoa_rules',       'id'), (SELECT MAX(id) FROM hoa_rules),       TRUE);
SELECT setval(pg_get_serial_sequence('hoa_polls',       'id'), (SELECT MAX(id) FROM hoa_polls),       TRUE);
