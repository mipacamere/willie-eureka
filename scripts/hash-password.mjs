#!/usr/bin/env node
// Genera l'hash bcrypt di una password, da incollare nel campo
// "passwordHash" di ADMIN_USERS_JSON o STAFF_USERS_JSON.
//
// Uso: node scripts/hash-password.mjs "la-tua-password"

import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password) {
  console.error("Uso: node scripts/hash-password.mjs \"la-tua-password\"");
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
const escapedForEnv = hash.replace(/\$/g, "\\$");

console.log("Hash bcrypt:");
console.log(hash);
console.log("\nDa incollare in ADMIN_USERS_JSON / STAFF_USERS_JSON dentro .env.local");
console.log("(i simboli $ sono già scappati con \\$, necessario perché Next.js");
console.log("espanderebbe altrimenti $2b$10$... come se fossero variabili):");
console.log(escapedForEnv);
