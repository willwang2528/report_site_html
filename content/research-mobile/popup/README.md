# Popup Research

本目录研究移动端 Agent 在正常、获授权的软件使用或测试流程中，如何识别并处理阻断任务的 UI 弹窗。

当前交付分成两个子模块：

1. **底层解决方法**
   - [移动端 UI 弹窗底层原理调研](./01-popup-principles.md)
   - [现有弹窗自动化方法对比](./02-methods-comparison.md)
2. **论文模块**
   - [移动 GUI Agent 权限素养论文精读](./03-popup-principles-brief.md)
   - [VLM-Fuzz 弹窗递归探索论文精读](./04-vlm-fuzz.md)

核心边界：处理 App/系统/浏览器弹窗不等于规避 CAPTCHA、风控、身份认证或平台安全控制。
