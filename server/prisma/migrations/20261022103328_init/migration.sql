-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "phone" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otps" (
    "id" UUID NOT NULL,
    "phone" TEXT NOT NULL,
    "code_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "attempts" SMALLINT NOT NULL DEFAULT 0,
    "consumed_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loans" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "friend_name" TEXT NOT NULL,
    "amount_paise" INTEGER NOT NULL,
    "due_date" DATE NOT NULL,
    "repaid_at" TIMESTAMPTZ(3),
    "note" VARCHAR(255),
    "receipt_path" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "otps_phone_created_at_idx" ON "otps"("phone", "created_at" DESC);

-- CreateIndex
CREATE INDEX "loans_user_id_due_date_idx" ON "loans"("user_id", "due_date");

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Validate normalized international phone numbers.
ALTER TABLE "users"
ADD CONSTRAINT "users_phone_e164"
CHECK ("phone" ~ '^\+[1-9][0-9]{9,14}$');

-- Friend's name must contain between 1 and 100 characters.
ALTER TABLE "loans"
ADD CONSTRAINT "loans_name_len"
CHECK (char_length("friend_name") BETWEEN 1 AND 100);

-- Loan amount must be positive and within the defined limit.
ALTER TABLE "loans"
ADD CONSTRAINT "loans_amount_range"
CHECK ("amount_paise" > 0 AND "amount_paise" <= 1000000000);