---
tags:
  - papers/web-privacy
  - papers/mobile-popup
  - papers/cookie-banner
aliases:
  - Exploring the Cookieverse
  - BannerClick
date: 2026-08-22
doi: 10.1007/978-3-031-28486-1_26
arxiv_id: 2302.05353
---

# Exploring the Cookieverse：BannerClick 如何进入设置并执行拒绝

## 核心信息

- 标题: Exploring the Cookieverse: A Multi-Perspective Analysis of Web Cookies
- 标题翻译: 探索 Cookie 宇宙：Web Cookie 的多视角分析
- 作者: Ali Rasaii, Shivani Singh, Devashish Gosain, Oliver Gasser
- 机构: Max Planck Institute for Informatics; New York University; KU Leuven
- 发表时间: 2023
- 发表渠道: Passive and Active Measurement Conference 2023
- DOI: 10.1007/978-3-031-28486-1_26
- arXiv: 2302.05353
- 论文链接: [Springer DOI](https://doi.org/10.1007/978-3-031-28486-1_26)
- 代码 / 项目: [BannerClick](https://bannerclick.github.io/)
- 数据 / 资源: [项目数据与分析脚本](https://bannerclick.github.io/)
- 论文类型: Web 隐私测量与 Cookie Banner 自动交互工具

## 原文摘要翻译

近年来网络 Cookie 已成为大量研究的对象，但多数工作没有同时考虑会改变 Cookie 生态的多个关键视角，例如客户端位置、横幅交互方式以及访问网站所使用的操作系统。论文从多个地理位置对 Tranco Top-10K 网站开展综合测量。

Cookie 横幅是影响 Cookie 的重要因素，作者开发 BannerClick，自动检测、接受和拒绝横幅，准确率分别达到 99%、97% 和 87%。从欧盟地区访问网站时，横幅出现率高出 56%。

作者还分析交互前后的第一方、第三方和追踪 Cookie；点击接受后，网站发送的第三方 Cookie 平均增加 5.5 倍。研究进一步考察统计一致性、同意管理平台、首页与内页差异，以及桌面和移动配置差异。

结果表明，这些因素都会显著影响 Cookie 生态，因此网络测量应采用多视角设计。

## 创新点

1. **把 Banner 交互纳入 Cookie 测量变量。** 不再只被动加载页面，而是分别运行不交互、接受和拒绝三种模式。
2. **用 DOM 结构定位完整 Banner。** 多语言关键词只提供种子，系统再沿 DOM 向上找带正 z-index 或固定定位的锚点，并向下收缩到最具体容器。
3. **为拒绝入口设计多级回退。** 直接 Reject 失败后尝试 CMP 接口，再进入 Settings 对话框继续寻找拒绝。
4. **明确比较移动与桌面配置。** 同一 OpenWPM 测量框架中改变 Android User-Agent 和视口，观察 Cookie 与 Banner 的差异。

## 一句话总结

BannerClick 是四篇中动作语义最明确的方法：它能区分 Accept、Reject 和 Settings，并在拒绝入口隐藏时进入下一层对话框；但它只适用于可访问 DOM 的移动 Web，不是原生应用弹窗处理器。

## 研究问题

Web 隐私测量如果不与 Cookie Banner 交互，就只能看到默认状态下的 Cookie。不同地区的法规、不同按钮选择、首页与内页以及移动与桌面页面都可能改变观测结果。BannerClick 的角色是让研究者可重复地产生“不交互、接受、拒绝”三种实验条件。

它不是一篇以 GUI 自动化为主目标的论文。论文主体是八个地域节点上的 Cookie 多视角测量，BannerClick 是其中关键的实验控制工具。因此站点中应同时保留它的交互机制与严格适用边界。

## 数据与任务定义

### 工具核验

作者在 Tranco Top-1K 上人工确认 Banner 存在性和点击结果：518 个网站显示 Banner；444 个有显式接受入口；拒绝评估则覆盖 524 个样本。检测、接受和拒绝分别独立核验，避免把“找到 Banner”误当成“完成交互”。

### 大规模测量

主研究使用德国、瑞典、美国东部、美国西部、印度、巴西、南非和澳大利亚八个 AWS 节点，目标是 Tranco Top-10K。德国节点的 Banner 交互测量由一万个域名、五次重复和三种交互模式组成，最后保留 135,307 次成功测量。

### 移动配置

移动实验不是物理手机：OpenWPM 仍运行 Firefox，只把 User-Agent 改成 Android 12 移动版本，并把视口从 $1366\times768$ 改成 $340\times695$。作者人工确认多数网站会切换移动外观，但承认部分网站不会仅凭这两项配置提供真实移动版本。

## 方法主线

### 机制流程

1. **关键词种子。** 从 50 个网站人工整理 Cookie、Privacy、Consent、Accept 等 8 个英文词，翻译到 11 种其他语言，形成 80 词词表。
2. **定位锚点。** 搜索含词表命中的可见元素，沿 DOM 向上寻找具有正 z-index 或 fixed 定位的元素；找不到时退到 body。
3. **收缩容器。** 从锚点向下遍历，寻找仍完整包含所有可见 Banner 元素的最具体父节点。
4. **处理 iframe。** 常规 DOM 失败后，遍历所有可见 iframe，在其内部重复检测流程。
5. **选择动作。** 在横幅容器中查找接受、拒绝、设置三类词。多候选时优先标准按钮标签，再选择文本最短的元素；同时兼容输入标签和分区标签等非标准按钮实现。
6. **拒绝回退。** 没有直接 Reject 时，先调用 Never-Consent 支持的 CMP 拒绝接口；仍失败则点击 Settings，在新对话框中再次搜索拒绝。
7. **保存证据。** 在交互前、检测到 Banner 后、每次点击后保存截图，供人工复核。

![BannerClick 的 DOM 定位方法](/research-mobile/popup-assets/cookieverse/page_007_fig_fig_1.png)
*图 1：从命中关键词的文本节点向上寻找锚点，再向下收缩到完整 Cookie Banner 容器。*

### 为什么拒绝更困难

接受通常是首层高亮按钮；拒绝经常被隐藏在管理选项、更多信息或设置内，甚至要求逐项关闭多个类别。BannerClick 因此不是一次关键词点击，而是一个最多跨越两层界面并可调用同意管理平台接口的策略链。

## 关键结果

### 检测、接受与拒绝

| 能力 | 人工核验结果 | 主要失败原因 |
|---|---:|---|
| Banner 检测 | 513/518 个真实 Banner；假阳性 4 个 | Shadow DOM、词表缺词、正文中出现 Cookie 词但无 Banner |
| 显式接受 | 430/444，准确率超过 97% | “NOT Accept”等否定语义、词表缺词 |
| 拒绝 | 377/524，准确率 87.4% | 38 个网站需要多选机制，81 个样本没有拒绝入口 |

接受错误中的 13 个网站含否定语义，说明字符串命中不能理解组合语义。拒绝结果也提醒我们：某些网站根本不给一键拒绝，工具能力与界面合规性不能混为一谈。

### 对 Cookie 测量的影响

在德国节点，作者约能在 47% 的可访问网站上检测 Banner，并在全部网站中的约 40% 和 30% 上分别完成接受和拒绝。点击接受后，第一方 Cookie 数量增加一倍以上，第三方 Cookie 平均增加 5.5 倍，平均追踪 Cookie 从 0 增加到 7。这证明交互模式是测量设计中的决定性变量。

### 移动与桌面

在所有地域中，14.6% 的网站在移动和桌面配置下呈现不同的第三方 Cookie 数量，9% 的网站呈现不同的追踪 Cookie 数量。Banner 检出比例在移动和桌面配置下接近，但这不代表真实手机浏览器和桌面浏览器等价，只说明该模拟设置中 Banner 出现率相近。

## 深度分析

### 结构化网页方法为何优先于视觉方法

BannerClick 使用 DOM、可见性、层叠顺序、固定定位、内嵌框架和按钮文本，这些证据直接对应“容器在哪里”和“按钮是什么意思”。在可访问网页中，这比从截图猜关闭图标更可解释，也更容易区分接受和拒绝。视觉模型更适合作为影子 DOM、画布或不可访问覆盖层的补充，而不是默认第一层。

### 它是否解决移动端弹窗

严格地说，它解决的是移动视口下的网页 Cookie 横幅。它能定位并实际点击接受、拒绝和设置，也能处理隐藏拒绝入口，因此与“移动端弹窗动作语义”直接相关。但它不能看到原生 Android 或 iOS 对话框，也无法处理没有 DOM 的广告覆盖层。

### 点击拒绝不等于隐私目标达成

论文会继续采集 Cookie，从而能发现拒绝后的实际追踪行为；这比只看 Banner 消失更完整。但 BannerClick 的 87.4% 指标仍只是正确执行拒绝入口，不是“网站停止追踪”的成功率。工程系统应把界面处置和后端效果验证分成两个指标。

### 与其他方法的互补

- PopSweeper 适合无 DOM 的原生视觉覆盖层，但不理解动作语义。
- WhisperTest 能在 iPhone 上执行原生和 WebView 交互，但同意偏好需预设。
- BannerClick 可以作为移动 Web 专用策略层，通过浏览器 DOM 驱动准确动作。

## 局限

1. 只解决 Cookie Banner，不覆盖通用网页弹窗或原生 App 对话框。
2. 依赖 12 种语言词表，其他语言和词表外文案可能漏检。
3. Shadow DOM 会阻断常规 DOM 搜索；跨域或特殊 iframe 也可能受限。
4. 关键词不能理解否定关系，“NOT Accept”会产生错误动作。
5. 多选拒绝、无拒绝入口和非标准 CMP 实现仍是主要失败来源。
6. 移动端仅由 Android User-Agent 和小视口模拟，不是物理 Android 或 iOS 设备。
7. 使用 Firefox/OpenWPM，结果不能直接外推到 Chrome、Safari 或系统 WebView。

## 我的笔记

### 最值得保留的策略链

拒绝流程的三层回退很实用：直接按钮、CMP 结构、设置页再搜索。它说明弹窗处理不应只有“找一个按钮并点掉”，而应根据动作目标维护有限状态机。

### 与原生弹窗统一时的边界

可以统一“动作意图”和“结果验证”，但不应统一底层感知：Web 优先 DOM 和协议，Android/iOS 原生界面优先可访问性树与系统事件，无结构覆盖层最后使用 OCR 和视觉模型。

### 适合站点中的定位

**移动 Web Cookie Banner 的结构化检测与接受、拒绝、设置多步交互方法。** 它不应被标成真机原生移动弹窗方案。

## 引用

- [Springer DOI](https://doi.org/10.1007/978-3-031-28486-1_26)
- [arXiv 版本](https://arxiv.org/abs/2302.05353)
- [BannerClick 项目](https://bannerclick.github.io/)
