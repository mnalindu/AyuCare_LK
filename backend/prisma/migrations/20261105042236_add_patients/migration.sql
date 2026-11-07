-- CreateTable
CREATE TABLE "patients" (
    "id" UUID NOT NULL,
    "patient_number" SERIAL NOT NULL,
    "full_name" VARCHAR(200) NOT NULL,
    "date_of_birth" DATE,
    "phone" VARCHAR(32),
    "email" VARCHAR(254),
    "address" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "registered_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "patients_patient_number_key" ON "patients"("patient_number");

-- CreateIndex
CREATE INDEX "patients_full_name_idx" ON "patients"("full_name");

-- CreateIndex
CREATE INDEX "patients_phone_idx" ON "patients"("phone");

-- CreateIndex
CREATE INDEX "patients_registered_by_id_idx" ON "patients"("registered_by_id");

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_registered_by_id_fkey" FOREIGN KEY ("registered_by_id") REFERENCES "staff_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Reject blank names and invalid manually supplied patient numbers.
ALTER TABLE "patients" ADD CONSTRAINT "patients_full_name_not_blank_check" CHECK (btrim("full_name") <> '');
ALTER TABLE "patients" ADD CONSTRAINT "patients_patient_number_positive_check" CHECK ("patient_number" > 0);
