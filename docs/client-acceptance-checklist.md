# Client 验收清单（T3-1）· 执行记录

> 运行环境：DSH Web 原生包（lib/index.js + lib/client.js，preflight 已过，真实 web profile 挂载待确认）
> 动态对照：scdev-2/pkg-18（M1 面板，浏览器可见验证）
> 状态：⬜ 待执行（浏览器人工/自动化走查后勾选）

## 状态与错误展示

- [ ] 空态：无监听服务时显示"未发现服务"
- [ ] 扫描中：显示 `⏳` 状态与发起时间
- [ ] 部分失败：`⚠ partialWarnings` 逐条展示
- [ ] 权限不足：降级为只读，不显示 Stop
- [ ] 服务退出后：列表刷新后消失（TARGET_GONE 语义）

## 交互正确性

- [ ] 范围切换（本次对话/工作区/本机）不混淆归属
- [ ] 搜索按名称/端口/命令/路径过滤正确
- [ ] Detail 展开显示 serviceId、pgid、ppid、startedAt、归属证据
- [ ] 停止：两次点击（Stop → 确认），成功后显示"已停止"且服务消失
- [ ] 重启：仅可重启服务显示 Restart，成功后新 PID 重新监听
- [ ] 错误码本地化：PID_REUSED / GRACEFUL_TIMEOUT / RESTART_UNSAFE 等显示可读文案
- [ ] URL 打开：HTTP 服务 🔗 链接可打开
- [ ] 配置面板：刷新间隔/优雅超时/强制终止修改生效并持久化（重启后保留）
- [ ] 5s 自动轮询开关生效；面板关闭后无残留请求

## 主题 / i18n / a11y

- [ ] 深浅主题（`--dsw-alias-*`）均正常
- [ ] 中/EN 切换：全部用户可见文案跟随
- [ ] 键盘可操作（Tab 聚焦、Enter 触发）
- [ ] 窄窗口下不遮挡 composer
- [ ] reduced motion 无异常

## 动态版对照（scdev-2/pkg-18）

- [ ] header 入口 🖥 SC 可见，面板打开
- [ ] 本次对话启动的 dev 服务显示"本次对话"归属 + 可重启
- [ ] Stop/Restart 命令链路生效（bash 等价命令已验证）

## 备注

- 动态版端到端（T1-18）依赖本清单第 2 节浏览器走查。
- 原生版真实 web profile 挂载（T2-7 后半）后，需在原生环境重跑本清单。
