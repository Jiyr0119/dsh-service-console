# DSH Service Console：插件开发、发布与 awesome-dsh-plugin 提交经验

> 来源：从 `dsh-workspace-explorer` 已开发、构建、安装与发布过程中提炼的可复用经验。  
> 适用对象：`dsh-service-console` 的动态原型、原生 npm 插件、DSH Web UI 挂载、npm 发布和 awesome-dsh-plugin 收录。  
> 使用原则：下面的“已验证”结论来自现有项目；涉及 DSH 或 awesome 上游的流程，实施当日仍须在 canonical 仓库和当前 DSH 版本上复核。

---

## 1. 快速结论：先记住这 12 条

1. **先做动态 Cordis 原型，再发布原生 npm 包**；两者不是同一套 RPC 机制。
2. 动态版使用 `harness.handle()` 与 `host.call()`；原生包**没有** `harness` 全局。
3. 原生包需要 Host、Client bundle、`dsh.plugin.json`、`cordis.patch.yml` 四件套，缺 Client bundle 会导致“安装成功但浏览器没有 UI”。
4. 浏览器 bundle 的 `window.__ModuleLoader__.load({ id })` 中 `id` 必须**严格等于 npm 包名（含 scope）**。
5. Client 中 DSH 平台模块必须 external；不要把平台包错误打入浏览器 bundle。
6. Host 的 `ctx.webServer.register()` **一次只注册一条路由**；传路由数组会让路由静默失效。
7. YAML 中作用域包名以 `@` 开头时必须加单引号，例如 `name: '@jiyr0119/dsh-service-console'`。
8. 服务管理插件的危险操作必须在 Host 端授权：Client 不能传任意 PID 后直接执行 kill。
9. UI 浮层用 `shell.overlay`，实时锚定在会话 header 与 composer 之间；不要抢占 DSH 的 details 列。
10. 每次发布至少验证：构建、临时 profile 的组合解析、真实 Host API、真实 DSH Web 挂载。
11. `pnpm` 在 profile workspace root 安装时需要 `-w`，否则会遇到 `ERR_PNPM_ADDING_TO_ROOT`。
12. awesome-dsh-plugin 的 canonical 上游是 `awesome-dsh-plugin/awesome-dsh-plugin`；其 README 由 YAML 生成，**不要手改 README**。

---

## 2. 产品与架构边界：Service Console 特别注意事项

`dsh-service-console` 是本地开发服务控制台，不是“任意进程终止工具”。架构与权限要从第一天就按以下边界设计：

| 层 | 责任 | 不应做的事 |
|---|---|---|
| Client | 展示服务、范围筛选、确认风险、触发受控 action | 直接调用 OS、传任意 PID/命令、假定服务归属 |
| Host | 进程/端口发现、归属判断、脱敏、停止/重启、操作校验 | 相信 Client 的 PID 或拼接用户输入 Shell |
| Service registry | 保存 service ID、启动标记、指纹、操作状态 | 仅以端口号作为身份 |
| Process inspector | 平台进程/端口解析和 process group 控制 | 将 macOS/Linux 命令伪装成 Windows 兼容 |

### 2.1 强制安全规则

- 所有 `stop` / `restart` 请求必须传 **service ID + 预期指纹**，Host 再验证 PID、启动时间、命令摘要、工作目录和 process group。
- PID 不匹配或可能复用时返回 `PID_REUSED`，拒绝操作并要求重新扫描。
- 未知、受保护、其他用户或 DSH 宿主关键进程默认只读。
- 优先终止 process group 和 `SIGTERM`；不能默认 `SIGKILL`。
- 强制终止开关默认关闭；即使开启也必须每次确认。
- restart 只复用可安全保存的 executable、参数数组、工作目录和白名单环境变量；不得重放任意 Shell 字符串或敏感环境变量。
- 命令行、日志和诊断可能包含 token/密码，UI 与日志必须脱敏。

---

## 3. 两种 DSH 插件形态

| 形态 | 安装方式 | 生命周期 | 通信方式 | 最适用阶段 |
|---|---|---|---|---|
| **动态 Cordis 插件** | 在 DSH 对话/动态插件面板粘贴 Host 和 Client 代码 | DSH 重启后失效 | `harness.handle()` ↔ `host.call()` | 交互原型、平台可行性验证 |
| **原生 npm 包** | `dsh plugin --profile web add -w <package>` 或商店安装 | 持久安装 | Host `webServer` JSON API ↔ Client `fetch` | 正式发布、dsh-market 安装 |

### 3.1 动态 Cordis 插件

动态 Host 与 Client 必须是**纯 JavaScript**：

- 不使用 `import`、`require`、TypeScript 或 JSX；Client 使用 `React.createElement`。
- Host 通过 `harness.handle('service-console.scan', handler)` 注册 RPC。
- Client 通过 `host.call('service-console.scan', payload)` 调用。
- RPC 参数只能是 JSON 安全值：不能传 `undefined`、函数、类实例、`Error` 等。
- `harness` 是动态插件 VM 的专用全局，原生 npm 包中不可用。

**常见坑**：函数被 JSX/组件引用前仍处在 `const` 的 TDZ，会导致浏览器报 `Cannot access before initialization`。将函数声明放在首次引用之前，或使用 function declaration。

### 3.2 原生 npm 插件

建议结构：

```text
dsh-service-console/
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

原生包内的职责：

```text
src/index.ts           → lib/index.js   Host，Node/ Cordis / webServer
src/client/index.tsx   → lib/client.js  浏览器，__ModuleLoader__ bundle
dsh.plugin.json                         插件主入口与 client.main
cordis.patch.yml                        dsh plugin add 后的组合补丁
```

---

## 4. 原生 Host：webServer 路由经验

第三方包可以注册 Host 路由，无需修改 DSH 核心。已有项目使用过类似模式：

```ts
import type { Context } from 'cordis'

declare module 'cordis' {
  interface Context {
    webServer: {
      register(route: {
        kind: 'exact' | 'prefix'
        path: string
        handler: (req: unknown, res: unknown) => void | Promise<void>
      }): () => void
    }
  }
}

export default {
  inject: ['webServer'],
  apply(ctx: Context) {
    ctx.webServer.register({
      kind: 'exact',
      path: '/dsh-sc/api/services/scan',
      handler: async (req, res) => {
        // 校验 body，调用 ServiceRegistry，返回 JSON
      },
    })
  },
}
```

### 4.1 已验证的实现细节

- `@deepseek-ai/cordis` 的 npm 类型可能没有 `webServer` 成员声明；需要使用 `declare module 'cordis'` 进行局部类型增强。
- Host 使用 Node API；Service Console 的进程查询与停止逻辑必须留在 Host，不能放在浏览器。
- API 响应始终带 `content-type: application/json; charset=utf-8`；Client 不能假定所有失败都返回 JSON，需处理网络/解析错误。
- JSON body 读取要容忍非法 JSON，返回可读错误码而不是让路由抛异常。
- 路径、scope、service ID、action mode 都在 Host 校验；不要信任浏览器输入。

### 4.2 最关键的路由陷阱

**错误写法：**

```ts
ctx.webServer.register(routes as unknown as Route)
```

真实行为是数组被错误放入内部前缀表，路由可能静默失效，浏览器侧常表现为 `Unexpected end of JSON input`。

**正确写法：**

```ts
for (const route of routes) ctx.webServer.register(route)
```

每一条路由必须单独注册。

### 4.3 Service Console 推荐 API

采用独立前缀，避免与其他插件冲突：

```text
POST /dsh-sc/api/services/scan
POST /dsh-sc/api/services/detail
POST /dsh-sc/api/services/stop
POST /dsh-sc/api/services/restart
POST /dsh-sc/api/config
POST /dsh-sc/api/actions
```

不要使用未经过 registry 的 `POST /kill?pid=...` 之类 API。

---

## 5. 原生 Client bundle：必须遵守的契约

DSH Web 的 Client 不是独立 Vite 应用。浏览器 bundle 必须向 `window.__ModuleLoader__` 注册模块：

```js
window.__ModuleLoader__.load({
  id: '@jiyr0119/dsh-service-console',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    // 编译后的 Client 代码
    return module.exports
  },
})
```

### 5.1 Bundle ID 是硬约束

`id` 必须与 `package.json` 的 `name` **完全一致，且包括 scope**。例如：

```ts
const ID = '@jiyr0119/dsh-service-console'
```

如果写成无 scope 的 `dsh-service-console` 或其他字符串，插件虽然可能安装成功，但 DSH client-modules 无法匹配，面板不会挂载。

### 5.2 tsdown 配置的复用要点

- Host：ESM、Node 平台、`src/index.ts → lib/index.js`。
- Client：CJS、browser 平台、`src/client/index.tsx → lib/client.js`。
- `react`、`react-dom`、`@deepseek-ai/cordis` 和 DSH client 平台模块要 external，由 DSH 的 loader module table 提供。
- 可内联浏览器安全的薄数据层；不要在 Client bundle 引入 Node-only 包。
- CSS Modules 可用 `lightningcss` 编译成字符串并注入 `<style data-plugin>`，无需额外 CSS 网络请求。
- 适用版本经验：`tsdown ^0.22` + `lightningcss ^1.32`；早期 tsdown 版本可能与 rolldown 不兼容并触发 `transformPlugin` 错误。

### 5.3 Client API 调用模式

```ts
async function api<T>(method: string, payload: Record<string, unknown>): Promise<T> {
  const response = await fetch(`/dsh-sc/api/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return response.json() as Promise<T>
}
```

实际 Service Console 应在此基础上增加：请求超时、非 JSON 失败、并发 action 去重、面板关闭后的轮询取消，以及 action ID 轮询/订阅。

---

## 6. DSH Web UI 集成经验

### 6.1 推荐 slots

| 用途 | Slot | 说明 |
|---|---|---|
| 主入口 | `conversation.session.header.utilities` | 与会话日志等工具同排，最适合“本次对话服务” |
| 可选全局入口 | `sidebar.footer.action` | 没有会话上下文时打开控制台 |
| 面板承载 | `shell.overlay` | 浮层，不争抢 details 列 |
| 设置 | `settings.section` | 扫描周期、自动清理、强制终止等策略 |

### 6.2 Overlay 定位

已验证的做法是动态测量：

1. 顶部锚在 `[data-slot="conversation.session.header"]` 底部；
2. 底部锚在 composer（如 `[data-composer-card]`）顶部；
3. 在窗口 resize、布局变化、面板开关时重新测量；
4. 留出小间距，最小可用高度约 200px；
5. 禁止覆盖输入框。

不要用 `layout.openDetails/closeDetails` 抢占 DSH 的工具调用详情列。Service Console 要是轻量控制台，不应破坏原生信息架构。

### 6.3 UI 稳定性经验

- 对 `useInput`、workspaces、sessions 等外部 props 做 null guard，DSH 壳尚未注入时不能崩溃。
- 动态拖拽/点击嵌套时，若行 `draggable` 吞掉子按钮 click，可在按钮上使用 `onMouseDown`、`preventDefault()` 和 `stopPropagation()`；Service Console 若不需要拖拽，避免引入该复杂度。
- 所有动画遵守 `prefers-reduced-motion`。
- 使用 `--dsw-alias-*` token；深浅主题不硬编码背景/文本色。
- header 主入口和 sidebar 入口如果只能保留一个，应使用空占位覆盖旧 slot 注册，防止旧按钮残留造成重复入口。

### 6.4 国际化

DSH 目前以 zh/en 为主。规则：

```ts
import { useLocale } from '@deepseek-ai/dsh-client-locale'

const { t } = useLocale('dsh-service-console')
```

- namespace 必须唯一：`dsh-service-console`。
- 注册 zh/en 词典，所有用户可见文本走翻译 key。
- 不在 JSX 中硬编码中文或英文；错误码由 Host 返回稳定 code，Client 映射成本地化文字。

---

## 7. 配置、清单与版本同步

### 7.1 `package.json` 关键项

```json
{
  "name": "@jiyr0119/dsh-service-console",
  "type": "module",
  "main": "lib/index.js",
  "files": ["lib", "dsh.plugin.json", "cordis.patch.yml", "dynamic", "README.md", "README.zh.md", "LICENSE"],
  "dsh": {
    "bundle": { "patch": "./cordis.patch.yml" },
    "client": {
      "platform": "web",
      "inject": [
        "@deepseek-ai/dsh-client-runtime",
        "@deepseek-ai/dsh-client-locale",
        "@deepseek-ai/dsh-client-ui-slots"
      ]
    }
  }
}
```

实际 `inject` 列表应按 Client 真正使用的 DSH 服务补全（例如 conversation、workspaces），不要盲目复制，也不要遗漏。

### 7.2 `dsh.plugin.json`

```json
{
  "id": "dsh-external/dsh-service-console",
  "version": "0.1.0",
  "main": "./lib/index.js",
  "client": { "main": "./lib/client.js" }
}
```

### 7.3 `cordis.patch.yml`

```yaml
- insert:
    - id: service-console
      name: '@jiyr0119/dsh-service-console'
```

**必须给 scope 包名加引号。** YAML 的裸标量不能以 `@` 起始；未加引号会导致 `dsh web` 组合解析失败。

### 7.4 版本同步

每次发布同步更新：

1. `package.json`
2. `dsh.plugin.json`
3. `manifest.json`（若项目保留该兼容/展示文件）
4. `CHANGELOG.md`

建议用发布 checklist 防止只更新 npm 版本而 plugin manifest 仍是旧版。

---

## 8. 安装、构建与真实验证清单

### 8.1 本地基础检查

```bash
npm run typecheck
npm run build
npm pack
```

`prepublishOnly: npm run build` 可以在 publish 前兜底，但不能替代手工验证。

### 8.2 临时 profile：先验证组合解析

```bash
dsh plugin --profile preflight add -w "file:$(pwd)"
dsh --profile preflight --dump-config >/dev/null && echo OK
rm -rf "$HOME/.dsh/profiles/preflight"
```

这个步骤用于尽早发现：

- `cordis.patch.yml` YAML 语法错误；
- 包名/patch 配置错误；
- composition 无法加载；
- 注入服务声明错误。

> 现代 pnpm（9/10）在 workspace root 执行 add 往往报 `ERR_PNPM_ADDING_TO_ROOT`；命令要加 `-w`。备选方式是在 profile `.npmrc` 设置 `ignore-workspace-root-check=true`。

### 8.3 Host API 集成测试

Service Console 的核心风险在 Host，至少测试：

- `/services/scan` 能发现由测试创建的 HTTP 服务；
- 命令/工作目录不可读时正确降级；
- `stop` 会停止测试进程树，且验证监听端口释放；
- 目标已经退出返回 `TARGET_GONE`；
- PID/指纹失配返回 `PID_REUSED`；
- 未知/受保护服务被拒绝控制；
- 重启成功、启动超时和端口冲突；
- 所有测试子进程在 `finally` 中清理，绝不能对真实用户进程发 kill。

### 8.4 真实 DSH Web 挂载

```bash
dsh plugin --profile web add -w "file:$(pwd)"
# 使用现有 dsh web 实例，按其实际运行方式重启；随后刷新既有 Web UI。
```

验证：

- [ ] 会话 header 出现 Service Console 图标。
- [ ] 图标打开 overlay，且不会遮挡 composer。
- [ ] `/dsh-sc/api/*` 返回有效 JSON。
- [ ] 当前对话、工作区、本机范围正确切换。
- [ ] 真实/临时开发服务能被发现。
- [ ] 明确归属服务的停止/重启、确认框和错误状态正确。
- [ ] 硬刷新后 Client 仍挂载。
- [ ] zh/en、深浅主题、键盘和 reduced motion 正常。

### 8.5 本 GUI 的开发约束

若要让当前已打开的 DSH Web GUI 实时加载插件 Client 改动：

- Client plugin HMR receiver 已存在，但只有从 DSH checkout 运行 `pnpm run dev:web` 的 watcher 正在构建 bundle 时才可能无刷新更新；先验证 watcher 是否运行。
- apps/web 的 Vite entry 只是 shell，依赖 `window.__DSH_BOOT__`，不能当独立应用另起服务替代当前 GUI。
- 普通 package、Host 或 shell 改动要重建相关 Web artifact，并在**现有 GUI URL**刷新后验证。
- 除非明确需要，不启动替代服务器；启动新服务器不等于更新用户正在使用的 GUI。

---

## 9. npm、GitHub 与发布经验

### 9.1 npm 发布

```bash
npm run build
npm publish
```

- 账号启用 2FA 时，`npm publish` 需要 OTP；不要把 30 秒有效的一次性验证码当作可异步转交事项。
- 发布前运行 `npm pack`，检查 tarball 是否真的包含 `lib/`、`dsh.plugin.json`、`cordis.patch.yml`、README 和 LICENSE。
- package description、repository、homepage、keywords 要使用可检索的事实描述，例如 `deepseek-harness`、`cordis`、`dsh-plugin`、`local-dev-server`、`port-manager`。

### 9.2 GitHub 仓库

建议在首发前：

```bash
gh repo create dsh-service-console --public --source=. --remote=origin --push

gh repo edit Jiyr0119/dsh-service-console \
  --description "Local development service console for DeepSeek Harness." \
  --homepage "https://github.com/Jiyr0119/dsh-service-console" \
  --add-topic deepseek-harness --add-topic cordis --add-topic dsh-plugin
```

公开仓库提交前确认 Git identity 是个人公开身份，不要混入公司邮箱或不希望公开的真实姓名。若团队环境多身份并存，可用 Git `includeIf` 为工作目录配置专属 identity。

### 9.3 发布顺序建议

1. 完成功能和文档；
2. typecheck、build、pack；
3. 临时 profile 和真实 Web 验证；
4. 更新版本、CHANGELOG、截图/README；
5. Git commit、tag、push；
6. npm publish；
7. GitHub Release；
8. 确认 `dsh plugin add` 的干净安装；
9. 准备 awesome issue/PR。

商店/awesome 收录不等于浏览器 UI 自动可用；README 必须如实说明安装后是否已有 Host 与 Client 两半。

---

## 10. awesome-dsh-plugin：提交经验

### 10.1 先确认 canonical 上游

**canonical 上游：** `awesome-dsh-plugin/awesome-dsh-plugin`。

`omdsh-dev/awesome-dsh-plugin` 是 fork，不能凭它的目录结构、README 或历史状态判断官方上游流程。先核实：

```bash
gh api repos/awesome-dsh-plugin/awesome-dsh-plugin --jq '.parent'
```

本地推荐 remote：

```bash
gh repo clone Jiyr0119/awesome-dsh-plugin
cd awesome-dsh-plugin
git remote add upstream https://github.com/awesome-dsh-plugin/awesome-dsh-plugin.git
git fetch upstream main
```

### 10.2 规则：数据源优先，禁止手改 README

截至已验证流程，canonical README 由以下数据生成：

```text
data/plugins/*.yml
        ↓
node scripts/generate-readme.mjs
        ↓
README.md + README.zh.md
```

直接手改 README 会导致 CI 的 `READMEs match data/plugins` 失败。上游流程是否改变必须在提交当天复查：

```bash
git ls-tree -r upstream/main scripts/
```

如果仍存在 `generate-readme.mjs`，就继续按数据源 + 生成器的流程做。

### 10.3 收录前的产品门槛

已知要求/惯例：

- `package.json` 必须声明 **`dsh.bundle`**，且指向 `cordis.patch.yml`；只有 `dsh.client` 不够。
- 有真实可用代码、持续维护、清楚的安装说明。
- 添加 `dsh-plugin` GitHub topic；仓库年龄和 commit 数量需满足当期贡献指南门槛（历史经验为 repo ≥ 1 天、commits ≥ 10，提交时以最新指南为准）。
- 描述写事实功能，不使用“best”“ultimate”等营销级形容词。
- Service Console 需要真实截图/动图：服务列表、归属标识、停止确认、端口冲突或重启状态。

### 10.4 推荐流程：先 Issue，再 PR

维护者已有偏好是先用双语 issue 讨论，再按反馈提交双语 PR。不要跳过需求说明直接大改列表。

```bash
# 1) 先创建双语 issue：说明功能、安装方式、拟使用分类和描述
# gh issue create --repo awesome-dsh-plugin/awesome-dsh-plugin ...

# 2) 从 official upstream 最新 main 拉分支
git fetch upstream main
git checkout -b feat/add-dsh-service-console upstream/main

# 3) 修改插件 YAML 数据源（文件名以当期仓库规则为准）
# data/plugins/Jiyr0119__dsh-service-console.yml

# 4) 安装并生成/校验
npm ci
node scripts/generate-readme.mjs
node scripts/generate-readme.mjs --check
npx awesome-lint
node scripts/build-site.mjs

# 5) 一起提交数据源和生成的 README
git add data/plugins README.md README.zh.md
git commit -m "Add DSH Service Console"
git push origin feat/add-dsh-service-console

# 6) 从自己的 fork 向 canonical 发双语 PR
# gh pr create --repo awesome-dsh-plugin/awesome-dsh-plugin ...
```

### 10.5 Service Console YAML 草案

提交时字段名/分类应以当期 schema 为准。描述应简洁、客观、避免承诺未上线的自动清理或跨平台能力：

```yaml
url: https://github.com/Jiyr0119/dsh-service-console
name: Jiyr0119/dsh-service-console
category: ui
description:
  en: 'Local development service console for DSH: discovers listening ports, shows service ownership, and safely inspects, stops, or restarts services related to a conversation or workspace.'
  zh: 'DSH 本地开发服务控制台：发现监听端口，展示服务归属，并安全地查看、停止或重启与对话或工作区相关的服务。'
```

YAML 注意点：

- 描述包含英文 `: ` 时使用单引号。
- 描述要以句号结束。
- 避免未转义的 `[file: ...]` 一类文本，以免触发 `awesome-lint` 的引用规则。
- 截图通常在 `data/screenshots.json` 维护，key 是仓库 URL，图片使用稳定的 GitHub raw URL；按当期 schema 验证。

### 10.6 PR 前核验与冲突处理

```bash
# 检查是否已有同名插件或他人的重复 PR
gh search prs --repo awesome-dsh-plugin/awesome-dsh-plugin "dsh-service-console"

# 检查 CI 与可合并状态
gh pr view <number> --repo awesome-dsh-plugin/awesome-dsh-plugin \
  --json statusCheckRollup,mergeStateStatus
```

若 README 合并冲突：README 是生成物，优先保留上游其他条目，然后恢复自身 YAML，重新跑 `generate-readme.mjs`。不要手工解决后跳过生成校验。

---

## 11. 首发检查单

### 架构与安全

- [ ] 动态原型验证了服务发现、归属说明和确认交互。
- [ ] 原生 Host 与 Client 清晰分离。
- [ ] API 前缀为独立的 `/dsh-sc/api/*`。
- [ ] Client 不能传任意 PID/命令绕过 Host registry。
- [ ] stop/restart 有指纹、PID 复用和受保护目标校验。
- [ ] 默认优雅终止；强制终止与自动清理都默认关闭。
- [ ] 命令、环境、日志和诊断的敏感信息已脱敏。

### DSH 集成

- [ ] package name 与 `__ModuleLoader__` bundle ID 完全一致。
- [ ] `dsh.plugin.json` 同时声明 `main` 和 `client.main`。
- [ ] `cordis.patch.yml` 的 scope 包名带单引号。
- [ ] 每个 `webServer` 路由单独注册。
- [ ] 主入口在 `conversation.session.header.utilities`。
- [ ] overlay 不遮挡 composer，不抢 details 列。
- [ ] zh/en、深浅主题、a11y、reduced motion 已验证。

### 发布与 awesome

- [ ] `npm run typecheck`、`npm run build`、`npm pack` 成功。
- [ ] 临时 profile composition 解析成功。
- [ ] 真实 DSH Web 中 Host API、入口、浮层和服务 action 验证成功。
- [ ] package / plugin manifest / manifest / CHANGELOG 版本已同步。
- [ ] README 诚实说明支持平台、权限、自动清理默认值和安装结果。
- [ ] GitHub topic 已添加，截图已准备。
- [ ] awesome canonical 上游与生成流程在提交当天重新验证。
- [ ] 已先创建双语 issue，随后修改 YAML 数据源、生成 README、通过 lint/build 后发 PR。

---

## 12. 参考来源（本地）

本指南从以下现有项目文档和配置中提炼：

- `../dsh-workspace-explorer/docs/experience.md`：已验证 DSH 插件架构、UI、动态版、发布和 awesome 经验。
- `../dsh-workspace-explorer/docs/verify-native.md`：原生挂载与回滚验证。
- `../dsh-workspace-explorer/docs/publish.md`：npm/GitHub 发布流程。
- `../dsh-workspace-explorer/tsdown.config.ts`：Client `__ModuleLoader__` bundle、external 和内联 CSS 的配置范式。
- `../dsh-workspace-explorer/cordis.patch.yml`：composition patch 的 YAML 引号规则。
- `PRD.zh.md`：Service Console 的产品边界、功能、权限模型与发布定义。
