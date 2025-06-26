-- -------------------------- ENUM & 汎用オブジェクト --------------------------
-- 1-1  ENUM
CREATE TYPE assignment_status_enum AS ENUM ('opened', 'deleted');

CREATE TYPE report_type_enum AS ENUM ('appeared', 'changed', 'disappeared');

CREATE TYPE attendance_status_enum AS ENUM ('present', 'absent', 'late');

CREATE TYPE weekday_enum AS ENUM (
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
);

CREATE TYPE device_os_enum AS ENUM ('ios', 'android', 'web');

-- 必要に応じて追加可能
-- 1-2  共通トリガ関数（updated_at 自動更新）
CREATE
OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER LANGUAGE plpgsql AS $ $ BEGIN NEW.updated_at := NOW();

RETURN NEW;

END;

$ $;

-- -------------------------- スキーマ定義 --------------------------
-- 2-1  授業科目 (大学全体で共通の科目マスタ)
CREATE TABLE courses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  title text NOT NULL,
  lead_instructor text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE(title, lead_instructor)
);

-- 2-1-a: 評価
CREATE TABLE course_ratings (
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  star smallint CHECK (
    star BETWEEN 1
    AND 5
  ),
  comment text,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  PRIMARY KEY (course_id, user_id)
);

-- 2-2  users
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  firebase_uid text UNIQUE NOT NULL,
  banned boolean NOT NULL DEFAULT false,
  ban_reason text,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

-- 2-2-a: FCM デバイストークン
CREATE TABLE user_devices (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fcm_token text NOT NULL,
  device_os device_os_enum NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, fcm_token)
);

-- 2-2-b: 出欠ログ
CREATE TABLE attendance_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  term text NOT NULL,
  record_date date NOT NULL,
  weekday weekday_enum NOT NULL,
  period smallint NOT NULL CHECK (
    period BETWEEN 1
    AND 5
  ),
  status attendance_status_enum NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX ON attendance_logs (user_id, term);

CREATE INDEX ON attendance_logs (record_date);

-- 2-2-c: 課題通知報告
CREATE TABLE notification_reports (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assignment_id uuid NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  report_type report_type_enum NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

-- 2-3  授業 (具体的な曜日、時限などを含む)
CREATE TABLE classes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  term text NOT NULL,
  manabo_class_id text NOT NULL,
  course_id uuid REFERENCES courses(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE(term, manabo_class_id)
);

-- 2-3-a: クラス – 通知ユーザー
CREATE TABLE class_notifiers (
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (class_id, user_id)
);

-- 2-4  課題
CREATE TABLE assignments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  manabo_directory_id text NOT NULL,
  manabo_assignment_id text NOT NULL,
  open_at timestamptz,
  due_at timestamptz,
  status assignment_status_enum NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE(
    class_id,
    manabo_directory_id,
    manabo_assignment_id
  )
);

-- 2-5  トリガ適用
DO $ $ DECLARE _tbl text;

BEGIN FOR _tbl IN
SELECT
  t.table_name
FROM
  information_schema.tables t
WHERE
  t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
  AND EXISTS (
    SELECT
      1
    FROM
      information_schema.columns c
    WHERE
      c.table_schema = 'public'
      AND c.table_name = t.table_name
      AND c.column_name = 'updated_at'
  ) LOOP EXECUTE format(
    'CREATE TRIGGER trg_set_updated_at_%I
       BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION set_updated_at();',
    _tbl,
    _tbl
  );

END LOOP;

END $ $ LANGUAGE plpgsql;

-- -------------------------- コメント --------------------------
-- courses テーブル
COMMENT ON TABLE courses IS '科目マスタ。科目名と主担当教員を管理する';

COMMENT ON COLUMN courses.title IS '科目名';

COMMENT ON COLUMN courses.lead_instructor IS '主担当教員名';

-- course_ratings テーブル
COMMENT ON TABLE course_ratings IS '科目評価。ユーザーごとの星評価と感想文を保持する';

COMMENT ON COLUMN course_ratings.course_id IS '評価対象の科目ID（courses.id 参照）';

COMMENT ON COLUMN course_ratings.user_id IS '評価したユーザーID（users.id 参照）';

COMMENT ON COLUMN course_ratings.star IS '星評価（1〜5）';

COMMENT ON COLUMN course_ratings.comment IS '自由記述の感想文';

-- users テーブル
COMMENT ON TABLE users IS 'アプリ利用ユーザー。Firebase UID や BAN 状態を保持する';

COMMENT ON COLUMN users.firebase_uid IS 'Firebase Authentication の UID';

COMMENT ON COLUMN users.banned IS 'BAN 状態フラグ';

COMMENT ON COLUMN users.ban_reason IS 'BAN 理由';

-- user_devices テーブル
COMMENT ON TABLE user_devices IS 'ユーザーと FCM デバイストークンの紐付け（複数デバイス対応）';

COMMENT ON COLUMN user_devices.user_id IS '所有ユーザーID（users.id 参照）';

COMMENT ON COLUMN user_devices.fcm_token IS 'FCM デバイストークン';

COMMENT ON COLUMN user_devices.device_os IS 'デバイス OS 種別（ios / android / web）';

-- attendance_logs テーブル
COMMENT ON TABLE attendance_logs IS '出欠履歴。学期・日時・時限ごとの出欠を記録する';

COMMENT ON COLUMN attendance_logs.user_id IS 'ユーザーID（users.id 参照）';

COMMENT ON COLUMN attendance_logs.term IS '学期（例: 2025_春学期）';

COMMENT ON COLUMN attendance_logs.record_date IS '記録日';

COMMENT ON COLUMN attendance_logs.weekday IS '曜日';

COMMENT ON COLUMN attendance_logs.period IS '時限';

COMMENT ON COLUMN attendance_logs.status IS '出欠ステータス（present / absent / late）';

-- notification_reports テーブル
COMMENT ON TABLE notification_reports IS '課題通知をバックエンドへ報告した履歴';

COMMENT ON COLUMN notification_reports.user_id IS '報告ユーザーID（users.id 参照）';

COMMENT ON COLUMN notification_reports.assignment_id IS '対象課題ID（assignments.id 参照）';

COMMENT ON COLUMN notification_reports.report_type IS '通知種別（appeared / changed / disappeared）';

-- classes テーブル
COMMENT ON TABLE classes IS '学期+MaNaBo 授業ID 単位の授業情報（科目マスタと紐付く）';

COMMENT ON COLUMN classes.term IS '学期（例: 2025_春学期）';

COMMENT ON COLUMN classes.manabo_class_id IS 'MaNaBo 授業 ID';

COMMENT ON COLUMN classes.course_id IS '科目マスタID（courses.id 参照）';

-- class_notifiers テーブル
COMMENT ON TABLE class_notifiers IS '授業ごとの通知対象ユーザーリスト';

COMMENT ON COLUMN class_notifiers.class_id IS '授業ID（classes.id 参照）';

COMMENT ON COLUMN class_notifiers.user_id IS '通知先ユーザーID（users.id 参照）';

-- assignments テーブル
COMMENT ON TABLE assignments IS '課題情報。MaNaBo 課題 ID と公開/締切日時・ステータスを保持する';

COMMENT ON COLUMN assignments.class_id IS '授業ID（classes.id 参照）';

COMMENT ON COLUMN assignments.manabo_directory_id IS 'MaNaBo ディレクトリ ID';

COMMENT ON COLUMN assignments.manabo_assignment_id IS 'MaNaBo 課題 ID';

COMMENT ON COLUMN assignments.open_at IS '課題公開日時（任意）';

COMMENT ON COLUMN assignments.due_at IS '課題締切日時（任意）';

COMMENT ON COLUMN assignments.status IS '課題ステータス（opened / deleted）';
