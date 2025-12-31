-- CreateTable
CREATE TABLE "_user_to_permission" (
    "userId" INTEGER NOT NULL,
    "permissionId" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_user_to_permission_userId_permissionId_key" ON "_user_to_permission"("userId", "permissionId");

-- AddForeignKey
ALTER TABLE "_user_to_permission" ADD CONSTRAINT "_user_to_permission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_user_to_permission" ADD CONSTRAINT "_user_to_permission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
