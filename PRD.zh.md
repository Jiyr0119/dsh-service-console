# DSH Service Console 产品 PRD

> 状态：Draft v0.2 · 2026-08-17（v0.1 + §17 补充说明）  
> 产品名称：**DSH Service Console**  
> 中文名称：**DSH 开发服务控制台**  
> npm / 插件 ID：`dsh-service-console`（建议包名：`@jiyr0119/dsh-service-console`）

---

## 1. 产品定位

**DSH Service Console 是 DSH 内面向本地开发服务的可观测与安全控制台。**

当大模型在任务中启动 `npm run dev`、Vite、Next.js、Uvicorn、Express、Rust 或其他常驻开发服务时，用户可以在 DSH 内清楚地看到：

- **什么服务正在运行**；
- **监听了哪些端口、可从哪里访问**；
- **它由什么命令、哪个工作目录启动**；
- **它是否属于当前 DSH 对话或当前工作区**；
- **是否可以安全地停止或重启**。

它把原本散落在终端、端口报错和对话上下文中的服务生命周期，收敛为一个清晰、可解释、可确认的控制台。

### 1.1 名称释义

- **Service**：聚焦真实运行的本地开发服务，而不只是抽象进程或端口。
- **Console**：强调“观察 + 操作”的统一入口，覆盖查看、诊断、停止、重启和后续健康检查/日志能力。
- **DSH**：明确服务上下文来自 DSH 工作区与 AI 任务，而非试图替代 macOS Activity Monitor、`top` 或系统任务管理器。

### 1.2 一句话价值主张

> 在 DSH 中集中查看、诊断、停止和重启 AI 任务相关的本地开发服务。

### 1.3 商店/README 短描述

> A local development service console for DSH: discover listening ports, identify services related to the current conversation or workspace, and safely inspect, stop, or restart them.

> DSH 本地开发服务控制台：发现监听端口，识别与当前对话或工作区相关的服务，并安全地查看、停止和重启它们。

---

## 2. 背景与问题

大模型为了验证任务，经常主动执行如下常驻命令：

```bash
npm run dev
pnpm dev
next dev
python -m uvicorn app:app --reload
cargo run
npm run preview -- --port 4173
```

命令启动后，服务可能继续监听端口，而模型会继续处理任务、失去上下文，或由用户关闭当前对话。用户因此需要反复处理以下问题：

| 问题 | 用户感受 | 造成的影响 |
|---|---|---|
| 不知道服务是否仍在运行 | “3000/5173 是谁占用的？” | 排查成本高 |
| 不知道服务来自哪里 | “是这个对话，还是另一个项目？” | 不敢停止，容易误杀 |
| 模型忘记清理服务 | “又得提醒它关掉端口” | 对话和开发流被打断 |
| 重复启动导致冲突 | “为什么又跑到 5174/3001？” | 访问错实例，资源浪费 |
| 父进程结束但子进程残留 | “终端关了，端口还在” | 难以彻底清理 |
| 直接 kill 风险太高 | “杀错会影响别的项目吗？” | 用户不信任自动化 |

### 产品机会

DSH 已具备会话、工作区、Host 能力与 Web UI 插槽。Service Console 可以在“命令执行”与“服务生命周期”之间建立关联：

1. **发现**：从本机监听端口和进程信息中发现服务；
2. **解释**：基于工作目录、命令、父子进程和 DSH 启动记录说明归属；
3. **控制**：用确认、进程组和 PID 复用校验安全地停止/重启；
4. **收尾**：让用户无需再次用自然语言要求模型清理服务。

---

## 3. 用户、场景与待完成任务

### 3.1 目标用户

1. 使用 DSH 完成前后端开发任务的个人开发者。
2. 同时维护多个项目、经常碰到端口冲突的开发者。
3. 开启多个 DSH 对话或多个工作区的重度用户。
4. 重视系统安全、不接受“自动杀未知进程”的专业用户。

### 3.2 用户待完成任务（Jobs to be Done）

- **当 AI 启动开发服务后**，我想立即知道它的端口、URL、命令和工作目录，以便确认验证对象正确。
- **当端口被占用时**，我想知道占用者及其归属，以便决定保留、停止或换端口。
- **当任务完成时**，我想只清理本次对话明确启动的服务，以便不影响其他工作。
- **当服务异常时**，我想快速查看它是否仍监听、是否可访问、为何无法重启，以便继续调试。
- **当我不确定一个进程的来源时**，我想先查看而不是被鼓励终止它，以便避免误操作。

### 3.3 核心场景

#### 场景 A：当前对话启动 Vite

模型执行 `npm run dev -- --port 5173`。用户在会话头部看到 Service Console 徽标 `1`，打开面板即可看到 Vite、`http://localhost:5173`、PID、工作目录及“本次对话 / 明确归属”。用户可打开 URL 或在任务结束后停止服务。

#### 场景 B：端口冲突排查

模型启动 3000 端口失败。用户进入“本机”范围，看到现有服务的命令、目录和归属。若该服务是旧工作区的开发服务，用户可在完整确认后将其停止。

#### 场景 C：结束任务时清理

用户切到“本次对话”，点击“停止全部”。控制台只列出有明确 DSH 启动记录的服务，并逐项反馈成功或失败，绝不顺带关闭未知服务。

#### 场景 D：进程已退出或 PID 被复用

用户点击停止前，Host 再次校验 PID、启动时间、命令摘要和工作目录。若目标已退出，显示“服务已结束”；若 PID 已被复用，拒绝操作并要求重新扫描。

---

## 4. 产品目标、非目标与原则

### 4.1 MVP 目标

- 在 3 秒内发现当前用户可见的常见本地开发服务。
- 清晰区分当前对话、当前工作区、本机其他和未知服务。
- 对明确归属服务提供可验证的停止和重启。
- 用户在两次点击加一次确认内完成单服务停止。
- 未知或受保护服务默认只读，避免误杀。

### 4.2 非目标

MVP 不做：

- 完整系统进程管理器、任意 Shell 或通用终端。
- 云服务器、Kubernetes、Docker 编排或远程 SSH 服务管理。
- 默认自动清理或关闭会话时自动杀服务。
- 对数据库/系统守护进程/高权限进程的管理。
- 仅凭端口号就断言服务属于当前 DSH 对话。

### 4.3 设计原则

1. **先解释，后控制**：每个高风险动作先显示归属和影响范围。
2. **不确定则降级**：无法确认归属时只读，不扩大自动化权限。
3. **进程组优先**：服务生命周期以进程树/process group 为单位，不只处理父 PID。
4. **默认可恢复**：优先优雅停止，强制终止必须二次确认。
5. **面向开发者**：服务、端口、URL、命令与工作目录都应一眼可见。
6. **不抢占 DSH 工作流**：作为轻量浮层，不占用工具调用详情区域，也不遮挡 composer。

---

## 5. MVP 功能范围与版本路线图

### 5.1 MVP / P0

| 能力 | 说明 |
|---|---|
| 本机服务发现 | 扫描监听 TCP 端口，关联进程、命令、PID、工作目录 |
| 服务控制台 | 在 DSH 浮层中展示列表、状态、详情和操作 |
| 范围筛选 | 本次对话、当前工作区、本机 |
| 归属与风险 | 明确归属、工作区推断、本机其他、未知、受保护 |
| 服务操作 | 打开 URL、复制地址、查看详情、停止、符合条件时重启 |
| 安全确认 | 显示命令、端口、PID、目录、归属和影响范围 |
| 自动刷新 | 默认 5 秒轮询，可手动刷新 |
| 配置 | 刷新周期、显示范围、优雅超时、未知服务显示、强制终止开关 |
| i18n/a11y | 中文/英文、主题、键盘、reduced motion |

### 5.2 V1 / P1

- 接入 DSH 命令启动记录，建立会话 ID、工作区、process group 与 service ID 的明确关联。
- 对本次对话明确服务提供一键批量停止。
- HTTP/TCP 健康检查与服务启动就绪状态。
- 最近日志尾部（默认 100 行，敏感信息脱敏，不默认长期保存）。
- 端口冲突解释和换端口建议。
- 给模型提供受策略约束的 `list_services` / `stop_service` 能力。

### 5.3 P2

- Docker/容器、Windows、远程工作区适配。
- 服务历史、别名、服务模板、任务结束提醒。
- 用户显式授权的自动清理策略。
- 与 DSH 执行日志/任务卡的深度联动。

---

## 6. 信息架构与交互

### 6.1 入口

**主入口：`conversation.session.header.utilities`。**

- 图标：网络节点/脉冲，Tooltip 为“运行中的服务”。
- 徽标：当前会话或当前工作区内运行服务数量。
- 点击打开 Service Console。

**辅助入口：`sidebar.footer.action`。**

- 用于从全局侧边栏打开同一控制台。
- 当没有会话上下文时，默认落在“当前工作区”或“本机”范围。

### 6.2 浮层

使用 `shell.overlay`，位置实时锚定在会话 header 底部和 composer 顶部之间：

- 不抢占 DSH details 列；
- 不遮挡输入框；
- 窗口尺寸或布局变化时重新测量；
- 遵守 `prefers-reduced-motion`。

### 6.3 面板结构

```text
┌─────────────────────────────────────────────┐
│ Service Console                  ↻  2 running │
│ [This conversation] [Workspace] [This Mac]   │
│ Search services, ports, paths…  [Status ▾]   │
├─────────────────────────────────────────────┤
│ ● Vite dev server                   5173     │
│   http://localhost:5173 · This conversation  │
│   /workspace/web-app        [Open][Stop]     │
├─────────────────────────────────────────────┤
│ ● Uvicorn                            8000     │
│   http://localhost:8000 · Workspace inferred │
│   /workspace/api            [Detail][Restart]│
├─────────────────────────────────────────────┤
│ Last scanned just now · 1 partial warning     │
└─────────────────────────────────────────────┘
```

### 6.4 列表内容

每个服务卡片/行显示：

| 内容 | 优先级 | 规则 |
|---|---|---|
| 运行状态 | 必须 | 颜色不能是唯一信息来源 |
| 服务名称 | 必须 | 从命令/框架推断，可在未来设别名 |
| 端口及 URL | 必须 | URL 仅对合理的 HTTP 本地服务生成 |
| 归属 | 必须 | 对话、工作区、本机其他、未知、受保护 |
| 工作目录 | 必须 | 优先相对当前工作区显示 |
| 命令摘要 | 必须 | 脱敏、超长折叠 |
| PID | 详情/辅助 | 列表可简化，详情完整显示 |
| 操作 | 必须 | 打开、详情、停止、重启（按权限显示） |

### 6.5 关键操作流程

#### 停止

1. 点击“停止”。
2. 确认框展示服务、端口、PID、进程组、命令、目录、归属和可能影响。
3. 用户确认。
4. Host 对目标 process group 发送优雅终止（macOS/Linux 为 `SIGTERM`）。
5. 在超时内重新扫描确认服务已退出。
6. 若超时，只提供“再试一次”或符合策略时的“强制终止”；绝不自动 `SIGKILL`。

#### 重启

1. 仅当服务拥有安全、完整的启动描述时显示“重启”。
2. 停止原服务并确认端口释放。
3. 以 executable + 参数数组 + 工作目录启动，不拼接未转义 Shell 字符串。
4. 进入“启动中”，等待端口监听或健康检查。
5. 成功后更新 PID/启动时间；失败后显示诊断和下一步。

#### 批量停止

MVP 只允许“本次对话”内**明确归属**服务批量停止。确认文案必须明确：

> 即将停止本次对话启动的 2 个服务（5173、8000），不会停止本机其他或未知服务。

---

## 7. 服务发现、归属与安全模型

### 7.1 发现信息

Host 从以下信息构建服务快照：

1. 本机监听 TCP/UDP 端口；
2. PID、父 PID、进程名、命令行；
3. 当前工作目录与项目根；
4. process group / 进程树；
5. DSH 会话与工作区上下文；
6. 可选本地 TCP/HTTP 健康探测。

### 7.2 归属分级

| 归属 | 条件 | 默认操作 |
|---|---|---|
| **本次对话 · 明确** | 有 DSH 启动记录且 PID/process group/端口匹配 | 查看、停止、重启 |
| **当前工作区 · 推断** | 工作目录属于当前工作区，且命令符合开发服务特征 | 查看；停止需严格确认；重启视启动信息而定 |
| **本机其他** | 可识别但不属于当前上下文 | 默认查看；仅用户切换“本机”范围后可尝试控制 |
| **未知** | 不能可靠读取命令/目录，或没有充分证据 | 只读 |
| **受保护** | 系统关键、其他高权限用户、DSH 宿主关键进程 | 只读且禁止控制 |

### 7.3 操作前校验

每次 stop/restart 前，Host 必须重新确认：

- service ID 对应的 PID 是否存在；
- PID 的启动时间是否匹配；
- 命令摘要、工作目录和进程组是否仍然匹配；
- 目标是否转为未知或受保护；
- 用户请求的操作是否符合当前 scope 和策略。

若 PID 已复用，返回 `PID_REUSED` 并拒绝操作。

### 7.4 风险标识

- **低风险**：本次对话明确启动。
- **中风险**：当前工作区推断，可能被其他会话使用。
- **高风险**：未知归属、非本工作区、绑定非 localhost、进程树不完整。
- **禁止**：受保护或权限不允许。

---

## 8. 功能需求与验收标准

### FR-01：扫描与刷新（P0）

- 支持手动刷新与默认 5 秒自动刷新。
- 每次返回 `scannedAt`、部分错误和权限能力。
- 单个目标读取失败不得中断全部结果。

**验收**：两个临时 HTTP 服务运行时，可发现各自端口、PID、命令与可读取的工作目录；部分权限错误仍显示其他结果。

### FR-02：服务详情（P0）

详情必须包含命令摘要、完整工作目录、PID/PPID、进程组、监听地址、端口、启动时间、归属证据、风险说明和最近操作。

**验收**：用户可理解某服务为何被标记为“本次对话”“工作区推断”或“未知”。

### FR-03：停止服务（P0）

- 仅控制满足策略的服务。
- 首选优雅终止和 process group。
- 服务已退出时返回成功语义“已结束”。
- 强制终止默认关闭，必须单独确认。

**验收**：由测试创建的 npm/Python 子进程树在停止后不再监听端口；连续点击不会重复发送危险信号。

### FR-04：重启服务（P0）

- 只向保存了安全启动描述的服务开放。
- 不能安全重启时，显示禁用原因，不模拟成功。
- 启动超时/端口冲突有明确错误码。

**验收**：可复现服务重启后显示新 PID；不具备启动描述的未知服务不显示可执行重启。

### FR-05：范围、搜索与筛选（P0）

范围：`本次对话`、`当前工作区`、`本机`。支持按服务名、端口、命令摘要、路径、状态和风险过滤。

**验收**：切换范围不会混淆归属；本机范围必须明确标识可能影响其他项目。

### FR-06：URL 操作（P0）

对于可推断的本地 HTTP 服务，提供“打开 URL”“复制 URL”；非 HTTP 服务只复制地址。

### FR-07：配置（P0）

| 配置 | 默认 | 限制 |
|---|---:|---|
| 自动刷新间隔 | 5 秒 | 2 / 5 / 10 / 30 秒，或关闭 |
| 默认范围 | 当前工作区 | 本机范围需显式切换 |
| 优雅停止超时 | 3 秒 | 1–15 秒 |
| 显示未知服务 | 开启 | 未知默认只读 |
| 允许强制终止 | 关闭 | 仍需单次确认 |
| 自动清理 | 关闭 | MVP 不支持隐式清理 |
| 命令显示 | 脱敏 | 不保存完整敏感参数 |

### FR-08：国际化、主题和可访问性（P0）

- DSH zh/en locale。
- 使用 `--dsw-alias-*` token，支持深浅主题。
- 可键盘导航，Enter 确认，Escape 关闭。
- 图标、状态颜色和文字提示同时存在。
- 遵守 reduced motion。

---

## 9. 权限、隐私与防误操作

### 9.1 最小权限

- 不默认请求管理员/root 权限。
- Client 不可直接发送任意 PID 或任意 Shell 命令给 Host。
- Host 以服务注册表中的 service ID 为目标，并在操作前校验快照。
- 不允许通过 restart 接口注入未经验证的命令、工作目录或环境变量。

### 9.2 保护规则

以下目标默认不能停止或重启：

- 系统关键进程；
- DSH 主进程及关键宿主进程；
- 高权限/其他用户进程；
- PID 复用疑似目标；
- 未知归属进程；
- 规则无法可靠构建进程组的高风险目标。

### 9.3 敏感信息处理

- 命令中的常见 token、密码、连接串、Cookie 进行脱敏。
- 不持久化完整环境变量。
- 操作历史只保存 service ID、动作、结果、时间和脱敏摘要。
- 用户复制诊断前显示敏感信息提醒。

---

## 10. DSH 技术方案

### 10.1 插件形态

建议先以动态 Cordis 插件验证，再发布原生 npm 包：

| 形态 | 用途 | 说明 |
|---|---|---|
| 动态 Cordis | 原型与快速验证 | Host/Client 纯 JS，使用 `harness.handle` / `host.call` |
| 原生 npm 包 | 正式发布 | Host `webServer` JSON 路由 + Client `__ModuleLoader__` bundle |

正式目录建议：

```text
dsh-service-console/
├── PRD.zh.md
├── TASKS.zh.md
├── package.json
├── dsh.plugin.json
├── cordis.patch.yml
├── tsconfig.json
├── tsconfig.build.json
├── tsdown.config.ts
├── src/
│   ├── index.ts                 # Host：webServer 路由注册
│   ├── host/
│   │   ├── process-inspector.ts
│   │   ├── service-registry.ts
│   │   ├── ownership.ts
│   │   ├── lifecycle.ts
│   │   └── redaction.ts
│   └── client/
│       ├── index.tsx            # Client：slots、locale、overlay
│       ├── ServiceConsole.tsx
│       └── service-console.module.css
├── dynamic/
│   ├── host.js
│   └── client.js
└── lib/                          # 构建产物（发布到 npm）
```

### 10.2 Host 职责

- 平台进程/端口查询抽象 `ProcessInspector`。
- 服务快照与 DSH 启动记录管理 `ServiceRegistry`。
- 归属评分、风险判断、PID 复用保护。
- 受控 stop/restart 状态机。
- 命令/日志脱敏。
- JSON API 路由逐条注册。

### 10.3 Client 职责

- 会话头部入口与全局入口。
- `shell.overlay` 服务面板。
- 轮询、缓存、请求取消和操作状态机。
- 确认框、错误解释、筛选和详情。
- locale、主题、a11y。

### 10.4 API 草案

建议前缀：`/dsh-sc/api/`。

| API | 用途 |
|---|---|
| `POST /dsh-sc/api/services/scan` | 按 scope 获取服务快照 |
| `POST /dsh-sc/api/services/detail` | 获取服务详情与归属证据 |
| `POST /dsh-sc/api/services/stop` | 停止受控服务 |
| `POST /dsh-sc/api/services/restart` | 重启可复现服务 |
| `POST /dsh-sc/api/services/open` | 获取安全的本地 URL 信息（Client 打开） |
| `POST /dsh-sc/api/config` | 读取和更新策略 |
| `POST /dsh-sc/api/actions` | 查询运行期操作历史 |

停止请求示例：

```json
{
  "serviceId": "svc_a1b2c3",
  "mode": "graceful",
  "expected": {
    "pid": 1234,
    "startedAt": 1723888800000,
    "fingerprint": "sha256:..."
  }
}
```

### 10.5 核心数据模型

```ts
type ServiceScope = 'conversation' | 'workspace' | 'machine'
type Ownership = 'conversation-confirmed' | 'workspace-inferred' | 'other-local' | 'unknown' | 'protected'
type ServiceStatus = 'running' | 'starting' | 'stopping' | 'exited' | 'unreachable' | 'permission-denied' | 'unknown'

interface Service {
  id: string
  status: ServiceStatus
  ownership: Ownership
  confidence: 'confirmed' | 'inferred' | 'unknown'
  name: string
  pid: number
  processGroupId?: number
  parentPid?: number
  commandSummary?: string
  cwd?: string
  startedAt?: number
  listeners: Array<{ host: string; port: number; protocol: 'tcp' | 'udp'; url?: string }>
  restartable: boolean
  protected: boolean
  ownershipEvidence: string[]
  fingerprint: string
}
```

### 10.6 错误码

| 错误码 | 用户提示 |
|---|---|
| `PERMISSION_DENIED` | 没有权限读取或控制该服务；已降级为只读。 |
| `TARGET_GONE` | 该服务已结束，列表已刷新。 |
| `PID_REUSED` | 进程身份已变化，为避免误操作已取消本次操作。 |
| `UNKNOWN_OWNERSHIP` | 无法确认服务来源，默认不允许控制。 |
| `PROTECTED_PROCESS` | 该进程受保护，不能通过 Service Console 操作。 |
| `GRACEFUL_TIMEOUT` | 服务未在等待时间内退出，可重试或在设置允许时强制终止。 |
| `RESTART_UNSAFE` | 缺少安全复现启动所需的信息，不能重启。 |
| `PORT_CONFLICT` | 服务启动失败：目标端口仍被占用。 |
| `START_TIMEOUT` | 服务未在预期时间内开始监听。 |
| `SCAN_PARTIAL` | 部分服务信息不可读取，其余结果仍可用。 |

---

## 11. 状态、异常与边界

必须覆盖：

- shell → npm → runtime → watcher 的多级进程树；
- 一个服务监听多个端口；
- IPv4/IPv6 同时监听；
- 端口释放后被其他服务抢占；
- 服务自行重启，PID 变化；
- 服务启动后快速崩溃；
- 端口可见但命令/目录不可见；
- 用户连续点击停止或重启；
- 当前会话已关闭但服务仍运行；
- 多个 DSH 会话同时关联同一工作区；
- 服务绑定 `0.0.0.0` 或局域网地址；
- 扫描超时、平台命令缺失或权限变化。

### 服务状态机

```text
not-found ──scan──> starting ──listener found──> running
    ▲                  │                           │
    │                  └──timeout/error──> error   │ stop
    │                                              ▼
    └────────────────────────────── exited <── stopping

running ──restart──> stopping ──port released──> starting
```

---

## 12. 成功指标

| 指标 | MVP 目标 |
|---|---:|
| 常见 Node/Python/Rust 开发服务发现成功率 | ≥ 95%（macOS/Linux、当前用户权限） |
| 明确归属服务停止成功率 | ≥ 95% |
| 可重启服务重启成功率 | ≥ 90% |
| 打开控制台至首个结果 | P95 ≤ 3 秒 |
| 单服务停止操作 | ≤ 2 次点击 + 1 次确认 |
| 发布后的误终止事故 | 0 起阻断级事故 |
| 任务完成后明确归属服务残留率 | 相对基线下降 80% |

---

## 13. 测试与发布验收

### 13.1 单元测试

- 平台输出解析；
- 路径归一化与归属评分；
- 命令脱敏；
- service fingerprint 与 PID 复用保护；
- stop/restart 状态机、超时、幂等性；
- API 参数/策略校验。

### 13.2 Host 集成测试

测试 harness 创建并最终清理临时服务，覆盖：

1. 单服务和多服务发现；
2. npm/Python 子进程树；
3. 优雅停止和超时；
4. 端口冲突；
5. 目标已退出和 PID 复用；
6. 权限不足、未知和受保护服务；
7. 安全重启、启动超时和日志诊断。

测试不得对真实用户进程发出终止信号。

### 13.3 Client 验收

- 空态、扫描中、部分失败、权限不足、服务退出等状态完整。
- 范围切换、搜索、详情和操作确认准确。
- 批量操作逐项反馈。
- 深浅主题、zh/en、窄窗口、键盘与 reduced motion 验证。

### 13.4 DSH 发布验证

原生包发布前至少完成：

```bash
npm run typecheck
npm run build
# 临时 DSH profile 安装并验证 composition/patch 解析
# 真实 DSH Web profile 安装、刷新后验证 header 入口、浮层和 Host API
```

Host 路由必须逐条 `webServer.register`，不得将路由数组一次性注册。Client bundle ID 必须与 npm 包名一致。

---

## 14. 风险与开放决策

| 问题 | MVP 推荐决策 |
|---|---|
| 首版平台 | macOS/Linux；Windows 后续适配或只读降级 |
| 默认范围 | 当前工作区；本机范围由用户主动切换 |
| 自动清理 | 默认关闭；关闭会话/插件不停止服务 |
| 强制终止 | 默认关闭；仅明确归属服务、优雅超时、二次确认后提供 |
| 模型控制服务 | MVP 不开放；V1 用受策略约束的工具能力 |
| 历史存储 | MVP 仅运行期、非敏感元数据 |
| HTTP 探测 | 只探测本地服务，默认不访问外网、不发副作用请求 |
| 未知服务 | 始终只读，展示风险和可解释原因 |

---

## 15. MVP Definition of Done

- [x] 可发现 macOS/Linux 当前用户的常见本地开发服务。（T1-1 + T2-6 集成测试验证）
- [x] 服务卡片显示端口、PID、命令摘要、工作目录和归属置信度。（T1-11 面板实现）
- [x] 当前对话/工作区/本机三种范围可正确筛选。（T1-12 实现）
- [x] 明确归属服务能以进程组方式优雅停止，并验证端口释放。（T1-6 + T2-6 验证）
- [~] 具备 PID 复用、未知归属和受保护进程防护。（操作前重扫校验 ✅；显式 startedAt/PID 复用比对待 M2 原生版加强）
- [x] 可安全重启具备完整启动描述的服务。（T1-6 台账启动命令重启）
- [x] 停止/重启均有影响范围确认与可读错误反馈。（二次确认 + 错误码本地化）
- [x] 不会隐式自动清理，也不会默认强制终止。（config 默认值）
- [~] 支持 zh/en、深浅主题、键盘操作及 reduced motion。（T1-17 实现，浏览器最终验收待 T1-18）
- [~] 单元、Host 集成、Client 验收及真实 DSH Web 挂载验证通过。（单测 7/7 + 集成 2/2 ✅；Client 验收 + 真实挂载待浏览器/web profile）

---

## 16. 与 `dsh-workspace-explorer` 的关系

Service Console 是一个独立、单职责的插件：

- `dsh-workspace-explorer` 解决“读路径”：浏览文件、预览内容、向模型插入文件引用；
- `dsh-service-console` 解决“运行路径”：发现服务、理解端口与归属、控制服务生命周期。

二者可以共享成熟的 DSH Host/Client 架构经验、`shell.overlay` 交互模式、locale、设计 token 与原生包发布流程，但应独立安装、独立权限、独立发布，避免把文件浏览器膨胀为全能工作台。

---

## 17. 补充说明与修订记录（v0.2 · 2026-08-17）

> 本节是开发任务拆分前对 v0.1 的补充，解决 MVP 归属来源的表述矛盾，并补齐技术环境、平台命令策略、fingerprint/API 细节、里程碑划分与测试夹具。本节定稿后进入开发阶段（任务拆分见 `TASKS.zh.md`）。

### 17.1 澄清：MVP 阶段"本次对话 · 明确"归属的建立方式

v0.1 的 §5.1（P0 不含启动记录接入）与 §7.2（存在 `conversation-confirmed`）存在矛盾。补充决策：

1. **首选方案（M0 验证）**：插件内建**会话启动台账（Session Launch Ledger）**。动态插件通过 DSH 命令执行事件/工具调用链（可用性需在 M0 调研确认）记录本会话发起的常驻命令：`{sessionId, workspaceId, command, cwd, startedAt, processGroupId}`。
2. 扫描时以 **PID / 进程组 / 端口 / 启动时间窗口** 与台账匹配 → 判定 `conversation-confirmed`。
3. **降级方案**：若 DSH 不暴露命令执行事件，MVP 对"本会话工作区 + 最近启动时间窗口 + 命令特征"命中者标记为 `workspace-inferred`，`conversation-confirmed` 延后至 V1 接入正式启动记录。
4. **M0 定稿（2026-08-17）**：首选方案**可行，无需降级**。DSH Host 暴露 `tools/result`（emit）事件，按 `exec.agent` 作用域分发，`exec` 含工具名、解析后参数与调用者 agent——可观察本会话的 bash 工具调用（命令、cwd、时间），台账据此建立。实现细节见 `M0-CAPABILITY.zh.md`。

### 17.2 技术环境与依赖

| 项 | 要求 |
|---|---|
| DSH 版本 | 当前开发主线；M0 实测记录 Inspect/Slot/token 版本并锁定 |
| Node.js | ≥ 20（与 DSH 宿主一致） |
| 平台 | macOS 14+ / Linux（x86_64、arm64）；Windows 仅 P2 范围 |
| 测试框架 | vitest（单元测试）+ 自建临时服务 harness（Host 集成测试） |
| 构建 | Host：tsdown ^0.22（ESM / Node）；Client：tsdown（CJS / browser）产出 `__ModuleLoader__` bundle；`react`/`react-dom`/`@deepseek-ai/cordis` 及 DSH client 平台模块全部 external；CSS Modules 用 lightningcss ^1.32 内联注入 `<style data-plugin>`；typecheck：`tsc --noEmit` |
| Client bundle ID | `window.__ModuleLoader__.load({ id })` 的 `id` 必须**严格等于 npm 包名（含 scope）**：`@jiyr0119/dsh-service-console` |

| 代码风格 | Prettier + ESLint（非阻塞项） |

> 本表已与 `dsh-workspace-explorer` 沉淀的已验证经验校准，实施细节与坑位见 `DEVELOPMENT-AND-AWESOME-GUIDE.zh.md`（构建、`__ModuleLoader__` 契约、逐条路由、patch YAML 引号、pnpm `-w`、awesome 收录流程等）。

### 17.3 平台命令与解析策略

| 数据 | macOS | Linux |
|---|---|---|
| 监听端口 | `lsof -nP -iTCP -sTCP:LISTEN`（UDP 用 `-iUDP`） | 优先 `ss -tlnp`，fallback `netstat -tlnp` |
| 进程信息 | `ps -o pid=,ppid=,lstart=,command=` | 同左 |
| 工作目录 | `lsof -a -p <pid> -d cwd` | 读 `/proc/<pid>/cwd` |
| 降级规则 | 进程信息读取失败时服务仍展示（端口可见），归属降为 `unknown`/`protected`，返回 `SCAN_PARTIAL` | 同左 |

**M0 实测（2026-08-17，macOS Darwin 25.5 x86_64）**：`lsof`/`ps`/`lsof -a -p <pid> -d cwd` 全部可用且能发现测试 HTTP 服务。解析注意：进程名可能含 `\x20` 空格转义；同一 PID 多行（多端口/IPv4+IPv6）需按 PID 聚合；`ps lstart` 为英文月份缩写且年份在后；UDP 输出混有已连接 socket（监听特征为 NAME 无 `->`）；macOS 无 `ss`，fallback `netstat`。Linux 侧（`ss`/`netstat`/`/proc/<pid>/cwd`）待 Linux 环境补测。详见 `M0-CAPABILITY.zh.md`。

### 17.4 fingerprint 与 PID 复用校验定义

- `fingerprint = sha256(pid | startedAt | commandSummary | cwd | 排序后 listeners)`
- 操作前校验：`pid` 存在 **且** `startedAt` 一致 **且** `fingerprint` 一致 → 通过；否则返回 `PID_REUSED` 或 `TARGET_GONE`。

### 17.5 API 草案细化

统一响应信封：`{ ok: boolean, data?: any, error?: { code: string, message: string } }`。

- `POST /dsh-sc/api/services/scan` 请求 `{ scope: 'conversation' | 'workspace' | 'machine', refresh?: boolean }`
  响应 `data: { scannedAt, services: Service[], partialWarnings: string[], capabilities: { canStop, canRestart, forceKillEnabled } }`
- `POST /dsh-sc/api/services/stop` 响应 `data: { result: 'stopped' | 'already-exited' | 'rejected' }`
- `POST /dsh-sc/api/services/detail` 响应 `data: Service & { ownershipEvidence, recentActions, risk }`
- `POST /dsh-sc/api/services/open`：**可选**。若 `scan`/`detail` 已返回 `listeners[].url`，Client 直接 `window.open` 即可，无需单独 API（经验校准：`dsh-workspace-explorer` 未使用 open 路由）。
- 完整 schema 以任务 T1-7 的实现为准，并以本节约定的信封与 §10.6 错误码为约束。

### 17.6 里程碑划分（对应任务拆分）

| 里程碑 | 内容 | 退出标准 |
|---|---|---|
| M0 调研验证 | 能力面调研、平台命令矩阵、最小 Spike | §17.1 决策定稿；能力清单与平台差异记录产出 |
| M1 动态原型 | Host + Client + API 全链路（动态 Cordis 插件） | 在 DSH Web 中对真实临时服务完成 发现/详情/停止/重启/批量 走查 |
| M2 原生包化 | 脚手架、`harness.handle`→`webServer.register` 迁移、自动化测试 | `typecheck`/`build` 通过；单测+集成测试绿；真实 DSH Web profile 挂载验证通过 |
| M3 验收发布 | Client 验收、文档、npm 发布 | §15 DoD 逐项核对通过；发布后冒烟通过 |

### 17.7 测试服务夹具

集成测试使用自建临时服务，测试结束必须清理，且**绝不向真实用户进程发出终止信号**：

- Node：`node server.js`（简单 HTTP）+ `npm run dev`（Vite 样板）；
- Python：`python -m http.server <port>`、uvicorn 样例（本机 Python 3.10+ 时）；
- 进程树：`sh -c 'npm run dev'` 制造 shell → npm → node 多级进程树；
- Rust（可选）：`cargo run` 简单 axum；本机无 Rust 时降级跳过并记录。

### 17.8 新增开放问题

| 问题 | 说明 | 定稿时机 |
|---|---|---|
| DSH 命令执行事件是否可用？ | 决定 §17.1 首选/降级方案 | M0（T0-1） |
| 配置持久化位置 | 走 DSH 配置机制还是插件本地文件 | M2（T2-4） |
| 动态→原生 API 兼容层 | 过渡期是否保留 `harness.handle` 适配层 | M2（T2-2） |
