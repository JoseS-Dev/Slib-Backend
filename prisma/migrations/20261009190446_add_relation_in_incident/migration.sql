-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_pyhsicalCopyId_fkey" FOREIGN KEY ("pyhsicalCopyId") REFERENCES "physical_copies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "loans"("id") ON DELETE SET NULL ON UPDATE CASCADE;
