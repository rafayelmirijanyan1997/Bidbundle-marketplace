-- NeighBid schema for Supabase PostgreSQL
-- Run this in: Supabase Dashboard → SQL Editor → New query → Run

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- neighbourhoods (no dependencies)
CREATE TABLE IF NOT EXISTS neighbourhoods (
    id           SERIAL PRIMARY KEY,
    name         VARCHAR NOT NULL,
    centroid_lat FLOAT NOT NULL,
    centroid_lng FLOAT NOT NULL,
    created_at   TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL
);

-- users (community_id FK to hoas added after hoas is created)
CREATE TABLE IF NOT EXISTS users (
    id               SERIAL PRIMARY KEY,
    email            VARCHAR NOT NULL UNIQUE,
    hashed_password  VARCHAR,
    full_name        VARCHAR NOT NULL,
    phone            VARCHAR,
    role             VARCHAR NOT NULL,
    neighborhood     VARCHAR,
    address          VARCHAR,
    latitude         FLOAT,
    longitude        FLOAT,
    neighbourhood_id INTEGER REFERENCES neighbourhoods(id),
    community_id     INTEGER,
    unit_number      VARCHAR,
    is_verified      BOOLEAN DEFAULT FALSE NOT NULL,
    created_at       TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL,
    supabase_uid     UUID UNIQUE
);

CREATE INDEX IF NOT EXISTS ix_users_email ON users(email);

-- hoas (depends on users)
CREATE TABLE IF NOT EXISTS hoas (
    id                SERIAL PRIMARY KEY,
    name              VARCHAR NOT NULL,
    neighborhood      VARCHAR NOT NULL,
    admin_user_id     INTEGER NOT NULL REFERENCES users(id),
    type              VARCHAR,
    unit_count        INTEGER,
    master_invite_code VARCHAR UNIQUE,
    created_at        TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL
);

-- Now add the FK from users.community_id → hoas
ALTER TABLE users ADD CONSTRAINT fk_users_community
    FOREIGN KEY (community_id) REFERENCES hoas(id)
    NOT VALID;

-- request_groups (depends on users, neighbourhoods)
CREATE TABLE IF NOT EXISTS request_groups (
    id                  SERIAL PRIMARY KEY,
    category            VARCHAR NOT NULL,
    neighbourhood_id    INTEGER REFERENCES neighbourhoods(id),
    neighborhood        VARCHAR NOT NULL,
    status              VARCHAR NOT NULL,
    grouping_closes_at  TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    created_at          TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL,
    created_by_user_id  INTEGER NOT NULL REFERENCES users(id)
);

-- service_requests (depends on users, request_groups)
CREATE TABLE IF NOT EXISTS service_requests (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id),
    group_id    INTEGER REFERENCES request_groups(id),
    title       VARCHAR NOT NULL,
    description VARCHAR NOT NULL,
    category    VARCHAR NOT NULL,
    neighborhood VARCHAR NOT NULL,
    status      VARCHAR NOT NULL,
    budget_min  INTEGER NOT NULL,
    budget_max  INTEGER NOT NULL,
    created_at  TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL,
    closes_at   TIMESTAMP WITHOUT TIME ZONE
);

-- bids (depends on service_requests, users)
CREATE TABLE IF NOT EXISTS bids (
    id             SERIAL PRIMARY KEY,
    request_id     INTEGER NOT NULL REFERENCES service_requests(id),
    provider_id    INTEGER NOT NULL REFERENCES users(id),
    amount         INTEGER NOT NULL,
    estimated_days INTEGER NOT NULL,
    work_days_csv  VARCHAR NOT NULL,
    status         VARCHAR NOT NULL,
    created_at     TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL
);

-- community_members (depends on users, hoas)
CREATE TABLE IF NOT EXISTS community_members (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id),
    hoa_id      INTEGER NOT NULL REFERENCES hoas(id),
    eligibility VARCHAR NOT NULL,
    address     VARCHAR NOT NULL,
    join_date   TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL,
    created_at  TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL
);

-- activity_log (depends on hoas)
CREATE TABLE IF NOT EXISTS activity_log (
    id          SERIAL PRIMARY KEY,
    hoa_id      INTEGER NOT NULL REFERENCES hoas(id),
    description VARCHAR NOT NULL,
    type        VARCHAR NOT NULL,
    created_at  TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL
);

-- invites (depends on hoas, users)
CREATE TABLE IF NOT EXISTS invites (
    id          SERIAL PRIMARY KEY,
    hoa_id      INTEGER NOT NULL REFERENCES hoas(id),
    email       VARCHAR NOT NULL,
    code        VARCHAR NOT NULL UNIQUE,
    unit_number VARCHAR,
    status      VARCHAR NOT NULL,
    created_by  INTEGER NOT NULL REFERENCES users(id),
    created_at  TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL,
    expires_at  TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

-- membership_requests (depends on users, hoas)
CREATE TABLE IF NOT EXISTS membership_requests (
    id             SERIAL PRIMARY KEY,
    user_id        INTEGER NOT NULL REFERENCES users(id),
    hoa_id         INTEGER NOT NULL REFERENCES hoas(id),
    status         VARCHAR NOT NULL,
    note           VARCHAR,
    created_at     TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL,
    reviewed_at    TIMESTAMP WITHOUT TIME ZONE,
    reviewed_by_id INTEGER REFERENCES users(id)
);

-- provider_profiles (depends on users)
CREATE TABLE IF NOT EXISTS provider_profiles (
    id                  SERIAL PRIMARY KEY,
    user_id             INTEGER NOT NULL UNIQUE REFERENCES users(id),
    company_name        VARCHAR,
    bio                 TEXT,
    trades              VARCHAR NOT NULL,
    service_radius_mi   INTEGER NOT NULL,
    address             VARCHAR,
    neighborhood        VARCHAR,
    working_hours_start VARCHAR NOT NULL,
    working_hours_end   VARCHAR NOT NULL,
    working_days        VARCHAR NOT NULL,
    is_insured          BOOLEAN NOT NULL,
    is_licensed         BOOLEAN NOT NULL,
    license_number      VARCHAR,
    bank_last4          VARCHAR(4),
    created_at          TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL
);

-- homeowner_profiles (depends on users)
CREATE TABLE IF NOT EXISTS homeowner_profiles (
    id                SERIAL PRIMARY KEY,
    user_id           INTEGER NOT NULL UNIQUE REFERENCES users(id),
    service_radius_mi INTEGER NOT NULL,
    notif_bids        BOOLEAN NOT NULL,
    notif_groups      BOOLEAN NOT NULL,
    notif_savings     BOOLEAN NOT NULL,
    created_at        TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL
);

-- conversations (depends on users)
CREATE TABLE IF NOT EXISTS conversations (
    id         SERIAL PRIMARY KEY,
    user_a_id  INTEGER NOT NULL REFERENCES users(id),
    user_b_id  INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL
);

-- group_channels (depends on service_requests)
CREATE TABLE IF NOT EXISTS group_channels (
    id         SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL UNIQUE REFERENCES service_requests(id),
    archived   BOOLEAN DEFAULT FALSE NOT NULL,
    expires_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL
);

-- channel_members (depends on group_channels, users)
CREATE TABLE IF NOT EXISTS channel_members (
    id         SERIAL PRIMARY KEY,
    channel_id INTEGER NOT NULL REFERENCES group_channels(id),
    user_id    INTEGER NOT NULL REFERENCES users(id),
    joined_at  TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL
);

-- neighbourhood_channels (depends on neighbourhoods)
CREATE TABLE IF NOT EXISTS neighbourhood_channels (
    id               SERIAL PRIMARY KEY,
    neighbourhood_id INTEGER NOT NULL UNIQUE REFERENCES neighbourhoods(id),
    created_at       TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL
);

-- neighbourhood_channel_members (depends on neighbourhood_channels, users)
CREATE TABLE IF NOT EXISTS neighbourhood_channel_members (
    id         SERIAL PRIMARY KEY,
    channel_id INTEGER NOT NULL REFERENCES neighbourhood_channels(id),
    user_id    INTEGER NOT NULL REFERENCES users(id),
    joined_at  TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT uq_ncm_channel_user UNIQUE (channel_id, user_id)
);

-- messages (depends on users, conversations, group_channels)
CREATE TABLE IF NOT EXISTS messages (
    id                       SERIAL PRIMARY KEY,
    sender_id                INTEGER NOT NULL REFERENCES users(id),
    conversation_id          INTEGER REFERENCES conversations(id),
    channel_id               INTEGER REFERENCES group_channels(id),
    neighbourhood_channel_id INTEGER REFERENCES group_channels(id),
    text                     TEXT NOT NULL,
    read_at                  TIMESTAMP WITHOUT TIME ZONE,
    created_at               TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL
);

-- notifications (depends on users)
CREATE TABLE IF NOT EXISTS notifications (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id),
    type       VARCHAR NOT NULL,
    title      VARCHAR NOT NULL,
    body       TEXT NOT NULL,
    action_url VARCHAR,
    read       BOOLEAN NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL
);

-- schedule_items (depends on users, service_requests)
CREATE TABLE IF NOT EXISTS schedule_items (
    id               SERIAL PRIMARY KEY,
    provider_id      INTEGER NOT NULL REFERENCES users(id),
    request_id       INTEGER REFERENCES service_requests(id),
    title            VARCHAR NOT NULL,
    address          VARCHAR,
    scheduled_at     TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    duration_minutes INTEGER NOT NULL,
    status           VARCHAR NOT NULL,
    created_at       TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL
);

-- reviews (depends on users, bids)
CREATE TABLE IF NOT EXISTS reviews (
    id           SERIAL PRIMARY KEY,
    provider_id  INTEGER NOT NULL REFERENCES users(id),
    homeowner_id INTEGER NOT NULL REFERENCES users(id),
    bid_id       INTEGER NOT NULL UNIQUE REFERENCES bids(id),
    stars        INTEGER NOT NULL,
    comment      TEXT,
    tag          VARCHAR,
    created_at   TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL
);

-- group_members (depends on request_groups, users, service_requests)
CREATE TABLE IF NOT EXISTS group_members (
    id              SERIAL PRIMARY KEY,
    group_id        INTEGER NOT NULL REFERENCES request_groups(id),
    user_id         INTEGER NOT NULL REFERENCES users(id),
    request_id      INTEGER NOT NULL REFERENCES service_requests(id),
    approval_status VARCHAR NOT NULL,
    joined_at       TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL
);

-- ai_memory (depends on users)
CREATE TABLE IF NOT EXISTS ai_memory (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id),
    context_key VARCHAR NOT NULL,
    role        VARCHAR NOT NULL,
    content     TEXT NOT NULL,
    created_at  TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL
);

-- HOA feature tables
CREATE TABLE IF NOT EXISTS hoa_announcements (
    id            SERIAL PRIMARY KEY,
    hoa_id        INTEGER NOT NULL REFERENCES hoas(id),
    title         VARCHAR NOT NULL,
    body          TEXT NOT NULL,
    pinned        INTEGER DEFAULT 0,
    created_by_id INTEGER NOT NULL REFERENCES users(id),
    created_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hoa_complaints (
    id          SERIAL PRIMARY KEY,
    hoa_id      INTEGER NOT NULL REFERENCES hoas(id),
    resident_id INTEGER NOT NULL REFERENCES users(id),
    title       VARCHAR NOT NULL,
    description TEXT NOT NULL,
    category    VARCHAR DEFAULT 'General',
    status      VARCHAR DEFAULT 'open',
    created_at  TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hoa_rules (
    id            SERIAL PRIMARY KEY,
    hoa_id        INTEGER NOT NULL REFERENCES hoas(id),
    title         VARCHAR NOT NULL,
    description   TEXT DEFAULT '',
    sort_order    INTEGER DEFAULT 0,
    created_by_id INTEGER NOT NULL REFERENCES users(id),
    created_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hoa_polls (
    id                 SERIAL PRIMARY KEY,
    hoa_id             INTEGER NOT NULL REFERENCES hoas(id),
    title              VARCHAR NOT NULL,
    description        TEXT DEFAULT '',
    category           VARCHAR NOT NULL,
    budget_min         INTEGER,
    budget_max         INTEGER,
    status             VARCHAR DEFAULT 'open',
    closes_at          TIMESTAMP NOT NULL,
    created_by_id      INTEGER NOT NULL REFERENCES users(id),
    service_request_id INTEGER,
    created_at         TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hoa_poll_votes (
    id          SERIAL PRIMARY KEY,
    poll_id     INTEGER NOT NULL REFERENCES hoa_polls(id),
    resident_id INTEGER NOT NULL REFERENCES users(id),
    vote        VARCHAR NOT NULL,
    created_at  TIMESTAMP DEFAULT NOW(),
    UNIQUE(poll_id, resident_id)
);
