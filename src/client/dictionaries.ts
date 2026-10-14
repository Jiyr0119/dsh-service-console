/**
 * dsh-service-console — i18n 词典（对齐 DSH locale.register 机制）
 * 与 dsh-workspace-explorer 共享设计语言：flat key → template string with {vars}
 *
 * 类型化：ZH_DICT 的键集是词典权威（ConsoleKey）；EN_DICT 必须同键集
 * （satisfies Record<ConsoleKey, string> —— 缺键/多键都是编译错误）。
 */
export const ZH_DICT = {
  // 插件名称
  'plugin.name': '服务控制台',

  // 面板标题
  'panel.title': 'Service Console',
  'panel.subtitle': '本机监听服务',

  // Header 入口
  'entry.label': '服务',
  'entry.tip': '服务控制台',

  // 搜索
  'search.ph': '搜索服务、端口或路径…',

  // 状态
  'status.scanning': '正在扫描…',
  'status.done': '{n} 项服务',
  'status.lastScan': '最近扫描',
  'status.error': '扫描失败',

  // 服务列表
  'svc.noSvc': '未发现服务',
  'svc.ports': '端口',
  'svc.pid': 'pid',
  'svc.command': '命令',
  'svc.cwd': '工作目录',

  // 操作
  'action.stop': '停止',
  'action.restart': '重启',
  'action.detail': '详情',
  'action.confirm': '确认',
  'action.cancel': '取消',
  'action.pending': '处理中…',

  // 确认对话框
  'confirm.stop': '确认停止?',
  'confirm.restart': '确认重启?',
  'confirm.txt': '确认对 {name} (pid {pid}) 执行 {action}?',

  // 操作结果
  'result.stopped': '已停止',
  'result.restarted': '已重启',
  'result.error': '操作失败',

  // 归属标签
  'own.conversation': '本次对话',
  'own.workspace': '工作区推断',
  'own.other': '本机其他',
  'own.unknown': '未知',
  'own.protected': '受保护',

  // 范围（FR-05）
  'scope.conversation': '本次对话',
  'scope.workspace': '当前工作区',
  'scope.machine': '本机',
  'scope.machineWarn': '本机范围可能影响其他项目的服务',

  // 详情面板
  'detail.title': '详情',
  'detail.serviceRecord': 'SERVICE RECORD',
  'detail.serviceId': 'SERVICE ID',
  'detail.process': 'PROCESS',
  'detail.parent': 'PARENT',
  'detail.started': 'STARTED',
  'detail.evidence': '归属证据',

  // 错误
  'err.PERMISSION_DENIED': '没有权限读取或控制该服务',
  'err.TARGET_GONE': '该服务已结束',
  'err.PID_REUSED': '进程身份已变化，已取消操作',
  'err.UNKNOWN_OWNERSHIP': '无法确认来源，不允许控制',
  'err.PROTECTED_PROCESS': '受保护进程，不能操作',
  'err.GRACEFUL_TIMEOUT': '未在等待时间内退出',
  'err.RESTART_UNSAFE': '缺少安全启动信息，不能重启',
  'err.PORT_CONFLICT': '端口仍被占用',
  'err.START_TIMEOUT': '未在预期时间开始监听',

  // 标签栏
  'tab.services': '服务',
  'tab.settings': '设置',

  // 设置
  'settings.title': '面板设置',
  'settings.general': '通用',
  'settings.refreshInterval': '自动刷新间隔',
  'settings.refresh.desc': '面板打开时定期自动重新扫描',
  'settings.refreshOff': '关闭',
  'settings.refreshN': '{n} 秒',
  'settings.defaultScope': '默认范围',
  'settings.showUnknown': '显示未知服务',
  'settings.showUnknown.desc': '关闭后隐藏归属未知的服务',
  'settings.gracefulTimeout': '优雅超时 (ms)',
  'settings.forceKill': '允许强制终止',
  'settings.forceKill.desc': '优雅超时后发送 SIGKILL',
  'settings.restore': '恢复默认',
  'settings.note': '配置持久保存在 ~/.dsh/plugins/dsh-service-console/config.json。',
  'settings.nav': 'Service Console',

  // Star
  'star.developer': '开发者',
  'star.ask': '⭐ 顺手留颗 Star，作者能高兴一整天',
  'star.cta': '行，给你一颗 Star',
} satisfies Record<string, string>

/** 词典键权威类型：tr() 与 LocaleNamespaceMap 合并共用（键名拼写错误=编译错误） */
export type ConsoleKey = keyof typeof ZH_DICT

export const EN_DICT = {
  // 插件名称
  'plugin.name': 'Service Console',

  // 面板标题
  'panel.title': 'Service Console',
  'panel.subtitle': 'Listening services on this machine',

  // Header 入口
  'entry.label': 'Services',
  'entry.tip': 'Service Console',

  // 搜索
  'search.ph': 'Search services, ports, or paths…',

  // 状态
  'status.scanning': 'Scanning…',
  'status.done': '{n} services',
  'status.lastScan': 'Last scan',
  'status.error': 'Scan failed',

  // 服务列表
  'svc.noSvc': 'no services found',
  'svc.ports': 'Ports',
  'svc.pid': 'pid',
  'svc.command': 'Command',
  'svc.cwd': 'Working dir',

  // 操作
  'action.stop': 'Stop',
  'action.restart': 'Restart',
  'action.detail': 'Detail',
  'action.confirm': 'OK',
  'action.cancel': 'Cancel',
  'action.pending': 'Working…',

  // 确认对话框
  'confirm.stop': 'Confirm stop?',
  'confirm.restart': 'Confirm restart?',
  'confirm.txt': 'Run {action} on {name} (pid {pid})?',

  // 操作结果
  'result.stopped': 'Stopped',
  'result.restarted': 'Restarted',
  'result.error': 'Action failed',

  // 归属标签
  'own.conversation': 'This chat',
  'own.workspace': 'Workspace',
  'own.other': 'Other local',
  'own.unknown': 'Unknown',
  'own.protected': 'Protected',

  // 范围（FR-05）
  'scope.conversation': 'This chat',
  'scope.workspace': 'Workspace',
  'scope.machine': 'This machine',
  'scope.machineWarn': 'Machine scope may affect services of other projects',

  // 详情面板
  'detail.title': 'Detail',
  'detail.serviceRecord': 'SERVICE RECORD',
  'detail.serviceId': 'SERVICE ID',
  'detail.process': 'PROCESS',
  'detail.parent': 'PARENT',
  'detail.started': 'STARTED',
  'detail.evidence': 'Ownership evidence',

  // 错误
  'err.PERMISSION_DENIED': 'No permission',
  'err.TARGET_GONE': 'Service gone',
  'err.PID_REUSED': 'PID reused',
  'err.UNKNOWN_OWNERSHIP': 'Unknown ownership',
  'err.PROTECTED_PROCESS': 'Protected process',
  'err.GRACEFUL_TIMEOUT': 'Graceful timeout',
  'err.RESTART_UNSAFE': 'Cannot restart safely',
  'err.PORT_CONFLICT': 'Port conflict',
  'err.START_TIMEOUT': 'Start timeout',

  // 标签栏
  'tab.services': 'Services',
  'tab.settings': 'Settings',

  // 设置
  'settings.title': 'Panel settings',
  'settings.general': 'General',
  'settings.refreshInterval': 'Auto-refresh interval',
  'settings.refresh.desc': 'Re-scan automatically while the panel is open',
  'settings.refreshOff': 'Off',
  'settings.refreshN': '{n}s',
  'settings.defaultScope': 'Default scope',
  'settings.showUnknown': 'Show unknown services',
  'settings.showUnknown.desc': 'Hide services with unknown ownership when off',
  'settings.gracefulTimeout': 'Graceful timeout (ms)',
  'settings.forceKill': 'Allow force kill',
  'settings.forceKill.desc': 'Send SIGKILL after graceful timeout',
  'settings.restore': 'Reset to defaults',
  'settings.note': 'Saved to ~/.dsh/plugins/dsh-service-console/config.json — persists across restarts.',
  'settings.nav': 'Service Console',

  // Star
  'star.developer': 'Developer',
  'star.ask': '⭐ Drop a Star if it helped — it makes the author\'s day',
  'star.cta': '★ Give a Star',
} satisfies Record<ConsoleKey, string>
