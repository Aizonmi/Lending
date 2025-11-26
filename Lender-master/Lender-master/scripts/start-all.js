const { spawn } = require("child_process");
const path = require("path");

const isDev = process.argv[2] === "dev";

console.log(" Starting all Lendify services...\n");

const commands = [
  {
    name: "Member A Backend",
    command: "npm",
    args: isDev ? ["run", "dev"] : ["start"],
    cwd: path.join(__dirname, "..", "backend", "member-a"),
    color: "\x1b[36m"
  },
  {
    name: "Member B Backend",
    command: "npm",
    args: isDev ? ["run", "dev"] : ["start"],
    cwd: path.join(__dirname, "..", "backend", "member-b"),
    color: "\x1b[32m"
  },
  {
    name: "Member C Backend",
    command: "npm",
    args: isDev ? ["run", "dev"] : ["start"],
    cwd: path.join(__dirname, "..", "backend", "member-c"),
    color: "\x1b[33m"
  },
  {
    name: "Frontend",
    command: "npm",
    args: ["start"],
    cwd: path.join(__dirname, "..", "frontend"),
    color: "\x1b[35m"
  }
];

const processes = [];

commands.forEach((cmd) => {
  const proc = spawn(cmd.command, cmd.args, {
    cwd: cmd.cwd,
    shell: true,
    stdio: "inherit"
  });

  processes.push(proc);

  proc.on("error", (error) => {
    console.error(`${cmd.color}[${cmd.name}]\x1b[0m Error:`, error.message);
  });

  proc.on("exit", (code) => {
    if (code !== 0 && code !== null) {
      console.error(`${cmd.color}[${cmd.name}]\x1b[0m Process exited with code ${code}`);
    }
  });
});

process.on("SIGINT", () => {
  console.log("\n\n Shutting down all services...");
  processes.forEach((proc) => {
    proc.kill("SIGINT");
  });
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n\n Shutting down all services...");
  processes.forEach((proc) => {
    proc.kill("SIGTERM");
  });
  process.exit(0);
});

console.log("\n All services are starting...");
console.log(" Press Ctrl+C to stop all services\n");
