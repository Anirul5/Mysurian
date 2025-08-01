// check-branch.js
const { execSync } = require("child_process");

const branch = execSync("git rev-parse --abbrev-ref HEAD").toString().trim();

if (branch !== "master") {
  console.error(`❌ Deployment blocked: You're on branch '${branch}', not 'master'.`);
  process.exit(1);
} else {
  console.log("✅ Deployment allowed from 'master' branch.");
}