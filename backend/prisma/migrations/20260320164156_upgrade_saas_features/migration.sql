-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL DEFAULT '',
    "role" TEXT NOT NULL DEFAULT 'STUDENT',
    "status" TEXT NOT NULL DEFAULT 'Ativo',
    "phone" TEXT,
    "age" TEXT,
    "weight" TEXT,
    "height" TEXT,
    "goal" TEXT DEFAULT 'Hipertrofia',
    "level" TEXT DEFAULT 'Intermediário',
    "anamnese" TEXT,
    "restricoes" TEXT,
    "notes" TEXT,
    "avatar" TEXT,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "resetToken" TEXT,
    "resetExpires" TIMESTAMP(3),
    "plano" TEXT NOT NULL DEFAULT 'GRATIS',
    "planExpiresAt" TIMESTAMP(3),
    "iaUsadaMes" INTEGER NOT NULL DEFAULT 0,
    "brandName" TEXT,
    "brandColor" TEXT DEFAULT '#2563eb',
    "brandLogo" TEXT,
    "trainerId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutTemplate" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "dayOfWeek" TEXT DEFAULT 'Segunda',
    "pdfUrl" TEXT,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "sets" TEXT NOT NULL,
    "weight" TEXT NOT NULL,
    "youtubeId" TEXT,
    "isConjugado" BOOLEAN NOT NULL DEFAULT false,
    "conjugadoCom" TEXT,
    "workoutId" INTEGER NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutHistory" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "workoutName" TEXT NOT NULL,
    "rating" INTEGER,
    "comment" TEXT,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkoutHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemConfig" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "promoActive" BOOLEAN NOT NULL DEFAULT false,
    "promoTitle" TEXT NOT NULL DEFAULT '🔥 OFERTA DE LANÇAMENTO 🔥',
    "startPrice" TEXT NOT NULL DEFAULT '30',
    "startLink" TEXT NOT NULL DEFAULT 'https://www.asaas.com/c/...',
    "proPrice" TEXT NOT NULL DEFAULT '60',
    "proLink" TEXT NOT NULL DEFAULT 'https://www.asaas.com/c/...',
    "elitePrice" TEXT NOT NULL DEFAULT '100',
    "eliteLink" TEXT NOT NULL DEFAULT 'https://www.asaas.com/c/...',
    "maintenance" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutTemplate" ADD CONSTRAINT "WorkoutTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "WorkoutTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutHistory" ADD CONSTRAINT "WorkoutHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
