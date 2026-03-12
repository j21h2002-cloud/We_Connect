-- ============================================
-- 카카오 알림톡 발송 시스템 - Supabase 테이블
-- Supabase > SQL Editor 에서 실행하세요
-- ============================================

-- 고객사 테이블
CREATE TABLE IF NOT EXISTS customers (
  id           BIGSERIAL PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_name TEXT,
  phone        TEXT,             -- 핸드폰 번호 (알림톡/SMS 수신)
  email        TEXT,             -- 이메일 주소
  industry     TEXT,             -- 산업군
  memo         TEXT,             -- 비고
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ※ 기존 테이블에 email 컬럼 추가 (이미 테이블이 있는 경우)
-- ALTER TABLE customers ADD COLUMN IF NOT EXISTS email TEXT;

-- 메시지(템플릿) 테이블
CREATE TABLE IF NOT EXISTS messages (
  id            BIGSERIAL PRIMARY KEY,
  title         TEXT NOT NULL,           -- 메시지 제목 (이메일은 메일 제목으로도 사용)
  channel       TEXT DEFAULT 'kakao',    -- 'kakao' | 'sms' | 'email'
  template_code TEXT,                    -- 카카오 템플릿 코드 (kakao 전용)
  content       TEXT,                    -- 메시지 내용
  image_url     TEXT,                    -- 첨부 이미지 URL (kakao 전용)
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ※ 기존 테이블에 channel 컬럼 추가 (이미 테이블이 있는 경우)
-- ALTER TABLE messages ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'kakao';

-- 발송 이력 테이블
CREATE TABLE IF NOT EXISTS send_history (
  id             BIGSERIAL PRIMARY KEY,
  title          TEXT,           -- 발송 메시지 제목
  template_code  TEXT,
  customer_count INT DEFAULT 0,
  success_count  INT DEFAULT 0,
  fail_count     INT DEFAULT 0,
  recipients     JSONB DEFAULT '[]',  -- [{name, phone, status, reason}]
  sent_by        TEXT,           -- 발송자 이름
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 사용자 프로필 테이블 (Supabase Auth와 1:1 연결)
CREATE TABLE IF NOT EXISTS user_profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username   TEXT UNIQUE NOT NULL,   -- 로그인 아이디 (표시용)
  name       TEXT NOT NULL,          -- 성명
  role       TEXT DEFAULT 'user',    -- 'admin' | 'user'
  active     BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 카카오 API 설정 (1행만 사용)
CREATE TABLE IF NOT EXISTS kakao_config (
  id          INT PRIMARY KEY DEFAULT 1,
  app_key     TEXT,
  sender_key  TEXT,
  user_id     TEXT,   -- 알리고 아이디
  sender_num  TEXT    -- 발신 번호
);
INSERT INTO kakao_config (id) VALUES (1) ON CONFLICT DO NOTHING;

-- 이메일 SMTP 설정 (1행만 사용)
CREATE TABLE IF NOT EXISTS email_config (
  id          INT PRIMARY KEY DEFAULT 1,
  smtp_host   TEXT,             -- SMTP 서버 주소 (예: smtp.gmail.com)
  smtp_port   INT DEFAULT 587,  -- SMTP 포트
  smtp_user   TEXT,             -- SMTP 인증 계정 (Gmail 주소)
  smtp_pass   TEXT,             -- 앱 비밀번호
  from_name   TEXT,             -- 발신자 이름 (예: 웹케시)
  from_email  TEXT              -- 수신자에게 보이는 발신 주소 (예: noreply@company.com)
);
-- ※ 기존 테이블에 from_email 컬럼 추가 (이미 테이블이 있는 경우)
-- ALTER TABLE email_config ADD COLUMN IF NOT EXISTS from_email TEXT;
INSERT INTO email_config (id) VALUES (1) ON CONFLICT DO NOTHING;

-- ============================================
-- RLS (Row Level Security) - 로그인 사용자만 접근
-- ============================================
ALTER TABLE customers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_config   ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages       ENABLE ROW LEVEL SECURITY;
ALTER TABLE send_history   ENABLE ROW LEVEL SECURITY;
ALTER TABLE kakao_config   ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "로그인 사용자만" ON customers
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "로그인 사용자만" ON messages
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "로그인 사용자만" ON send_history
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "로그인 사용자만" ON kakao_config
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "로그인 사용자만" ON email_config
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "인증 사용자 프로필 조회" ON user_profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "인증 사용자 프로필 수정" ON user_profiles
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- Storage 버킷
-- ============================================

-- 백업 파일 저장 버킷
INSERT INTO storage.buckets (id, name, public)
VALUES ('kakao-backups', 'kakao-backups', false)
ON CONFLICT DO NOTHING;

-- 메시지 이미지 저장 버킷 (public: 발송 시 수신자가 열람 가능해야 함)
INSERT INTO storage.buckets (id, name, public)
VALUES ('message-images', 'message-images', true)
ON CONFLICT DO NOTHING;

-- kakao-backups 버킷 정책
CREATE POLICY "백업 업로드" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'kakao-backups' AND auth.role() = 'authenticated'
  );

CREATE POLICY "백업 다운로드" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'kakao-backups' AND auth.role() = 'authenticated'
  );

-- message-images 버킷 정책
CREATE POLICY "이미지 업로드" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'message-images' AND auth.role() = 'authenticated'
  );

CREATE POLICY "이미지 조회 (공개)" ON storage.objects
  FOR SELECT USING (bucket_id = 'message-images');

CREATE POLICY "이미지 삭제" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'message-images' AND auth.role() = 'authenticated'
  );

-- user_profiles에 개인 이메일 추가 (발신자 From 주소로 사용)
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- 회사 이메일 계정 목록 (발송 시 From 주소로 선택 가능한 회사 이메일들)
CREATE TABLE IF NOT EXISTS company_emails (
  id         BIGSERIAL PRIMARY KEY,
  label      TEXT NOT NULL,         -- 표시 이름 (예: 영업팀, 고객지원, 대표메일)
  email      TEXT NOT NULL UNIQUE,  -- 이메일 주소
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE company_emails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "로그인 사용자만" ON company_emails
  FOR ALL USING (auth.role() = 'authenticated');

-- 사용자별 개인 이메일 SMTP 설정
CREATE TABLE IF NOT EXISTS user_email_config (
  id         UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  smtp_host  TEXT,             -- SMTP 서버 주소 (예: smtp.gmail.com)
  smtp_port  INT DEFAULT 587,  -- SMTP 포트
  smtp_user  TEXT,             -- SMTP 인증 계정 (Gmail 주소)
  smtp_pass  TEXT,             -- 앱 비밀번호
  from_name  TEXT,             -- 발신자 이름
  from_email TEXT,             -- 수신자에게 보이는 발신 주소 (예: hong@company.com)
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE user_email_config ENABLE ROW LEVEL SECURITY;

-- 본인 설정만 조회/수정 가능 (관리자는 모든 사용자 설정 관리 가능)
CREATE POLICY "본인 이메일 설정 조회" ON user_email_config
  FOR ALL USING (auth.role() = 'authenticated');
