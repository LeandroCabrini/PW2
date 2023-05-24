-- CreateTable
CREATE TABLE "User" (
    "IdUser" SERIAL NOT NULL,
    "NameUser" TEXT NOT NULL,
    "Age" INTEGER NOT NULL,
    "CPF" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "type" INTEGER NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("IdUser")
);

-- CreateTable
CREATE TABLE "Project" (
    "IdProject" SERIAL NOT NULL,
    "ProjectName" TEXT NOT NULL,
    "ProjectDescription" TEXT NOT NULL,
    "YearStart" INTEGER NOT NULL,
    "YearEnd" INTEGER NOT NULL,
    "IdUserResponsible" INTEGER NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("IdProject")
);

-- CreateTable
CREATE TABLE "Application" (
    "IdApplication" SERIAL NOT NULL,
    "IdUser" INTEGER NOT NULL,
    "IdProject" INTEGER NOT NULL,
    "Stats" TEXT NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("IdApplication")
);

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_IdUserResponsible_fkey" FOREIGN KEY ("IdUserResponsible") REFERENCES "User"("IdUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_IdUser_fkey" FOREIGN KEY ("IdUser") REFERENCES "User"("IdUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_IdProject_fkey" FOREIGN KEY ("IdProject") REFERENCES "Project"("IdProject") ON DELETE RESTRICT ON UPDATE CASCADE;
