# DSH Service Console

> A local development service console for DSH: discover listening ports, identify services related to the current conversation or workspace, and safely inspect, stop, or restart them.

**DSH 本地开发服务控制台：发现监听端口，识别与当前对话或工作区相关的服务，并安全地查看、停止和重启。**

Single-purpose plugin for the DeepSeek Harness web UI. When the model (or you) starts a local dev server (`npm run dev`, Vite, Next.js, Uvicorn, Express, Rust, …), Service Console shows it in one place: which ports it listens on, which command and working directory started it, whether it belongs to this conversation or workspace, and whether it is safe to stop or restart.

## Features

- **Discovery** — scans listening TCP ports and correlates PID, PPID, command, working directory, process group and start time (macOS/Linux).
- **Ownership & risk** — five-level attribution: `This chat` (matched against the session launch ledger), `Workspace`, `Other local`, `Unknown`, `Protected`.
- **Control** — graceful stop to the process group, restart with a safe saved launch command. Every action is confirmed twice and re-validated against the current snapshot.
- **Safeguards** — PID-reuse / fingerprint checks before any signal; unknown and protected services are read-only; force-kill is off by default; no implicit auto-cleanup; command output is redacted.
- **Scopes, search, config, i18n** — conversation / workspace / machine scopes, keyword filtering, refresh interval / graceful timeout / force-kill settings, zh/en.

## Install

Native package (recommended):

```bash
dsh plugin --profile web add -w @jiyr0119/dsh-service-console@latest
```

Then refresh the DSH web UI — a `🖥 SC` entry appears in the conversation header and opens the console panel.

> Note: a plugin being listed in dsh-market/awesome does not mean its UI auto-appears — this package ships both Host routes and a browser bundle, so after `dsh plugin add` the panel is present. Works on macOS / Linux; Windows is not supported yet.

Alternative — dynamic paste (zero-build, process-local): paste `dynamic/host.js` + `dynamic/client.js` via the dynamic Cordis plugin flow.

## Permissions & safety

- The client never sends raw PIDs or shell commands; it targets a service ID and the Host re-validates PID / start time / fingerprint before acting.
- Graceful termination first (SIGTERM to the process group); SIGKILL only when explicitly enabled and confirmed.
- Sensitive tokens/passwords in command summaries are redacted.
- This plugin is **not** a general process manager: system-critical, high-privilege, unknown and protected processes are read-only.

## Development

```bash
pnpm install
npm run typecheck
npm run build
npm test          # unit + integration tests (node --test)
```

## License

MIT
