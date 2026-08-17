# DSH Service Console

> A local development service console for DSH: discover listening ports, identify services related to the current conversation or workspace, and safely inspect, stop, or restart them.
>
> **DSH 本地开发服务控制台：发现监听端口，识别与当前对话或工作区相关的服务，并安全地查看、停止和重启。**

面向 DeepSeek Harness Web UI 的单职责插件。当模型（或你）启动本地开发服务（`npm run dev`、Vite、Next.js、Uvicorn、Express、Rust 等）时，Service Console 在一个地方把它们展示出来：监听了哪些端口、由什么命令和目录启动、是否属于当前对话或工作区、能否安全停止或重启。

## 功能

- **服务发现** — 扫描监听 TCP 端口，关联 PID、PPID、命令、工作目录、进程组与启动时间（macOS/Linux）。
- **归属与风险** — 五级归属：`本次对话`（与会话启动台账匹配）、`工作区`、`本机其他`、`未知`、`受保护`。
- **受控操作** — 对进程组优雅停止；对保存了安全启动命令的服务重启。每个动作均二次确认，并在操作前重新校验快照。
- **安全防护** — 任何信号前校验 PID 复用 / fingerprint；未知与受保护服务只读；强制终止默认关闭；无隐式自动清理；命令输出脱敏。
- **范围 / 搜索 / 配置 / 国际化** — 本次对话 / 工作区 / 本机三种范围、关键字过滤、刷新间隔 / 优雅超时 / 强制终止设置、中英文。

## 安装

原生安装（推荐）：

```bash
dsh plugin --profile web add -w @jiyr0119/dsh-service-console@latest
```

安装后刷新 DSH Web UI——会话头部出现 `🖥 SC` 入口，点击打开控制台面板。

> 注意：插件被 dsh-market/awesome 收录 ≠ 浏览器自动出现 UI。本包同时提供 Host 路由与浏览器 bundle，`dsh plugin add` 后面板即可用。支持 macOS / Linux；Windows 暂不支持。

备用方式——动态粘贴（零构建、进程级）：通过动态 Cordis 插件流程粘贴 `dynamic/host.js` + `dynamic/client.js`。

## 权限与安全

- Client 不直接传任意 PID 或 Shell 命令，只以 service ID 为目标，Host 在操作前重新校验 PID / 启动时间 / fingerprint。
- 优先优雅终止（SIGTERM 到进程组）；SIGKILL 仅在显式开启并确认后使用。
- 命令摘要中的敏感 token/密码会脱敏。
- 本插件**不是**通用进程管理器：系统关键、高权限、未知和受保护进程一律只读。

## 开发

```bash
pnpm install
npm run typecheck
npm run build
npm test          # 单元 + 集成测试（node --test）
```

## 许可证

MIT
