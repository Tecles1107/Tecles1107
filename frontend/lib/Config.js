export const Config = {
  apiBase: "",
  endpoints: {
    chat: "/api/chat",
    health: "/api/health",
    terminal: "/api/terminal/execute",
    gitStatus: "/api/git/status",
    gitLog: "/api/git/log",
    gitAdd: "/api/git/add",
    gitCommit: "/api/git/commit"
  },
  timeouts: {
    connect: 10000,
    response: 30000
  }
};
