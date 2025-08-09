-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "joke_cache" (
    "id" SERIAL NOT NULL,
    "joke" TEXT NOT NULL,
    "translated_joke" TEXT,
    "language" TEXT NOT NULL DEFAULT 'pt',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "joke_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorite_jokes" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "joke" TEXT NOT NULL,
    "joke_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_jokes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "favorite_jokes_user_id_joke_key" ON "favorite_jokes"("user_id", "joke");

-- AddForeignKey
ALTER TABLE "favorite_jokes" ADD CONSTRAINT "favorite_jokes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
