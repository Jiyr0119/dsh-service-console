# DSH 插件本地调试指南

## 启动本地 DSH 开发环境（端口 3090）

```bash
# 方式一：使用 dev profile 启动
dsh --profile dev --port 3090

# 方式二：在 DSH 目录下启动 web 开发模式
cd ~/.dsh/profiles/dev
pnpm run dev:web
```

启动后访问 http://127.0.0.1:3090

---

## 将本地插件链接到 3090 环境

### 1. 编辑 dev profile 的 package.json

```bash
vim ~/.dsh/profiles/dev/package.json
```

添加插件依赖和 bundles 配置：

```json
{
  "name": "dsh-profile-dev",
  "private": true,
  "dependencies": {
    "@jiyr0119/dsh-service-console": "^0.2.2",
    "dshmarket": "^1.15.0"
  },
  "dsh": {
    "profile": {
      "bundles": [
        "@deepseek-ai/dsh-base",
        "@deepseek-ai/dsh-web-app",
        "dshmarket",
        "@jiyr0119/dsh-service-console"
      ]
    }
  }
}
```

### 2. 安装依赖

```bash
cd ~/.dsh/profiles/dev
pnpm install
```

### 3. 用 symlink 替换 npm 版本（关键步骤）

```bash
# 删除 npm 安装的版本
rm -rf ~/.dsh/profiles/dev/node_modules/@jiyr0119/dsh-service-console

# 创建 symlink 指向本地项目
ln -s /Users/jonathan/workspaceforme/dsh-service-console ~/.dsh/profiles/dev/node_modules/@jiyr0119/dsh-service-console
```

### 4. 验证链接

```bash
ls -la ~/.dsh/profiles/dev/node_modules/@jiyr0119/dsh-service-console
# 应该显示 → /Users/jonathan/workspaceforme/dsh-service-console
```

---

## 开发工作流

```
修改代码 → npm run build → 刷新浏览器（不需要重启 DSH）
```

1. 在本地项目目录修改代码
2. 执行 `npm run build` 构建
3. 刷新 http://127.0.0.1:3090 即可看到变化

**注意：** symlink 方式下，DSH 直接读取 `lib/` 目录的构建产物，所以只需要 build，不需要重启服务。

---

## 发布新版本

```bash
# 1. 升级版本号
# package.json 和 dsh.plugin.json 中的 version 同步修改

# 2. 运行测试
npm test

# 3. 登录 npm（如果未登录）
npm login

# 4. 发布
npm publish
```

---

## 常见问题

### Q: 刷新后插件没有加载？

检查 symlink 是否存在：
```bash
ls -la ~/.dsh/profiles/dev/node_modules/@jiyr0119/dsh-service-console
```

如果不存在，重新执行步骤 3 创建 symlink。

### Q: 修改代码后刷新没有变化？

确保已执行 `npm run build`。symlink 只是链接目录，不会自动构建。

### Q: 3090 端口被占用？

```bash
# 查找占用端口的进程
lsof -nP -iTCP:3090 -sTCP:LISTEN

# 终止进程
kill <PID>
```

### Q: 想用 npm 注册的正式版本测试？

```bash
# 删除 symlink，重新安装 npm 版本
rm ~/.dsh/profiles/dev/node_modules/@jiyr0119/dsh-service-console
cd ~/.dsh/profiles/dev
pnpm install
```

---

## 目录结构

```
~/.dsh/profiles/dev/
├── package.json              # profile 配置（dependencies + bundles）
├── node_modules/
│   └── @jiyr0119/
│       └── dsh-service-console → /path/to/local/project  (symlink)
└── ...

/path/to/local/project/
├── src/                      # 源码
├── lib/                      # 构建产物（DSH 实际加载的）
├── dynamic/                  # 动态版 Host/Client
└── package.json
```
