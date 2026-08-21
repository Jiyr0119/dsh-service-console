# Changelog

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
