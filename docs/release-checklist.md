# npm 发布 checklist（T3-3）

> 2FA 的 OTP 为 30 秒一次性验证码，必须在发布那一刻输入，不能当作可异步转交事项。
> 版本同步四处：`package.json` / `dsh.plugin.json` / `manifest.json` / `CHANGELOG.md`。

## 发布前验证（缺一不可）

- [x] `npm run typecheck`
- [x] `npm run build`（Host ESM + Client `__ModuleLoader__` bundle）
- [x] `npm test`（单元 7 + 集成 2）
- [x] `npm pack --dry-run`：tarball 含 `lib/`、`dsh.plugin.json`、`cordis.patch.yml`、`manifest.json`、`dynamic/`、`README*`、`LICENSE`
- [x] preflight 组合解析（临时 profile add + dump-config，已清理）
- [ ] 真实 DSH Web profile 挂载验证（T2-7 后半：header 入口、面板、`/dsh-sc/api/*`、硬刷新）

## 发布步骤

```bash
# 1) 版本 bump（四处同步）
npm version patch -m "chore: v0.1.1"
# 手动同步 dsh.plugin.json / manifest.json / CHANGELOG.md 的版本号

# 2) 构建 + 发布
npm run build
npm publish        # 需要 OTP（2FA）

# 3) Git
git add .
git commit -m "feat: ..."
git push
git tag v0.1.1 && git push origin v0.1.1

# 4) GitHub Release
gh release create v0.1.1 --title "v0.1.1" --notes "..."

# 5) 冒烟：临时 profile 安装新版本
dsh plugin --profile smoke add -w "@jiyr0119/dsh-service-console@latest"
dsh --profile smoke --dump-config >/dev/null && echo OK
rm -rf "$HOME/.dsh/profiles/smoke"
```

## keywords（可检索事实描述）

`deepseek-harness` · `cordis` · `dsh-plugin` · `local-dev-server` · `port-manager`

## 发布顺序（完整）

功能完成 → typecheck/build/pack → preflight + 真实 Web 验证 → 版本与 CHANGELOG 同步 → commit/tag/push → npm publish → GitHub Release → 干净安装冒烟 → awesome issue/PR（T3-5）。
