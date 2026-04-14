-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeSheet" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "importedBy" TEXT,
    "totalItems" INTEGER NOT NULL DEFAULT 0,
    "totalValor" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "TimeSheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeSheetItem" (
    "id" TEXT NOT NULL,
    "timeSheetId" TEXT NOT NULL,
    "numeroAddvalora" TEXT NOT NULL,
    "segurado" TEXT NOT NULL,
    "regulador" TEXT NOT NULL,
    "tempoMinutos" INTEGER NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "dataTimeSheet" TIMESTAMP(3) NOT NULL,
    "operacao" TEXT NOT NULL,
    "diretoria" TEXT NOT NULL,
    "equipe" TEXT NOT NULL,
    "coordenador" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimeSheetItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeSheetResumo" (
    "id" TEXT NOT NULL,
    "timeSheetId" TEXT NOT NULL,
    "operacao" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "valorTotal" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "TimeSheetResumo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Log" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "details" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Config" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "Config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "TimeSheet_importedAt_idx" ON "TimeSheet"("importedAt");

-- CreateIndex
CREATE INDEX "TimeSheet_importedBy_idx" ON "TimeSheet"("importedBy");

-- CreateIndex
CREATE INDEX "TimeSheetItem_timeSheetId_idx" ON "TimeSheetItem"("timeSheetId");

-- CreateIndex
CREATE INDEX "TimeSheetItem_numeroAddvalora_idx" ON "TimeSheetItem"("numeroAddvalora");

-- CreateIndex
CREATE INDEX "TimeSheetItem_regulador_idx" ON "TimeSheetItem"("regulador");

-- CreateIndex
CREATE INDEX "TimeSheetItem_operacao_idx" ON "TimeSheetItem"("operacao");

-- CreateIndex
CREATE INDEX "TimeSheetItem_dataTimeSheet_idx" ON "TimeSheetItem"("dataTimeSheet");

-- CreateIndex
CREATE INDEX "TimeSheetResumo_timeSheetId_idx" ON "TimeSheetResumo"("timeSheetId");

-- CreateIndex
CREATE INDEX "TimeSheetResumo_operacao_idx" ON "TimeSheetResumo"("operacao");

-- CreateIndex
CREATE INDEX "Log_userId_idx" ON "Log"("userId");

-- CreateIndex
CREATE INDEX "Log_action_idx" ON "Log"("action");

-- CreateIndex
CREATE INDEX "Log_createdAt_idx" ON "Log"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Config_key_key" ON "Config"("key");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeSheetItem" ADD CONSTRAINT "TimeSheetItem_timeSheetId_fkey" FOREIGN KEY ("timeSheetId") REFERENCES "TimeSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeSheetResumo" ADD CONSTRAINT "TimeSheetResumo_timeSheetId_fkey" FOREIGN KEY ("timeSheetId") REFERENCES "TimeSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
