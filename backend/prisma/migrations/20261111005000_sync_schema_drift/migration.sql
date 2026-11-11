-- Sincroniza migrations com o schema.prisma (colunas já usadas pelo código).
-- Idempotente: bancos criados via `db push` já possuem estas colunas.
ALTER TABLE "Exercise"
  ADD COLUMN IF NOT EXISTS "ficha" TEXT DEFAULT 'Treino Diário',
  ADD COLUMN IF NOT EXISTS "reps" TEXT,
  ADD COLUMN IF NOT EXISTS "rest" TEXT,
  ADD COLUMN IF NOT EXISTS "technical_tip" TEXT;
ALTER TABLE "Exercise" ALTER COLUMN "weight" DROP NOT NULL;

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "gender" TEXT DEFAULT 'Não informado',
  ADD COLUMN IF NOT EXISTS "price" TEXT;
ALTER TABLE "User" ALTER COLUMN "goal" SET DEFAULT 'Saúde e Condicionamento';

ALTER TABLE "WorkoutTemplate" ALTER COLUMN "duration" SET DEFAULT '4 Semanas';
ALTER TABLE "WorkoutTemplate" ALTER COLUMN "dayOfWeek" SET DEFAULT 'Geral';
