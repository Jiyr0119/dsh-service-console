// CSS Modules 类型声明（tsdown/lightningcss 内联编译产物）
declare module '*.module.css' {
  const classes: Record<string, string>
  export default classes
}
