# Changelog

## 0.7.1 (2026-10-23)

**热挂载/双装载幂等**——修复桌面 dshmarket 更新后界面国际化丢失（UI 退回 `entry.label` 等原始键）。

- **事故链**：桌面 dshmarket 热更新会把插件装载两次，第二次 `locale.register` 抛 `already has locale`、`webServer.register` 抛 `duplicate exact route`。旧版客户端 i18n 初始化在异常后直接放弃绑定（`tr` 退回原始键），Host 侧直接激活失败还会导致更新验证失败、回滚进入脏状态。
- **Client**：词典注册逐条幂等（`already has locale` 视为已注册跳过），且无论注册是否抛错都完成翻译绑定（`src/client/i18n.ts`，含变量插值兜底与语言切换重绑）；locale 服务恢复可选注入（与 0.6.0 一致，缺失时插件其余功能不受影响）。
- **Host**：路由/工具注册包 `ctx.effect`（卸载即注销）+ 单条 try/catch（重复注册跳过而非炸掉整个激活）——dshmarket 更新验证可通过，历史脏状态下热挂载即恢复翻译。
- **回归**：typecheck + 35 单测（新增 6 个热挂载幂等用例）；真机 DSH 验证入口/面板/设置页文案与 `{n}` 插值全部正常。

## 0.7.0 (2026-10-14)

P0 功能/体验优化里程碑（真机 DSH 0.2.0-rc.2 全套验证通过）。

- **P0-1 受保护进程防护**：快照标记受保护目标（DSH Web 控制台端口、插件宿主进程），面板不显示其停止/重启按钮，API 层拒绝并返回 `PROTECTED_PROCESS`（纯函数 `classifyProtection` + 单测）。
- **P0-2 只读 `service_list` 模型工具**：注册 `service_list` 工具（`query`/`ownership`/`limit` 过滤，输出含 `protected` 标记与归属证据），无 `tools` 服务的组合下自动跳过，面板/API 不受影响。
- **P0-3 操作结果 Toast**：停止/重启结果使用平台 Toast 横幅（成功 tone、3 秒停留），不再随列表重扫而消失；操作在途去重。
- **P0-4 设置页补全 + 自动轮询 + 范围切换**：设置页补齐自动刷新间隔（关闭/2/5/10/30 秒离散档位，后端枚举校验）、默认范围、显示未知服务；面板按间隔自动重扫（面板关闭/切到设置 tab 即取消，与进行中的扫描不重叠）；范围分段控件（本次对话/当前工作区/本机，本机范围显示影响警示，受保护目标恒可见）；`恢复默认` 重置全部配置；配置说明修正为持久化路径。
- **P0-5 客户端类型化**：i18n 键域（`ConsoleKey`）与 DSH slot/locale 注册全链路类型化（缺键/多键/拼写错误=编译错误），翻译函数类型化。
- **依赖**：新增 devDeps `@deepseek-ai/dsh-tools`、`@deepseek-ai/dsh-client-ui-primitives`（`^0.2.0-rc.2`）；tsdown `external` 增加 `@deepseek-ai/*` 与 `cordis`，新入口文件显式加入 entry 列表。

## 0.6.0 (2026-09-30)

- **DSH 0.2.0 适配**：开发依赖升级到 `0.2.0-rc.2`（`dsh-client-locale` / `dsh-client-ui-conversation` / `dsh-client-ui-slots` / `dsh-host-webserver`）；`@deepseek-ai/cordis` peer/dev 范围改为 `~4.0.4`（0.2.0 平台包的 peer 要求）；`dsh.plugin.json` 的 `engines.dsh` 提升为 `>=0.2.0-rc.2`。
- **动态原型 Host 破坏性变更修复**：DSH 0.2.0 移除了 `ShellExecutor.run()/start()`，`dynamic/host.js` 的 `runCommand` 改用 `shell.execute()` + `execution.result()`；`shell.resolve()` 超时字段改为 `timeoutMs`；stdout/stderr 按 `CollectedOutput { text, truncated }` 读取（原先 `typeof res.stdout === 'string'` 分支永假，静态命令输出一直为空）。
- **构建配置对齐 0.2.0 module-table seed**：`tsdown.config.ts` 的 `PLATFORM_MODULES` 镜像 0.2.0 `staticModules`——新增 `@deepseek-ai/dsh-client-store`、`@deepseek-ai/dsh-client-ui-dockkit`，移除 0.2.0 中已不存在的 `dsh-client-web-react` / `dsh-client-ui-attachment` / `dsh-client-schema-form` / `dsh-client-runtime`。
- **清理**：移除未被使用 `@deepseek-ai/dsh-invariants` devDependency；同步 `manifest.json` 版本号（0.2.2 → 0.6.0，按 release checklist 四处同步）。

## 0.3.1 (2026-08-21)

- **README 中英文切换**：修复 README.md 中缺失的语言切换链接。
- **交互式演示**：新增 `demo/index.html`，提供无需安装的浏览器内 UI 体验。
- **文档更新**：README 中添加交互式演示链接。

## 0.3.0 (2026-08-21)

- **i18n 修复**：采用 `locale.register` + `locale.bind` 机制（对齐 dsh-workspace-explorer），支持 DSH 语言切换实时跟随。
- **UI 重设计**：面板改为抽屉式弹窗（动画 + 动态定位），Tab 栏（服务 / 设置），卡片式服务列表。
- **本地调试**：新增 `docs/local-debugging.md`，记录 symlink 链接本地插件到 3090 环境的方法。
- **API 直连**：客户端通过 `fetch` 直连 Host HTTP 路由，停止/重启操作不经过 LLM。
- **卡片优化**：内容自动换行，高度自适应，移除横向滚动条。

## 0.2.2 (2026-08-19)

- README 增加 License、npm、下载量、Awesome DSH Plugin 与最近提交徽章。
- 向 awesome-dsh-plugin 提交 Service Console 收录 PR。

## 0.2.1 (2026-08-19)

- 面板仅在打开时扫描，移除自动 / 定时刷新；保留手动刷新按钮。
- 语言跟随 DSH locale 自动切换，仅支持中文和英文，不再提供语言切换按钮。
- English README 改为纯英文内容。

## 0.2.0 (2026-08-19)

- 面板视觉重做：采用 DSH Web 风格的 graphite surface、token 化颜色、工具栏与 inspector detail card。
- 端口列表改为展示本机全部监听服务；归属仅作为安全提示，不再隐藏服务。
- 搜索继续支持服务名、PID、端口、命令与工作目录；保留停止前二次确认与 Host 侧安全校验。
- 补充响应式布局、键盘可见焦点与 reduced-motion 兼容。

## 0.1.0 (2026-08-17)

- **首个版本**：DSH 本地开发服务控制台（macOS/Linux）。
- 服务发现：监听 TCP 端口 → PID/PPID/命令/工作目录/进程组/启动时间（`lsof`/`ps` 批量命令，单目标失败不中断）。
- 归属模型：会话启动台账（`tools/result` 观察）→ `本次对话`；工作区推断 / 本机其他 / 未知 / 受保护 五级归属与证据链。
- 控制：进程组优雅停止（SIGTERM）、安全重启（台账启动命令）；二次确认；操作前重扫校验；错误码（`TARGET_GONE`/`UNKNOWN_OWNERSHIP`/`GRACEFUL_TIMEOUT`/`RESTART_UNSAFE` 等）。
- 安全：命令脱敏；未知/受保护只读；强制终止默认关闭；无隐式自动清理；配置持久化（`~/.dsh/plugins/dsh-service-console/config.json`）。
- 面板：会话头部入口 + `shell.overlay` 浮层；范围筛选（对话/工作区/本机）、搜索、详情证据、URL 打开、配置、zh/en、深浅主题、5s 自动轮询。
- 原生包：Host `webServer` JSON 路由（`/dsh-sc/api/*`，逐条注册）+ Client `__ModuleLoader__` bundle（id = 包名）。
- 测试：单元 7 项 + Host 集成 2 项（`node --test`）。

## 动态原型阶段（M1，未发布）

- `scdev-2` 动态插件迭代（pkg-2 → pkg-18）：ProcessInspector → ServiceRegistry → 台账/归属/脱敏 → 生命周期/API/配置 → 服务级面板（范围/搜索/配置/i18n）。
