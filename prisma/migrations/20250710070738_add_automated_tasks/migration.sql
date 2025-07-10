-- CreateTable
CREATE TABLE "automated_tasks" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "schedule" TEXT,
    "event" TEXT,
    "payload" JSONB,
    "lastRun" TIMESTAMP(3),
    "nextRun" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "lastResult" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automated_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automated_task_logs" (
    "id" SERIAL NOT NULL,
    "taskId" INTEGER NOT NULL,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "success" BOOLEAN NOT NULL,
    "message" TEXT,

    CONSTRAINT "automated_task_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "automated_task_logs" ADD CONSTRAINT "automated_task_logs_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "automated_tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
