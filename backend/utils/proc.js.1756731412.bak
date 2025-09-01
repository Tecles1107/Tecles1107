import { spawn } from "child_process";

export function spawnStream(cmd, args = [], opts = {}) {
  const proc = spawn(cmd, args, { stdio: ["ignore","pipe","pipe"], ...opts });
  return proc;
}
