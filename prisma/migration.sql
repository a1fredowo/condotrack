-- =====================================================
-- CONDOTRACK DATABASE MIGRATION
-- Execute this SQL in Supabase SQL Editor
-- =====================================================

-- 1. Create Rol enum if not exists
DO $$ BEGIN
    CREATE TYPE "Rol" AS ENUM ('admin', 'conserje', 'residente');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add missing columns to usuarios table
ALTER TABLE "usuarios" 
  ADD COLUMN IF NOT EXISTS "email" TEXT,
  ADD COLUMN IF NOT EXISTS "password" TEXT,
  ADD COLUMN IF NOT EXISTS "activo" BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS "rol" TEXT DEFAULT 'residente',
  ADD COLUMN IF NOT EXISTS "departamentoId" INTEGER;

-- Create indexes on usuarios (only if column exists)
CREATE INDEX IF NOT EXISTS "usuarios_email_idx" ON "usuarios"("email");

-- 3. Add missing columns to encomiendas table
ALTER TABLE "encomiendas"
  ADD COLUMN IF NOT EXISTS "transportista" TEXT,
  ADD COLUMN IF NOT EXISTS "residenteId" TEXT,
  ADD COLUMN IF NOT EXISTS "residenteNombre" TEXT,
  ADD COLUMN IF NOT EXISTS "registradoPorId" TEXT,
  ADD COLUMN IF NOT EXISTS "fechaEntrega" TIMESTAMP(3);

-- Create indexes on encomiendas
CREATE INDEX IF NOT EXISTS "encomiendas_estado_idx" ON "encomiendas"("estado");
CREATE INDEX IF NOT EXISTS "encomiendas_residenteId_idx" ON "encomiendas"("residenteId");
CREATE INDEX IF NOT EXISTS "encomiendas_fechaRecepcion_idx" ON "encomiendas"("fechaRecepcion");
CREATE INDEX IF NOT EXISTS "encomiendas_codigo_idx" ON "encomiendas"("codigo");

-- Add unique constraint on codigo
DO $$ BEGIN
    ALTER TABLE "encomiendas" ADD CONSTRAINT "encomiendas_codigo_key" UNIQUE ("codigo");
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 4. Add missing columns to notificaciones table
ALTER TABLE "notificaciones"
  ADD COLUMN IF NOT EXISTS "encomiendaId" TEXT,
  ADD COLUMN IF NOT EXISTS "mensaje" TEXT,
  ADD COLUMN IF NOT EXISTS "leida" BOOLEAN DEFAULT false;

-- Create indexes on notificaciones
CREATE INDEX IF NOT EXISTS "notificaciones_encomiendaId_idx" ON "notificaciones"("encomiendaId");
CREATE INDEX IF NOT EXISTS "notificaciones_entregada_idx" ON "notificaciones"("entregada");

-- 5. Create sesiones table
CREATE TABLE IF NOT EXISTS "sesiones" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiraEn" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sesiones_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
    ALTER TABLE "sesiones" ADD CONSTRAINT "sesiones_token_key" UNIQUE ("token");
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "sesiones_token_idx" ON "sesiones"("token");
CREATE INDEX IF NOT EXISTS "sesiones_usuarioId_idx" ON "sesiones"("usuarioId");

-- 6. Create tokens_qr table
CREATE TABLE IF NOT EXISTS "tokens_qr" (
    "id" TEXT NOT NULL,
    "encomiendaId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "usado" BOOLEAN NOT NULL DEFAULT false,
    "expiraEn" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tokens_qr_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
    ALTER TABLE "tokens_qr" ADD CONSTRAINT "tokens_qr_encomiendaId_key" UNIQUE ("encomiendaId");
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "tokens_qr" ADD CONSTRAINT "tokens_qr_token_key" UNIQUE ("token");
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "tokens_qr_token_idx" ON "tokens_qr"("token");
CREATE INDEX IF NOT EXISTS "tokens_qr_encomiendaId_idx" ON "tokens_qr"("encomiendaId");

-- 7. Create logs_entrega table
CREATE TABLE IF NOT EXISTS "logs_entrega" (
    "id" TEXT NOT NULL,
    "encomiendaId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "accion" TEXT NOT NULL,
    "detalles" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "logs_entrega_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "logs_entrega_encomiendaId_idx" ON "logs_entrega"("encomiendaId");
CREATE INDEX IF NOT EXISTS "logs_entrega_usuarioId_idx" ON "logs_entrega"("usuarioId");
CREATE INDEX IF NOT EXISTS "logs_entrega_createdAt_idx" ON "logs_entrega"("createdAt");
CREATE INDEX IF NOT EXISTS "logs_entrega_accion_idx" ON "logs_entrega"("accion");

-- 8. Fix column types and add foreign key constraints

-- First, fix the column types to match UUID
ALTER TABLE "sesiones" ALTER COLUMN "usuarioId" TYPE UUID USING "usuarioId"::uuid;
ALTER TABLE "encomiendas" ALTER COLUMN "residenteId" TYPE UUID USING "residenteId"::uuid;
ALTER TABLE "encomiendas" ALTER COLUMN "registradoPorId" TYPE UUID USING "registradoPorId"::uuid;
ALTER TABLE "tokens_qr" ALTER COLUMN "encomiendaId" TYPE UUID USING "encomiendaId"::uuid;
ALTER TABLE "logs_entrega" ALTER COLUMN "encomiendaId" TYPE UUID USING "encomiendaId"::uuid;
ALTER TABLE "logs_entrega" ALTER COLUMN "usuarioId" TYPE UUID USING "usuarioId"::uuid;
ALTER TABLE "notificaciones" ALTER COLUMN "encomiendaId" TYPE UUID USING "encomiendaId"::uuid;

-- Now add foreign key constraints
DO $$ BEGIN
    ALTER TABLE "usuarios" 
      ADD CONSTRAINT "usuarios_departamentoId_fkey" 
      FOREIGN KEY ("departamentoId") REFERENCES "departamentos"("id") 
      ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
    WHEN undefined_table THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "sesiones" 
      ADD CONSTRAINT "sesiones_usuarioId_fkey" 
      FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "encomiendas" 
      ADD CONSTRAINT "encomiendas_residenteId_fkey" 
      FOREIGN KEY ("residenteId") REFERENCES "usuarios"("id") 
      ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "encomiendas" 
      ADD CONSTRAINT "encomiendas_registradoPorId_fkey" 
      FOREIGN KEY ("registradoPorId") REFERENCES "usuarios"("id") 
      ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "tokens_qr" 
      ADD CONSTRAINT "tokens_qr_encomiendaId_fkey" 
      FOREIGN KEY ("encomiendaId") REFERENCES "encomiendas"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "logs_entrega" 
      ADD CONSTRAINT "logs_entrega_encomiendaId_fkey" 
      FOREIGN KEY ("encomiendaId") REFERENCES "encomiendas"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "logs_entrega" 
      ADD CONSTRAINT "logs_entrega_usuarioId_fkey" 
      FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") 
      ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "notificaciones" 
      ADD CONSTRAINT "notificaciones_encomiendaId_fkey" 
      FOREIGN KEY ("encomiendaId") REFERENCES "encomiendas"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 9. Enable Row Level Security (optional, can be configured later)
-- ALTER TABLE "usuarios" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "encomiendas" ENABLE ROW LEVEL SECURITY;
-- etc.

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
