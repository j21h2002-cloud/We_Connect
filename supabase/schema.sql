-- ============================================
-- 카카오 알림톡 발송 시스템 - Supabase 테이블
-- Supabase > SQL Editor 에서 실행하세요
-- ※ 여러 번 실행해도 오류 없이 동작합니다
-- ============================================

-- ── 테이블 생성 ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS customers (
  id           BIGSERIAL PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_name TEXT,
  phone        TEXT,
  email        TEXT,
  industry     TEXT,
  memo         TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id            BIGSERIAL PRIMARY KEY,
  title         TEXT NOT NULL,
  channel       TEXT DEFAULT 'kakao',   -- 'kakao' | 'sms' | 'email'
  template_code TEXT,
  content       TEXT,
  image_url     TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS send_history (
  id             BIGSERIAL PRIMARY KEY,
  title          TEXT,
  template_code  TEXT,
  customer_count INT DEFAULT 0,
  success_count  INT DEFAULT 0,
  fail_count     INT DEFAULT 0,
  recipients     JSONB DEFAULT '[]',
  sent_by        TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 사용자 프로필 (Supabase Auth 1:1 연결)
CREATE TABLE IF NOT EXISTS user_profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username   TEXT UNIQUE NOT NULL,
  name       TEXT NOT NULL,
  email      TEXT,                      -- 발신자 이메일 (From 주소용)
  role       TEXT DEFAULT 'user',       -- 'admin' | 'user'
  active     BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 카카오 API 설정 (1행만 사용)
CREATE TABLE IF NOT EXISTS kakao_config (
  id          INT PRIMARY KEY DEFAULT 1,
  app_key     TEXT,
  sender_key  TEXT,
  user_id     TEXT,
  sender_num  TEXT
);
INSERT INTO kakao_config (id) VALUES (1) ON CONFLICT DO NOTHING;

-- 이메일 SMTP 설정 (1행만 사용)
CREATE TABLE IF NOT EXISTS email_config (
  id        INT PRIMARY KEY DEFAULT 1,
  smtp_host TEXT,
  smtp_port INT DEFAULT 587,
  smtp_user TEXT,
  smtp_pass TEXT,
  from_name TEXT
);
INSERT INTO email_config (id) VALUES (1) ON CONFLICT DO NOTHING;

-- 회사 이메일 계정 목록 (발송 시 From 주소로 선택)
CREATE TABLE IF NOT EXISTS company_emails (
  id         BIGSERIAL PRIMARY KEY,
  label      TEXT NOT NULL,
  email      TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── RLS 활성화 ────────────────────────────────────────

ALTER TABLE customers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages       ENABLE ROW LEVEL SECURITY;
ALTER TABLE send_history   ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE kakao_config   ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_config   ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_emails ENABLE ROW LEVEL SECURITY;

-- ── RLS 정책 (DROP 후 재생성 → 중복 오류 방지) ──────

DROP POLICY IF EXISTS "로그인 사용자만" ON customers;
CREATE POLICY "로그인 사용자만" ON customers
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "로그인 사용자만" ON messages;
CREATE POLICY "로그인 사용자만" ON messages
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "로그인 사용자만" ON send_history;
CREATE POLICY "로그인 사용자만" ON send_history
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "로그인 사용자만" ON kakao_config;
CREATE POLICY "로그인 사용자만" ON kakao_config
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "로그인 사용자만" ON email_config;
CREATE POLICY "로그인 사용자만" ON email_config
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "로그인 사용자만" ON company_emails;
CREATE POLICY "로그인 사용자만" ON company_emails
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "인증 사용자 프로필 조회" ON user_profiles;
CREATE POLICY "인증 사용자 프로필 조회" ON user_profiles
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "인증 사용자 프로필 수정" ON user_profiles;
CREATE POLICY "인증 사용자 프로필 수정" ON user_profiles
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- ※ Storage 버킷은 SQL이 아닌 대시보드에서 생성하세요
-- Supabase > Storage > New Bucket
--
--   버킷 1: kakao-backups  (Public: OFF)
--   버킷 2: message-images (Public: ON)
--
-- 버킷 생성 후 각 버킷 > Policies 탭에서 정책 추가:
--   kakao-backups  → "authenticated" 역할에 SELECT/INSERT 허용
--   message-images → "authenticated" 역할에 INSERT/DELETE 허용
--                    "public" (모두)에 SELECT 허용
-- ============================================
