-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateFunction for UUID v7 compatibility
CREATE
OR REPLACE FUNCTION uuid_generate_v7() RETURNS uuid LANGUAGE sql AS $ $
SELECT
    uuid_generate_v4();

$ $;

-- CreateEnum
CREATE TYPE "assignment_status_enum" AS ENUM ('opened', 'deleted');

CREATE TYPE "report_type_enum" AS ENUM ('appeared', 'changed', 'disappeared');

CREATE TYPE "attendance_status_enum" AS ENUM ('present', 'absent', 'late');

CREATE TYPE "weekday_enum" AS ENUM (
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday'
);

CREATE TYPE "device_os_enum" AS ENUM ('ios', 'android', 'web');

-- CreateFunction for updated_at trigger
CREATE
OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER LANGUAGE plpgsql AS $ $ BEGIN NEW.updated_at := NOW();

RETURN NEW;

END;

$ $;

-- CreateTable
CREATE TABLE "courses" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v7(),
    "title" TEXT NOT NULL,
    "lead_instructor" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_ratings" (
    "course_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "star" SMALLINT NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "course_ratings_pkey" PRIMARY KEY ("course_id", "user_id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v7(),
    "firebase_uid" TEXT NOT NULL,
    "banned" BOOLEAN NOT NULL DEFAULT false,
    "ban_reason" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_devices" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v7(),
    "user_id" UUID NOT NULL,
    "fcm_token" TEXT NOT NULL,
    "device_os" "device_os_enum" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_logs" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v7(),
    "user_id" UUID NOT NULL,
    "term" TEXT NOT NULL,
    "record_date" DATE NOT NULL,
    "weekday" "weekday_enum" NOT NULL,
    "period" SMALLINT NOT NULL,
    "status" "attendance_status_enum" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "attendance_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_reports" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v7(),
    "user_id" UUID NOT NULL,
    "assignment_id" UUID NOT NULL,
    "report_type" "report_type_enum" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notification_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classes" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v7(),
    "term" TEXT NOT NULL,
    "manabo_class_id" TEXT NOT NULL,
    "course_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_notifiers" (
    "class_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    CONSTRAINT "class_notifiers_pkey" PRIMARY KEY ("class_id", "user_id")
);

-- CreateTable
CREATE TABLE "assignments" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v7(),
    "class_id" UUID NOT NULL,
    "manabo_directory_id" TEXT NOT NULL,
    "manabo_assignment_id" TEXT NOT NULL,
    "open_at" TIMESTAMPTZ(6),
    "due_at" TIMESTAMPTZ(6),
    "status" "assignment_status_enum" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "attendance_logs_user_id_term_idx" ON "attendance_logs"("user_id", "term");

-- CreateIndex  
CREATE INDEX "attendance_logs_record_date_idx" ON "attendance_logs"("record_date");

-- CreateIndex
CREATE UNIQUE INDEX "courses_title_lead_instructor_key" ON "courses"("title", "lead_instructor");

-- CreateIndex
CREATE UNIQUE INDEX "users_firebase_uid_key" ON "users"("firebase_uid");

-- CreateIndex
CREATE UNIQUE INDEX "user_devices_user_id_fcm_token_key" ON "user_devices"("user_id", "fcm_token");

-- CreateIndex
CREATE UNIQUE INDEX "classes_term_manabo_class_id_key" ON "classes"("term", "manabo_class_id");

-- CreateIndex
CREATE UNIQUE INDEX "assignments_class_id_manabo_directory_id_manabo_assignment_id_key" ON "assignments"(
    "class_id",
    "manabo_directory_id",
    "manabo_assignment_id"
);

-- AddForeignKey
ALTER TABLE
    "course_ratings"
ADD
    CONSTRAINT "course_ratings_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
    "course_ratings"
ADD
    CONSTRAINT "course_ratings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
    "user_devices"
ADD
    CONSTRAINT "user_devices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
    "attendance_logs"
ADD
    CONSTRAINT "attendance_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
    "notification_reports"
ADD
    CONSTRAINT "notification_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
    "notification_reports"
ADD
    CONSTRAINT "notification_reports_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
    "classes"
ADD
    CONSTRAINT "classes_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
    "class_notifiers"
ADD
    CONSTRAINT "class_notifiers_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
    "class_notifiers"
ADD
    CONSTRAINT "class_notifiers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
    "assignments"
ADD
    CONSTRAINT "assignments_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create triggers for updated_at
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
