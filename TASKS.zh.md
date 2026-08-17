# DSH Service Console 开发任务拆分

> 来源 PRD：`PRD.zh.md`（v0.2，含 §17 补充说明）
> 经验校准：`DEVELOPMENT-AND-AWESOME-GUIDE.zh.md` 及其**源文档**——`../dsh-workspace-explorer/docs/experience.md`（核心经验，v0.4.0）、`docs/publish.md`（发布流程）、`docs/verify-native.md`（原生挂载验证）、`docs/install.md`、`docs/native-package.md`、`docs/awesome-submission.yml`，以及仓库实际配置 `tsdown.config.ts` / `cordis.patch.yml` / `dsh.plugin.json` / `manifest.json` / `package.json`。任务定义与这些源材料为准。
> 用途：开发过程追踪。任务完成时在 `[ ]` 内打勾并更新"状态"列。
> 创建日期：2026-08-17 · 修订：2026-08-17（v2：校准经验指南；v2.1：校准源文档）

---

## 0. 追踪说明

- 每个任务有稳定 ID：`T{里程碑}-{序号}`，对应代码/commit 时可直接引用。
- 状态：`⬜ 未开始` / `🔄 进行中` / `✅ 完成` / `⛔ 阻塞`。
- 依赖：前置任务 ID；`—` 表示无依赖。
- 预估：单人开发的人日（1d = 1 个工作日）。
- 里程碑退出标准见 PRD §17.6；实施日仍须在 canonical 仓库与当前 DSH 版本上复核上游流程（经验指南 §1）。

---

## 1. 里程碑总览

| 里程碑 | 主题 | 任务数 | 预估 | 退出标准 |
|---|---|---|---|---|
| M0 | 调研与验证 | 3 | 1d | ✅ 2026-08-17：§17.1 决策定稿（首选方案可行）；能力清单与平台差异记录产出（`M0-CAPABILITY.zh.md`）；Spike 全链路验证通过 |
| M1 | 动态插件原型（核心交付） | 18 | 15.5d | 在 DSH Web 中对真实临时服务完成发现/详情/停止/重启/批量走查 |
| M2 | 原生包化与自动化测试 | 7 | 6.5d | typecheck/build 通过；preflight 组合解析通过；单测+集成测试绿；真实 DSH Web profile 挂载验证通过 |
| M3 | 验收、发布与 awesome 收录 | 6 | 3.5d | PRD §15 DoD 逐项核对通过；npm 发布后冒烟通过；awesome 收录 PR 已提交 |
| **合计** | | **34** | **约 26.5d（5–6 周）** | |

---

## 2. M0 调研与验证

### T0-1 调研 DSH 插件能力面，定稿会话归属方案
- **做什么**：用 Inspect Provider 查询 Slots（`conversation.session.header.utilities`、`sidebar.footer.action`、`shell.overlay`、`settings.section`）、主题 token（`--dsw-alias-*`）、locale 机制（`@deepseek-ai/dsh-client-locale`）、`harness.handle` / `host.call` 链路；确认动态插件纯 JS 约束与 JSON-safe 参数要求；重点确认 DSH 是否暴露**命令执行事件/启动记录查询**（决定 PRD §17.1 首选还是降级方案）。
- **交付**：能力清单文档（含每个 Slot 的注册契约、locale namespace 规则）；§17.1 决策定稿并回写 PRD。
- **验收**：每个入口 Slot 的注册契约已查询并记录；会话归属方案有明确结论；已确认 `harness` 仅动态版可用、原生包无此全局。
- **依赖**：— ｜ 优先级 P0 ｜ 预估 0.5d

### T0-2 平台命令矩阵实测
- **做什么**：在 macOS 与 Linux（可用时）实测 PRD §17.3 的 `lsof` / `ss` / `netstat` / `ps` / cwd 读取（`lsof -a -p <pid> -d cwd`、`/proc/<pid>/cwd`），记录输出格式、权限不足时的行为与降级路径。
- **交付**：平台差异与解析样例记录（回写 §17.3）。
- **验收**：每个平台的端口/进程/cwd 读取命令各至少一次真实执行，输出样例入库。
- **依赖**：— ｜ 优先级 P0 ｜ 预估 0.5d

### T0-3 Spike：最小动态插件跑通全链路
- **做什么**：用动态 Cordis 插件（Host `harness.handle` + Client `host.call`）验证：header Slot 注册 → 点击打开 `shell.overlay` → Client 调用 Host 方法 → 返回 JSON 渲染。遵守纯 JS 约束（无 import/require/TS/JSX，React 用 `React.createElement`；避免函数被 JSX 引用前的 TDZ 坑，见经验指南 §3.1）。
- **交付**：可运行的 Spike 插件（验证后清理或保留为 M1 起点）。
- **验收**：从浏览器 UI 到 Host 端到端往返一次成功。
- **依赖**：T0-1 ｜ 优先级 P0 ｜ 预估 0.5d

---

## 3. M1 动态插件原型（核心交付）

### 3.1 Host 侧

#### T1-1 ProcessInspector：端口与进程发现（macOS/Linux）
- **做什么**：封装 §17.3 平台命令：监听 TCP/UDP 端口扫描、进程信息（PID/PPID/命令/启动时间）、工作目录读取、进程组/进程树构建；单目标读取失败不中断整体（`SCAN_PARTIAL`）。**平台差异只存在于这一层，不向其他模块泄漏**。
- **验收**：PRD FR-01 验收通过——两个临时 HTTP 服务可发现各自端口、PID、命令与 cwd；部分权限错误仍返回其余结果。
- **依赖**：T0-2 ｜ 优先级 P0 ｜ 预估 1.5d

#### T1-2 ServiceRegistry：服务快照与身份
- **做什么**：将端口/进程/进程树合并为 `Service` 快照（PRD §10.5 模型）；生成稳定 `serviceId`；计算 `fingerprint`（§17.4）；合并一服务多端口、多协议、IPv4/IPv6 监听。**身份以 service ID 为准，绝不只以端口号为身份**（经验指南 §2）。
- **验收**：同一服务的多端口合并为一条记录；fingerprint 在进程重启后必然变化。
- **依赖**：T1-1 ｜ 优先级 P0 ｜ 预估 1d

#### T1-3 Session Launch Ledger：会话启动台账
- **做什么**：按 §17.1 记录本会话发起的常驻命令；提供"台账记录 ↔ 当前进程"匹配查询（PID/进程组/端口/时间窗口）；运行期内存存储，不落盘。
- **验收**：会话内启动的 `npm run dev` 可被匹配为 `conversation-confirmed`；台账在会话结束/插件停止后清空。
- **依赖**：T0-1 ｜ 优先级 P0 ｜ 预估 0.5d

#### T1-4 Ownership：归属评分与风险分级
- **做什么**：实现 §7.2 五级归属判定（conversation-confirmed / workspace-inferred / other-local / unknown / protected）+ 证据链 `ownershipEvidence` + §7.4 风险分级；受保护规则（系统关键、DSH 宿主、高权限/其他用户进程）。
- **验收**：PRD FR-02 验收通过——用户能理解每个服务为何被标为某归属；`protected` 进程永不显示控制操作。
- **依赖**：T1-1、T1-2、T1-3 ｜ 优先级 P0 ｜ 预估 1d

#### T1-5 Redaction：命令与日志脱敏
- **做什么**：对命令摘要中的 token、密码、连接串、Cookie 等做脱敏（§9.3）；不持久化完整环境变量；操作历史只存 serviceId/动作/结果/时间/脱敏摘要。
- **验收**：构造含 `--token=xxx`、`POSTGRES_URL=...` 的命令，脱敏后不泄露原值。
- **依赖**：T1-1 ｜ 优先级 P0 ｜ 预估 0.5d

#### T1-6 Lifecycle：停止/重启状态机与防护
- **做什么**：按 §6.5 与 §7.3 实现：优雅停止（`SIGTERM` 到 process group）→ 超时内重扫验证 → 超时只提供重试/受控强制终止（默认关闭、二次确认）；重启（executable+参数数组+cwd 启动，不拼 Shell 字符串、不重放敏感环境变量）→ 等待端口监听/健康检查；操作前 PID/startedAt/fingerprint 校验（`PID_REUSED`/`TARGET_GONE`）；幂等防连点。
- **验收**：PRD FR-03/FR-04 验收通过——测试创建的 npm/Python 子进程树停止后不再监听；连续点击不重复发信号；无启动描述的服务不提供重启；端口冲突/启动超时返回明确错误码。
- **依赖**：T1-2、T1-4、T1-5 ｜ 优先级 P0 ｜ 预估 2d

#### T1-7 API 层（harness.handle）
- **做什么**：按 §10.4 + §17.5 注册 `scan / detail / stop / restart / open(可选) / config / actions`；统一 `{ ok, data | error }` 信封；参数/策略校验；错误码映射（§10.6）——Host 返回**稳定 code**，Client 负责本地化文案；Client 不可直接传任意 PID 或任意 Shell 命令；**不使用 `kill?pid=` 类未经验证的 API**（经验指南 §4.3）。
- **验收**：每个方法有最小请求/响应样例与校验规则；非法参数返回明确错误；错误码稳定可本地化。
- **依赖**：T1-2、T1-4、T1-6 ｜ 优先级 P0 ｜ 预估 1d

#### T1-8 Config：配置模型与默认值
- **做什么**：实现 PRD FR-07 配置表（自动刷新间隔 5s、默认范围 workspace、优雅超时 3s、显示未知服务开、强制终止关、命令显示脱敏），含合法值校验。
- **验收**：非法配置值被拒绝；默认值与 FR-07 一致。
- **依赖**：T1-7 ｜ 优先级 P1 ｜ 预估 0.5d

### 3.2 Client 侧

#### T1-9 入口：会话头部 + 全局侧边栏
- **做什么**：`conversation.session.header.utilities` 图标（网络节点/脉冲）+ Tooltip + 运行数量徽标；`sidebar.footer.action` 全局入口（无会话上下文时默认落在工作区/本机范围）。**若两个入口只能保留一个，用空占位覆盖旧 slot 注册，防止旧按钮残留造成重复入口**；对外部 props 做 null guard（经验指南 §6.3）。
- **验收**：两个入口均可见；徽标数字与当前会话/工作区运行服务数一致；无重复入口。
- **依赖**：T0-3、T1-8 ｜ 优先级 P0 ｜ 预估 0.5d

#### T1-10 Overlay 面板骨架与轮询
- **做什么**：`shell.overlay` 面板，按经验指南 §6.2 锚定：顶部 `[data-slot="conversation.session.header"]` 底部、底部 composer 顶部、resize/布局变化重测、**高度 `min(640px, calc(100dvh - 110px))` 且设最小高度**（源文档 experience.md §八：面板过高会挡住输入框）、不遮挡 composer；默认 5s 轮询 + 手动刷新 + 请求取消（**面板关闭即取消轮询**）+ **并发 action 去重**；空态/扫描中/部分失败/权限不足状态；遵守 reduced motion。
- **验收**：刷新周期可配置；切换范围不混淆数据；不遮挡 composer；关闭面板后无残留请求。
- **依赖**：T1-9、T1-7 ｜ 优先级 P0 ｜ 预估 1d

#### T1-11 服务列表与详情
- **做什么**：按 §6.3/§6.4 渲染服务卡片（状态、名称、端口 URL、归属、cwd、脱敏命令摘要、操作按钮；颜色不作为唯一信号）；详情面板展示完整字段与归属证据、风险说明、最近操作。
- **验收**：FR-02 验收通过；超长命令折叠；归属与风险一眼可辨。
- **依赖**：T1-10、T1-4 ｜ 优先级 P0 ｜ 预估 1d

#### T1-12 范围切换 / 搜索 / 筛选
- **做什么**：`本次对话 / 当前工作区 / 本机` 三种范围（FR-05）；按服务名、端口、命令摘要、路径、状态、风险过滤。
- **验收**：切到"本机"范围时明确提示可能影响其他项目；搜索结果准确。
- **依赖**：T1-11 ｜ 优先级 P0 ｜ 预估 0.5d

#### T1-13 停止流程 UI（含确认与错误反馈）
- **做什么**：停止确认框展示服务、端口、PID、进程组、命令、目录、归属与影响范围；`PID_REUSED`/`TARGET_GONE` 等错误码的人性化展示（§10.6）；批量停止（仅本次对话明确归属）逐项反馈，确认文案遵守 §6.5。
- **验收**：两次点击 + 一次确认完成单服务停止；批量停止逐项显示成功/失败；错误提示可理解。
- **依赖**：T1-11、T1-6、T1-7 ｜ 优先级 P0 ｜ 预估 1d

#### T1-14 重启流程 UI
- **做什么**：仅对 `restartable` 服务显示重启；不可重启时显示禁用原因；启动中状态、失败诊断与下一步建议（端口冲突/启动超时）。
- **验收**：不可重启服务不显示可执行重启；重启成功后显示新 PID。
- **依赖**：T1-13、T1-6 ｜ 优先级 P0 ｜ 预估 0.5d

#### T1-15 URL 操作
- **做什么**：对可推断的本地 HTTP 服务提供"打开 URL / 复制 URL"（FR-06）；**按经验指南 §4.3/§17.5：`scan`/`detail` 已返回 `listeners[].url` 时 Client 直接 `window.open`，不实现 `open` API**；非 HTTP 服务只复制地址；打开前确认 `0.0.0.0`/局域网绑定提示。
- **验收**：HTTP 服务可打开/复制；非 HTTP 服务行为正确；无 `open` 路由仍全功能。
- **依赖**：T1-11 ｜ 优先级 P0 ｜ 预估 0.5d

#### T1-16 配置面板
- **做什么**：FR-07 配置的可视化编辑（刷新周期、默认范围、优雅超时、显示未知、强制终止开关）。
- **验收**：修改即时生效并持久到 Host 配置；非法值被拒绝。
- **依赖**：T1-8、T1-10 ｜ 优先级 P1 ｜ 预估 0.5d

#### T1-17 i18n / 主题 / 可访问性
- **做什么**：zh/en 双语，`useLocale('dsh-service-console')`（namespace 必须唯一，经验指南 §6.4）；`--dsw-alias-*` token 深浅主题（不硬编码背景/文本色）；键盘导航、Enter 确认、Escape 关闭；图标+颜色+文字同时提示；reduced motion（FR-08）；**错误码由 Host 返回稳定 code，Client 映射本地化文字**。
- **验收**：切换语言与主题后无布局/文案问题；全流程可键盘操作。
- **依赖**：T1-10~T1-16（可并行收尾）｜ 优先级 P1 ｜ 预估 1d

### 3.3 端到端验证

#### T1-18 动态原型端到端走查
- **做什么**：用 §17.7 夹具（node/npm-vite/python/进程树）在 DSH Web 中走查：发现 → 详情 → 打开 URL → 停止（含已退出/PID 复用场景）→ 重启 → 批量停止 → 配置；记录 PRD 需修正之处并回写。
- **验收**：M1 退出标准达成（发现/详情/停止/重启/批量全部真实服务走查通过）。
- **依赖**：T1-1~T1-17 ｜ 优先级 P0 ｜ 预估 1d

---

## 4. M2 原生包化与自动化测试

### T2-1 项目脚手架与目录迁移
- **做什么**：按 PRD §10.1 + 源文档经验建 `package.json`、`dsh.plugin.json`、`cordis.patch.yml`、tsconfig、`tsconfig.build.json`、`tsdown.config.ts`；目录结构与 `lib/` 产物对齐 `../dsh-workspace-explorer/`。
- **做什么（package.json 形态，参照 workspace-explorer 实际）**：`name: '@jiyr0119/dsh-service-console'`、`type: module`、`exports`（`.` + `./client` + `./src/*` + `./package.json`）、`publishConfig.access: public`、`files`（lib/dsh.plugin.json/cordis.patch.yml/dynamic/docs/demo/assets/README*/LICENSE/manifest.json）、`dsh.bundle.patch: ./cordis.patch.yml`、`dsh.client.inject`（`@deepseek-ai/dsh-client-runtime`、`-locale`、`-ui-slots`、**`-ui-conversation`**）、`dsh.plugin`（动态元数据：id/kind/host/client/hostHandler/clientSlots）；scripts：`build: tsdown && tsc -p tsconfig.build.json`（**tsdown + tsc 双跑**）、`prepublishOnly: npm run build`、`typecheck: tsc --noEmit`。
- **做什么（依赖版本锁定，源文档 experience.md §二.4）**：用 **rc.6 家族**——`@deepseek-ai/dsh-client-*` / `@deepseek-ai/dsh-host-webserver` / `@deepseek-ai/dsh-invariants` 均 `^0.1.0-rc.6`、`@deepseek-ai/cordis ^4.0.1`、`cordis ^4.0.0-rc.7`、`tsdown ^0.22`、`lightningcss ^1.32`、`react ^18`；**rc.1 家族在 npm 装不上**（缺 `@deepseek-ai/dsh-paths`，eresolve E404），严禁使用。
- **做什么（manifest.json）**：保留并维护 `manifest.json`（id/name/version/description/kind/platforms/host.handlers/client.slots/services/license）——market/商店展示元数据，版本同步四处之一。
- **做什么（续）**：脚手架完成后立即做 **preflight 组合解析冒烟**（经验指南 §8.2）：`dsh plugin --profile preflight add -w "file:$(pwd)"` → `dsh --profile preflight --dump-config` → 清理 profile；pnpm 9/10 在 workspace root 需 `-w`（或 `.npmrc` 设 `ignore-workspace-root-check=true`）。
- **验收**：typecheck/build 通过；preflight 组合解析 OK（早发现 YAML 语法/包名/patch 配置错误）；`npm pack` 产物含 `lib/`、`dsh.plugin.json`、`cordis.patch.yml`、`dynamic/`、`manifest.json`。
- **依赖**：T1-18 ｜ 优先级 P0 ｜ 预估 1d

### T2-2 Host 迁移：harness.handle → webServer.register
- **做什么**：将 M1 API 迁移为逐条 `ctx.webServer.register()` 的 JSON 路由——**循环逐条注册，绝不把路由数组一次传入**（数组会让路由静默失效，浏览器表现为 `Unexpected end of JSON input`，源文档 experience.md §三 教训②）；Host 类型按源文档范式：`import type { WebServer } from '@deepseek-ai/dsh-host-webserver'`，npm 类型缺成员时再 `declare module 'cordis'` 局部增强；响应带 `content-type: application/json`；JSON body 读取容忍非法 JSON 返回可读错误码；决定是否保留兼容适配层（§17.8）。
- **验收**：七个路由在原生插件下逐条注册可用；请求/响应与 M1 一致；非法 JSON 返回可读错误。
- **依赖**：T2-1、T1-7 ｜ 优先级 P0 ｜ 预估 1d

### T2-3 Client 迁移：动态 JS → __ModuleLoader__ bundle
- **做什么**：Client 由动态 JS 迁移为 `window.__ModuleLoader__.load({ id })` bundle——**`id` 必须严格等于 npm 包名（含 scope）：`@jiyr0119/dsh-service-console`，且写死为常量 `const ID = ...`，不要用 `pkg.name` 动态拼**（不一致则安装成功但 UI 不挂载，源文档 experience.md §二.2）；`react`/`react-dom`/`@deepseek-ai/cordis` 及 DSH client 平台模块全部 external；CSS Modules 用 lightningcss 内联注入 `<style data-plugin-css>`，零额外 CSS 请求；版本经验：`tsdown ^0.22` + `lightningcss ^1.32`（早期 tsdown 与 rolldown 不兼容触发 `transformPlugin`）；Slot 注册契约与 M1 一致。
- **做什么（tsdown.config.ts 范式，对齐 workspace-explorer 实际配置）**：双 config——Host：ESM/Node/`src/index.ts → lib/index.js`；Client：CJS/browser/`entry { client: 'src/client/index.tsx' } → lib/client.js`、`external` 平台模块列表（`react`、`react/jsx-runtime`、`react-dom`、`react-dom/client`、`@deepseek-ai/cordis`、`-dsh-client-ui-slots`、`-dsh-client-web-react`、`-dsh-client-ui-primitives`、`-dsh-client-ui-attachment`、`-dsh-client-schema-form` + `@deepseek-ai/dsh-client-runtime/client`）、`outputOptions.banner/footer/intro` 组装 `__ModuleLoader__` 闭包、`dts: false`；CSS Modules 走 virtual-module 插件（lightningcss `cssModules` + `<style data-plugin-css>` 注入 + classMap export）；加 **client bundle purity 检查**（非平台模块的 `@deepseek-ai/*` 直接 throw，防误打包）；浏览器安全的薄数据层可内联。
- **验收**：原生包在 DSH Web 中入口、浮层、交互与 M1 一致；硬刷新后 Client 仍挂载。
- **依赖**：T2-1、T1-17 ｜ 优先级 P0 ｜ 预估 0.5d

### T2-4 配置持久化
- **做什么**：确定配置存储位置（DSH 配置机制或插件本地文件，§17.8）并实现读写。
- **验收**：重启 DSH 后配置保留。
- **依赖**：T2-2 ｜ 优先级 P1 ｜ 预估 0.5d

### T2-5 单元测试（vitest）
- **做什么**：覆盖 PRD §13.1：平台输出解析、路径归一化与归属评分、命令脱敏、fingerprint/PID 复用保护、stop/restart 状态机（超时/幂等）、API 参数与策略校验。
- **验收**：用例全绿；关键分支（PID_REUSED、GRACEFUL_TIMEOUT、RESTART_UNSAFE）有断言。
- **依赖**：T2-2、T2-3 ｜ 优先级 P0 ｜ 预估 1.5d

### T2-6 Host 集成测试（临时服务 harness）
- **做什么**：自建临时服务夹具（§17.7），测试结束必清理、绝不向真实进程发信号；覆盖 PRD §13.2 七类场景（单/多服务、npm/Python 进程树、优雅停止与超时、端口冲突、已退出与 PID 复用、权限/未知/受保护、安全重启与启动超时），并按经验指南 §8.3 补：命令/目录不可读时正确降级、所有子进程在 `finally` 清理。
- **验收**：七类场景用例绿；测试夹具清理无残留进程。
- **依赖**：T2-5 ｜ 优先级 P0 ｜ 预估 1.5d

### T2-7 真实 DSH Web profile 挂载验证
- **做什么**：按源文档 verify-native.md + experience.md §三：① **Host 路由功能验证**——真实 webServer 服务下用 `.wecheck` 式临时脚本 curl 校验全部 `/dsh-sc/api/*` 路由（scan/detail/stop/restart/config/actions + 非法 body 返回可读错误）；② **真实挂载**——`dsh plugin --profile web add -w "file:$(pwd)"`（pnpm 需 `-w`）安装到真实 Web profile，重启后刷新验证：header 图标出现、overlay 打开且不遮挡 composer、`/dsh-sc/api/*` 返回有效 JSON、范围切换正确、真实/临时服务可发现、停止/重启/确认框/错误状态正确、硬刷新后 Client 仍挂载、zh/en/主题/键盘/reduced motion 正常；③ 记录回滚路径（`git checkout cordis.yml` / `pnpm remove`）。
- **验收**：M2 退出标准达成。
- **依赖**：T2-1~T2-6 ｜ 优先级 P0 ｜ 预估 0.5d

---

## 5. M3 验收、发布与 awesome 收录

### T3-1 Client 验收清单执行
- **做什么**：PRD §13.3：空态/扫描中/部分失败/权限不足/服务退出；范围切换、搜索、详情、操作确认；批量逐项反馈；深浅主题、zh/en、窄窗口、键盘、reduced motion。
- **验收**：清单项全部通过并记录。
- **依赖**：T2-7 ｜ 优先级 P0 ｜ 预估 0.5d

### T3-2 文档
- **做什么**：README（含 §1.3 商店描述、安装、权限与安全说明、示例截图）、README.zh.md、LICENSE；**如实说明**：支持平台、权限模型、自动清理默认关闭、安装后 Host 与 Client 两半是否齐全（经验指南 §9.3/§10.3）。
- **验收**：README 可独立指导安装与使用；不承诺未上线的能力（如自动清理、Windows）。
- **依赖**：T2-7 ｜ 优先级 P1 ｜ 预估 0.5d

### T3-3 npm 发布与版本同步
- **做什么**：`npm pack` 检查 tarball 含 `lib/`、`dsh.plugin.json`、`cordis.patch.yml`、README、LICENSE、`manifest.json`；`npm publish`（2FA 时 OTP 为 30 秒一次性验证码，不能当作可异步转交事项，源文档 experience.md §四）；keywords 用可检索事实描述（参照 workspace-explorer：`deepseek-harness`、`cordis`、`dsh-plugin`、`local-dev-server`、`port-manager`）；**版本四处同步（源文档明确）**：`package.json` / `dsh.plugin.json` / `manifest.json` / `CHANGELOG.md`，用发布 checklist 防止只更 npm 版本；发布后冒烟（临时 profile 安装新版本）。
- **验收**：发布后冒烟通过；tarball 内容完整；四处版本号一致。
- **依赖**：T3-1、T3-2 ｜ 优先级 P0 ｜ 预估 0.5d

### T3-4 GitHub 仓库与 topics（首发前）
- **做什么**：`gh repo create dsh-service-console --public --source=. --remote=origin --push`；`gh repo edit` 配置 description/homepage/topics（`deepseek-harness`、`cordis`、`dsh-plugin`）；**Git identity 用源文档经验的具体值**：作者名 `Jiyr0119`、邮箱 `jiyr0119@gmail.com`（仓库级 `git config` 强制；公司环境用 `~/.gitconfig` 的 `includeIf "gitdir:~/workspaceforme/"` 自动切换），**不要用公司邮箱/真实姓名**；若历史混入错误身份，用 `git filter-branch --env-filter` + `--tag-name-filter cat` + force push 补救（注意 SHAs 全变）；按发布顺序：功能完成 → typecheck/build/pack → 验证 → 版本与 CHANGELOG → commit/tag/push → npm publish → GitHub Release（源文档 publish.md）。
- **验收**：仓库公开可访问，topics 已配置，首个 Release 已发布。
- **依赖**：T3-2、T3-3 ｜ 优先级 P0 ｜ 预估 0.5d

### T3-5 awesome-dsh-plugin 收录
- **做什么**：按源文档 experience.md §六（**已含两个成功实例：PR #1158 收录 + PR #1362 描述更新**）：确认 canonical 上游 `awesome-dsh-plugin/awesome-dsh-plugin`（**不是** `omdsh-dev` fork；用 `gh api repos/... --jq '.parent'` 与 `git ls-tree -r upstream/main scripts/` 复查生成流程，勿凭 fork 状态判断）；**先双语 issue 再 PR**；门槛自查：`dsh.bundle` 声明、`dsh-plugin` topic、repo ≥ 1 天且 commits ≥ 10、描述无营销词；修改 YAML 数据源（`data/plugins/Jiyr0119__dsh-service-console.yml`，描述句号结尾、含 `: ` 加单引号、避免裸 `[file: ...]`）；**提交前查重** `gh search prs --repo awesome-dsh-plugin/awesome-dsh-plugin "Jiyr0119"`；`npm ci` → `node scripts/generate-readme.mjs`（**勿手改 README**）→ `--check` → `awesome-lint` → `build-site`；截图按 `data/screenshots.json`（key=仓库 URL，值=raw.githubusercontent 数组）维护（服务列表、归属标识、停止确认、端口冲突/重启状态）；README 冲突时取 theirs 恢复自己行 + **重跑生成器**而非手工解决；**差异化定位**：突出 standalone / single-purpose / zero-config / one-command（对照 better-sidebar 全家桶）；README 诚实说明**收录 ≠ 浏览器自动生效**。
- **验收**：双语 issue 已创建；数据源 + 生成 README 的 PR 已从自己的 fork 提交至 canonical，CI 通过。
- **依赖**：T3-4 ｜ 优先级 P1 ｜ 预估 1d

### T3-6 DoD 核对与签核
- **做什么**：逐项核对 PRD §15 MVP Definition of Done（10 项）与经验指南 §11 首发检查单，产出核对记录与遗留问题清单。
- **验收**：10 项全部 ✅（或明确标注非阻塞例外及原因）。
- **依赖**：T3-1~T3-5 ｜ 优先级 P0 ｜ 预估 0.5d

---

## 6. 关键依赖与风险提示

| 依赖/风险 | 说明 | 缓解 |
|---|---|---|
| DSH 命令执行事件可用性（T0-1） | 决定 §17.1 会话归属首选/降级方案，影响 T1-3 | M0 首日验证；不可用则 MVP 降级为 workspace-inferred |
| 平台命令差异（T0-2） | 影响 T1-1 解析实现 | M0 实测并回写 §17.3；解析层抽象平台适配器 |
| 动态→原生 API 迁移（T2-2） | `harness.handle` 与 `webServer.register` 语义差异；原生包无 `harness` 全局 | M1 保持 API 契约稳定，迁移只换传输层；逐条注册路由 |
| `__ModuleLoader__` id 硬约束（T2-3） | id 不等于 npm 包名时"安装成功但无 UI" | 用常量 `ID = '@jiyr0119/dsh-service-console'`，T2-7 硬刷新验证 |
| 构建工具版本坑（T2-1/T2-3） | tsdown 早期版本与 rolldown 不兼容触发 `transformPlugin` | 锁定 `tsdown ^0.22` + `lightningcss ^1.32` |
| **DSH 依赖版本族（T2-1）** | **rc.1 家族在 npm 装不上**（缺 `@deepseek-ai/dsh-paths`，eresolve E404） | 全部锁定 rc.6 家族（源文档 experience.md §二.4），脚手架阶段即锁定 |
| **版本四处同步（T3-3）** | 只更 npm 版本而 `dsh.plugin.json`/`manifest.json`/CHANGELOG 仍旧版 | 发布 checklist 强制四处同步（源文档 experience.md §九） |
| patch YAML scope 引号（T2-1） | `@` 开头裸标量导致 composition 解析失败 | `name: '@jiyr0119/dsh-service-console'` 加单引号，preflight 早验 |
| 集成测试安全 | 测试绝不能对真实用户进程发信号 | 夹具专用进程组 + 测试内白名单校验（§17.7） |
| awesome canonical 上游漂移 | fork 状态不可信；README 由 YAML 生成 | 提交当天用 `gh api`/`git ls-tree` 复查，走数据源 + 生成器 |
| 本 GUI 开发约束（验证阶段） | 当前 DSH Web GUI 实时加载插件 Client 改动需 `dev:web` watcher 正在构建；apps/web 依赖 `window.__DSH_BOOT__` 不能独立运行 | 验证前先确认 watcher；原生包改动在现有 GUI URL 刷新后验证（经验指南 §8.5） |

---

## 7. 任务状态速览（追踪用）

| ID | 标题 | 优先级 | 状态 | 完成日期 |
|---|---|---|---|---|
| T0-1 | 调研 DSH 插件能力面 | P0 | ✅ | 2026-08-17 |
| T0-2 | 平台命令矩阵实测 | P0 | ✅ | 2026-08-17 |
| T0-3 | Spike 最小动态插件 | P0 | ✅ | 2026-08-17 |
| T1-1 | ProcessInspector | P0 | ✅ | 2026-08-17 |
| T1-2 | ServiceRegistry | P0 | ✅ | 2026-08-17 |
| T1-3 | 会话启动台账 | P0 | ✅ | 2026-08-17 |
| T1-4 | 归属评分与风险分级 | P0 | ✅ | 2026-08-17 |
| T1-5 | 命令脱敏 | P0 | ✅ | 2026-08-17 |
| T1-6 | 停止/重启状态机 | P0 | ✅ | 2026-08-17 |
| T1-7 | API 层 | P0 | ✅ | 2026-08-17 |
| T1-8 | 配置模型 | P1 | ✅ | 2026-08-17 |
| T1-9 | 会话头部/侧边栏入口 | P0 | ✅ | 2026-08-17 |
| T1-10 | Overlay 面板与轮询 | P0 | ✅ | 2026-08-17 |
| T1-11 | 服务列表与详情 | P0 | ✅ | 2026-08-17 |
| T1-12 | 范围/搜索/筛选 | P0 | ✅ | 2026-08-17 |
| T1-13 | 停止流程 UI | P0 | ✅ | 2026-08-17 |
| T1-14 | 重启流程 UI | P0 | ✅ | 2026-08-17 |
| T1-15 | URL 操作 | P0 | ✅ | 2026-08-17 |
| T1-16 | 配置面板 | P1 | ✅ | 2026-08-17 |
| T1-17 | i18n/主题/可访问性 | P1 | ✅ | 2026-08-17 |
| T1-18 | 动态原型端到端走查 | P0 | 🔄 | |
| T1-18 | 动态原型端到端走查 | P0 | ⬜ | |
| T2-1 | 脚手架与目录迁移（含 preflight） | P0 | ✅ | 2026-08-17 |
| T2-2 | Host 路由迁移 | P0 | ✅ | 2026-08-17 |
| T2-3 | Client bundle 迁移 | P0 | ✅ | 2026-08-17 |
| T2-4 | 配置持久化 | P1 | ✅ | 2026-08-17 |
| T2-5 | 单元测试 | P0 | ✅ | 2026-08-17 |
| T2-6 | Host 集成测试 | P0 | ✅ | 2026-08-17 |
| T2-7 | 真实 profile 挂载验证 | P0 | 🔄 | |
| T3-1 | Client 验收清单 | P0 | 🔄 | |
| T3-2 | 文档 | P1 | ✅ | 2026-08-17 |
| T3-3 | npm 发布与版本同步 | P0 | ⬜ | |
| T3-4 | GitHub 仓库与 topics | P0 | ⬜ | |
| T3-5 | awesome-dsh-plugin 收录 | P1 | ⬜ | |
| T3-6 | DoD 核对签核 | P0 | ⬜ | |
