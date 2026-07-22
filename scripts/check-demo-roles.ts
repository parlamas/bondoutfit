// scripts/check-demo-roles.ts
import { prisma } from "../src/lib/prisma";

async function main() {
  const users = await prisma.user.findMany({
    where: { email: { in: ["horistics@outlook.com", "horistics@gmail.com"] } },
    select: { email: true, role: true },
  });
  console.log(users);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });