# M0 调研与验证报告（dsh-service-console）

> 里程碑 M0 交付物 · 2026-08-17
> 覆盖任务：T0-1（能力面调研）、T0-2（平台命令实测）；T0-3（Spike）状态见文末。

---

## 1. §17.1 决策定稿：会话归属首选方案可行 ✅

**结论：首选方案（Session Launch Ledger，监听 DSH 工具执行）可行，无需降级。**

| 项 | 结论 |
|---|---|
| 观察点 | Host 事件 **`tools/result`**（emit）：`(exec: ToolExecution, result: ToolExecutionResult)`，按 `exec.agent` 作用域分发，监听失败被隔离 |
| exec 内容 | 工具名（bash）、解析后参数（含 `command`）、调用者 agent（会话上下文） |
| 实现路径 | Host 监听 `tools/result`，`tool.name === 'bash'` 且命令匹配常驻服务特征（`npm run dev`、`uvicorn`、`next dev`、`cargo run` 等）时，写入运行期台账 `{sessionId, command, cwd, startedAt}`；扫描时以 PID/进程组/端口/时间窗口匹配 → `conversation-confirmed` |
| 备选 | `tools/execute`（waterfall）也能看到调用但带拦截责任，纯观察不用它 |
| 降级方案 | 保留为 fallback（无事件时 workspace-inferred），MVP 不再需要 |

## 2. 动态 Host 能力清单

### 2.1 Builtins（动态 Host 可用符号）

| 符号 | 用途 |
|---|---|
| `ctx` | `get`/`on`/`provide`/`effect` |
| `harness` | `handle(method, handler)`（Client RPC）、`defineTool`、`registerTool` |
| `console` | `log`/`error`（Package 标记日志） |
| `btoa`/`atob`/`TextEncoder`/`TextDecoder` | 编解码 |

**无 `process`/`Buffer`/`child_process`/`fetch` 全局** —— 系统命令必须走服务。

### 2.2 Host Services（本项目相关）

| 服务 | 用途（本项目） |
|---|---|
| `shell` | `run(spec)`（前台）、`start(spec): ShellProcess`（后台，`kill`/`done`）—— **动态阶段执行 lsof/ps 的通道**；后台进程随组合 teardown 被停止 |
| `subprocess` | `spawn(spec): SubprocessHandle`；**`terminate` = SIGTERM→grace→SIGKILL 树级终止**（T1-6 停止服务的核心）；`waitForExit` 观察整树存活 |
| `tools/result` 事件 | 会话启动台账观察点（见 §1） |
| `session/event` 事件 | 会话事件流（备选观察） |
| `workspaceRegistry` | `get(id)`/`list()`/`resolveByPath(path)` —— cwd→workspace 归属判定 |
| `sessions`/`agents` | 会话与 agent 上下文 |
| `settings` | `register(ns, schema)`/`get`/`update` —— M2 配置持久化载体 |
| `timer` | 轮询/超时（需 `inject: ['timer']`） |
| `webServer` | 原生包路由注册（`register(route)` 单条注册） |

### 2.3 Client Slots（目标入口全部存在）

| Slot | kind/scope | 注册字段 | 关键标准 props | 现状 occupants |
|---|---|---|---|---|
| `conversation.session.header.utilities` | list / session | id 必填 + order/label | `useSessions`/`useWorkspaces`/`useSession`/`sessionId`/`useProjection`/`useInput` | session-log-download、workspace-explorer-drawer |
| `sidebar.footer.action` | list / root | id 必填 + order/label | — | 空 |
| `shell.overlay` | list / root | id 必填 + order/label | `useSessions`/`useWorkspaces` | workspace-explorer-panel、dsh-market-toast |
| `settings.section` | list / root | id 必填 + order/label | — | 空 |

注意点：
- `shell.overlay` **默认点击穿透**（entries opt back into pointer events）——面板容器需自行 opt-in。
- overlay 是 frame-wide 浮层，不自动锚定到 header/composer 之间；按经验指南动态测量定位。
- 新入口用独立 `id` 添加，不替换现有 occupant。

### 2.4 主题 token（`--dsw-alias-*`，均需 light/dark 双值）

`bg-base`、`bg-layer-1`、`bg-layer-2`、`bg-overlay`、`border-l1`、`border-l2`、`brand-primary`、`label-primary`、`label-secondary`、`state-error-primary`、`state-success-primary`、`state-warn-primary`、`dsw-specific-sidebar-fill`。

## 3. §17.3 平台命令实测（macOS）

实测环境：Darwin 25.5.0 x86_64；临时 node HTTP 服务监听 `127.0.0.1:8931`。

| 命令 | 结果 | 解析要点 |
|---|---|---|
| `lsof -nP -iTCP:<port> -sTCP:LISTEN` | ✅ 精确发现 | NAME 列 `127.0.0.1:8931 (LISTEN)` |
| `lsof -nP -iTCP -sTCP:LISTEN` | ✅ 全量发现 | 含 `*:8080`（通配绑定）与 IPv6；**进程名可能含 `\x20` 转义空格**（`Code\x20H`） |
| `ps -o pid=,ppid=,lstart=,command=` | ✅ | lstart 格式 `Mon Aug 17 19:32:16 2026`（英文月份缩写、年份在后） |
| `ps -o pid=,pgid=,ppid=` | ✅ | 后台 job 的 pgid = 父 shell pid（进程组控制可行） |
| `lsof -a -p <pid> -d cwd` | ✅ | FD=cwd / TYPE=DIR 行给出工作目录 |
| `lsof -nP -iUDP` | ✅ 可用 | **混有已连接 socket**（NAME 含 `->`）；监听特征为 `*:port` 无箭头 |
| 端口释放验证 | ✅ | kill 后 lsof 无输出 |

其他：macOS **无 `ss`**；`netstat` 位于 `/usr/sbin/netstat`（fallback 候选）。Linux 侧（`ss -tlnp`、`/proc/<pid>/cwd`）待 Linux 环境补测。

## 4. 对实现的影响（回写任务）

| 影响 | 任务 |
|---|---|
| ProcessInspector 通过 `ctx.get('shell').run` 执行 lsof/ps（短超时），不用 Node child_process | T1-1 |
| Lifecycle 停止用 `ctx.get('subprocess')` 的 `terminate`（树级 SIGTERM→SIGKILL）或 shell 后台进程 kill | T1-6 |
| 会话台账监听 `tools/result`（agent 作用域），台账键含 agent/sessionId | T1-3 |
| 归属判定用 `workspaceRegistry.resolveByPath(cwd)` | T1-4 |
| overlay 容器需显式开启 pointer events | T1-10 |
| 配置持久化（M2）用 `settings` 服务注册 namespace | T2-4 |

## 5. T0-3 Spike 状态 ✅（2026-08-17）

**动态插件 `scsp-1/pkg-1` 定义并运行成功，验证结论：**

| 验证项 | 结果 |
|---|---|
| Host `harness.handle('ping')` 注册 | ✅ runtime.handlers = `["ping"]`，Host running |
| Client 激活（header.utilities + shell.overlay 注册） | ✅ Client running，无等待依赖、无渲染错误 |
| `host.call` → `harness.handle` RPC 链路 | ✅ 链路建立（面板/按钮调用 ping 返回 `{ok, echo, …}`） |
| `tools/result` 观察点（T1-3 台账核心） | ✅ `ctx.on('tools/result')` 已注册；本 agent 执行 bash 工具调用后可在面板中看到 `lastTool.name === 'bash'` |
| `ctx.get('shell').run` 系统命令通道 | ✅ Host 侧可用（面板显示 lsof 采样输出） |
| `shell.overlay` 点击穿透注意点 | ✅ 面板容器设置 `pointerEvents: 'auto'` 生效 |

**浏览器验证指引**：会话 header 右侧出现 "SC Spike" 按钮（点击后显示 `OK client`）；页面右上角有 "SC Spike Panel"，其中 `shellAvailable: true`、`lsofSample` 为 lsof 输出、`lastTool.name` 为最近一次工具调用名（bash）。

> Spike 插件保留运行，可随时 `cordis_stop('scsp-1')` 停用、`cordis_undefine('scsp-1')` 删除；M1 开发从 T1-1 开始。
