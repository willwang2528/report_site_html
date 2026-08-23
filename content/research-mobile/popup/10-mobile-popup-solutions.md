---
tags:
  - papers/mobile-popup
  - research/solution-scan
date: 2026-08-23
---

# 移动端弹窗补充调研：实际发现与关闭方法

- 日期：2026-08-23
- 目标：补充五篇精读之外，真正把移动端弹窗从“被看见”推进到“被拒绝、接受、关闭或阻止出现”的论文方法与工程实现。
- 边界：只提炼弹窗发现和处置链；论文原本用于隐私测量、安全分析或 GUI 测试，不影响我们只借鉴其中的弹窗方法。

## 纳入标准

| 证据级别 | 必须满足 | 本页如何表述 |
|---|---|---|
| 实际处置 | 明确在移动 App、移动浏览器或 WebView 中执行按钮点击、专用回调或规则阻止 | 可以写“执行了接受、拒绝或关闭” |
| 坐标能力 | 找到关闭入口，但实验没有执行动作后检查 | 只能写“给出候选坐标” |
| 工程原语 | 官方或工业 API 能读到弹窗并发出真实动作 | 写清规则与验证仍由调用方实现 |
| 不纳入 | 只分类、只做安全判断、只定义语义/协议，或没有移动端证据 | 放入“明确排除” |

## 论文方法

### 1. The OK Is Not Enough

- **论文名称：** [The OK Is Not Enough: A Large Scale Study of Consent Dialogs in Smartphone Applications](https://www.usenix.org/conference/usenixsecurity23/presentation/koch)；中文译名：仅有“确定”还不够：智能手机应用同意对话框的大规模研究。
- **解决的问题：** 测量 Android 与 iOS 应用在启动时展示的隐私同意对话框及其对数据收集的影响。
- **边界：** 只处理首次启动时可由 Appium 提取文本的同意对话框；系统权限提示被排除；使用 rooted Galaxy A13 与 jailbroken iPhone（iOS 14.5），图片化文案、后续流程中的弹窗和含糊按钮会漏掉。
- **核心提炼：** 从 Appium 元素文本中用正则确认隐私对话框，再匹配明确的接受/拒绝按钮并分别实际点击。

1. Appium 抽取当前 Android/iOS 页面中暴露的文字与可交互元素。
2. 隐私/GDPR 短语正则先确认当前界面属于 consent dialog。
3. `okay`、`accept`、`reject` 等按钮词与否定词规则区分可执行选择。
4. 工具在独立运行中分别点击明确的接受或拒绝按钮。
5. 论文记录了 350 次接受和 112 次拒绝交互，但只覆盖明确按钮且可访问的首次弹窗。

<details>
<summary>实现与证据边界</summary>
<p>它跨 Android/iOS 使用同一套文本规则，是实际手机上的点击证据；但根本目标是隐私测量，关闭机制没有统一弹窗成功率，Appium 也可能读不到图片化或自绘内容。</p>
</details>

### 2. The TCF doesn’t really A(A)ID

- **论文名称：** [The TCF doesn’t really A(A)ID – Automatic Privacy Analysis and Legal Compliance of TCF-based Android Apps](https://arxiv.org/html/2602.20222)；中文译名：TCF 并没有真正保护 AAID：基于 TCF 的 Android 应用自动隐私与合规分析。
- **解决的问题：** 自动操作 Android 应用中的 TCF consent banner，以比较不同选择是否被应用正确保存。
- **边界：** 只覆盖 Android 模拟器上的 TCF/CMP 弹窗；需要先人工研究各 CMP 的常见文案，失败后仍要增补目标句和调节流程，不覆盖 iOS、普通广告或未知自绘弹窗。
- **核心提炼：** 用多语言句向量把可访问按钮文本与预设目标句匹配，再让 Appium 完成多步骤滚动、开关和确认。

1. 先从应用配置或人工观察确定 CMP，并收集各类 banner 中反复出现的目标句。
2. Appium 等待、读取并滚动可访问元素，取得按钮的 `text` 或 `content-description`。
3. `paraphrase-multilingual-MiniLM-L12-v2` 按相似度阈值选择最接近目标句的元素。
4. 工具执行“全部接受”“仅合法利益”“全部拒绝”三套多步骤按钮与开关序列。
5. 随机样本通过 SharedPreferences 中保存的 TCF 值核对所选结果；576 个目标应用中有 561 个可交互。

<details>
<summary>实现与证据边界</summary>
<p>这是比纯关键词更能容忍多语言改写的按钮选择法，并对保存结果做了抽样验证；正式环境是 rooted Pixel 9 Pro/API 35 模拟器，界面差异仍需要人工调参。</p>
</details>

### 3. DiOS

- **论文名称：** [DiOS: Dynamic Privacy Analysis of iOS Applications](https://papers.put.as/papers/ios/2014/report.pdf)；中文译名：DiOS：iOS 应用动态隐私分析。
- **解决的问题：** 原论文解决大规模 iOS 动态隐私分析；AlertManager 是防止 Alert 中断自动探索的子组件。
- **边界：** 2014 年旧版 iOS 6、iPhone 4，多数客户端依赖越狱，并逆向 UI Automation 的内部 Objective-C 接口；应用自定义 Alert 仍可能需要专用处理器，论文也没有 Alert 消失率或任务恢复专项验证。
- **核心提炼：** 直接订阅 Alert 出现回调，按 Alert 所有者和按钮黑名单选择默认、允许或避免跳转的按钮。

1. AlertManager 注册回调，系统或应用 Alert 出现时由框架主动通知。
2. 根据发起者把 Alert 交给系统级或应用专用 AlertHandler。
3. 通用提示点击默认按钮；隐私权限提示明确点击 Allow。
4. `rate`、`evaluate`、`try` 等可能跳往 App Store 的按钮进入黑名单。
5. 处理器点击按钮后继续动态分析；无法匹配的应用自定义提示需要单独策略。

<details>
<summary>实现与证据边界</summary>
<p>它是“协议事件发现”而非截图识别，因而不会等到弹窗遮住后再猜测；代价是依赖当时的私有、越狱自动化栈，且固定点 Allow 不是任务条件化选择。</p>
</details>

### 4. Consent-O-Matic

- **论文名称：** [Consent-O-Matic: Automatically Answering Consent Pop-ups Using Adversarial Interoperability](https://doi.org/10.1145/3491101.3519683)；中文译名：Consent-O-Matic：利用对抗式互操作自动回答同意弹窗。
- **解决的问题：** 自动识别 Web CMP consent popup，并按照用户预先保存的偏好完成多层选择与提交。
- **边界：** 论文没有移动端实验；当前项目页另行确认可安装于 iPhone/iPad 的移动 Safari，但没有公开真机效果指标，也不覆盖原生 App、浏览器 chrome 或规则尚未适配的 CMP 变体。
- **核心提炼：** 按 CMP-specific DOM 规则识别组件，操作表单、开关并触发保存动作，把复杂 consent popup 转成可复现的规则适配器。

1. 扩展根据维护的 CMP 规则判断当前页面是否含受支持的 consent popup。
2. 规则读取 CMP 的 DOM 结构，以及 checkbox、CSS class 等可观察状态，而不是只匹配可见的“接受”文字。
3. 用户偏好映射为目的/厂商开关和最终提交动作。
4. 扩展执行多步选择并提交，令已支持的 popup 完成交互。
5. 未覆盖变体由用户报告，开发者更新规则；当前提供移动 Safari 版本。

<details>
<summary>实现与证据边界</summary>
<p>优势是能绕过暗黑模式的视觉布局，按可观察表单状态模拟按钮、滑块、复选框与保存点击；弱点是规则维护成本高，对陌生 CMP 与非标准自绘层没有通用发现能力。</p>
</details>

### 5. CydiOS 的软键盘弹层

- **论文名称：** [CydiOS: A Model-Based Testing Framework for iOS Apps](https://doi.org/10.1145/3597926.3598033)；中文译名：CydiOS：面向 iOS 应用的模型驱动测试框架。
- **解决的问题：** 提高 iOS 模型驱动 GUI 测试覆盖率，其中一个窄场景是软键盘成为顶层窗口后阻止继续读取界面。
- **边界：** 只解决软键盘弹层，不处理 UIAlert、权限或广告弹窗；依赖 iOS 10.3.1–13.4.1 的越狱真机、进程注入和 hook。
- **核心提炼：** 监听顶层窗口变化事件，在键盘出现时直接调用专用 `dismissKeyboard`，无需理解屏幕语义。

1. 点击输入框后，iOS 键盘创建新的顶层 window。
2. 注入扩展 hook 到 `willMoveToWindow`，以窗口迁移作为弹层出现信号。
3. `willMoveToWindow` 触发时，扩展直接调用 `dismissKeyboard` 关闭键盘。
4. 这一处理的目的是恢复 UI hierarchy 和上下文读取。
5. 论文没有键盘消失或恢复读取的专项后置验证。

<details>
<summary>为什么保留这个窄案例</summary>
<p>它符合“特定移动端阻塞层 + 真实关闭方法”，也说明如果平台暴露专用生命周期事件和关闭 API，就不必先做通用语义理解；若把弹窗严格限定为 dialog/alert，可排除本项。</p>
</details>

## 工程实现

### Android：Modern UI Automator 2.4 与 UiAutomation

- **URL：** [Modern UI Automator](https://developer.android.com/training/testing/other-components/ui-automator)；[UiAutomation](https://developer.android.com/reference/android/app/UiAutomation)
- **发现与关闭：** 高层 API 可用 `watchFor(PermissionDialog)` 或文本、ID、content-description 谓词发现节点并执行 `clickAllow()`、`clickDeny()`；低层 UiAutomation 可枚举窗口、注入触摸/Back 并等待 AccessibilityEvent。
- **边界：** 需要可访问节点或预先编写的规则；纯像素自绘层仍需视觉补充；2.4 API 仍在开发中，稳定等待也只表示可访问性树暂时不再变化。

<details>
<summary>适合直接借鉴的接口</summary>
<p>已知权限弹窗用内置 PermissionDialog watcher；已知应用弹窗用 ScopedWatcher + 节点谓词；跨窗口场景用 interactive windows；动作后由调用方再次查询弹窗节点是否不存在。</p>
</details>

### iOS：XCTest UI Interruption Monitor

- **URL：** [Handling UI Interruptions](https://developer.apple.com/documentation/xctest/handling-ui-interruptions)；[addUIInterruptionMonitor](https://developer.apple.com/documentation/xctest/xctestcase/adduiinterruptionmonitor(withdescription:handler:))
- **发现与关闭：** 测试注册 monitor；下一次目标操作被顶层中断阻塞时，XCTest 把中断元素交给回调，回调查询 Alert 按钮、点击并返回已处理。
- **边界：** 支持模拟器与物理 iOS/iPadOS 设备、无需越狱，可处理 App 或系统产生且由 XCUIElement 暴露的中断；monitor 不是持续扫描器，只在测试动作受阻后触发，预期弹窗应直接查询 `app.alerts`，纯视觉自绘层不在范围内。

<details>
<summary>适合直接借鉴的接口</summary>
<p>把“动作被遮挡”作为发现信号可以减少误判；处理器明确返回 true/false 交给后续 monitor，但点击后仍应额外断言 Alert 不存在。</p>
</details>

### Appium：UiAutomator2 与 XCUITest Drivers

- **URL：** [Appium UiAutomator2 Driver](https://github.com/appium/appium-uiautomator2-driver)；[Appium XCUITest Driver](https://github.com/appium/appium-xcuitest-driver)；[XCUITest Capabilities](https://appium.github.io/appium-xcuitest-driver/latest/reference/capabilities/)；[XCUITest Settings](https://appium.github.io/appium-xcuitest-driver/latest/reference/settings/)；[mobile: alert](https://appium.github.io/appium-xcuitest-driver/latest/reference/execute-methods/)
- **发现与关闭：** Android 可调用 `mobile: acceptAlert`/`dismissAlert` 或服务端 Scheduled Action 轮询已知 locator；iOS 可通过 WebDriverAgent 枚举 Alert 按钮并按标签、自动接受或自动拒绝。
- **边界：** 两者提供协议和执行原语，不给出通用按钮决策；Android Alert 的可访问性表示不统一，iOS 自绘蒙层也未必暴露；XCUITest 支持模拟器和真机、无需越狱，但真机必须签名并部署 WebDriverAgent；WDA 会真实点击 XCUIElement，Appium 不自动证明 Alert 已消失。

<details>
<summary>适合直接借鉴的接口</summary>
<p>短生命周期 Android 弹窗可把轮询和点击下沉到设备侧，减少 HTTP 往返错过窗口；iOS 系统提示可能属于 SpringBoard，需要切换正确进程再查询。</p>
</details>

### WebView：WebChromeClient 与 WKUIDelegate

- **URL：** [Android WebChromeClient](https://developer.android.com/reference/android/webkit/WebChromeClient)；[Apple WKUIDelegate](https://developer.apple.com/documentation/webkit/wkuidelegate)
- **发现与关闭：** 网页调用 JavaScript `alert`、`confirm`、`prompt` 时，WebView 内核直接触发宿主回调；Android 宿主以 `JsResult`/`JsPromptResult` 回传选择，iOS 宿主自行呈现并关闭原生面板后，再以 completion handler 把结果交回 WebKit。
- **边界：** 只覆盖应用自己拥有的 WebView 协议弹窗，不会发现 DOM/CMP 自绘遮罩，也不能控制独立 Safari/Chrome 的浏览器 chrome。

<details>
<summary>适合直接借鉴的接口</summary>
<p>这是最干净的“绕过语义层”路径：Android 调用 JsResult.confirm/cancel 或 JsPromptResult.confirm(value)；iOS 的 alert、confirm、prompt completion handler 分别回传 Void、Bool、String?/nil，但不会替宿主寻找或关闭任意弹窗；前提是框架拥有 WebView 宿主回调。</p>
</details>

### 移动浏览器：规则拦截与自动填表

- **URL：** [Consent-O-Matic mobile Safari](https://consentomatic.projects.cavi.au.dk/)；[Firefox Android Cookie Banner Blocker（历史功能）](https://support.mozilla.org/en-US/kb/cookie-banner-reduction-firefox-android)；[AdGuard Annoyance Filters](https://adguard.com/en/blog/new-annoyance-filters.html)
- **发现与关闭：** Consent-O-Matic 识别 CMP 并填写、提交偏好；Firefox Android 历史功能优先注入 opt-out Cookie，失败时按 CSS selector 点击拒绝；AdGuard 只以规则阻止、隐藏或移除元素。
- **边界：** 规则只覆盖已维护的网站和组件；单纯隐藏节点不等于已经向 CMP 保存拒绝选择；Firefox 内置功能已经下线，AdGuard 不保证页面功能不受影响。

<details>
<summary>适合直接借鉴的接口</summary>
<p>规则法适合高频、稳定组件：命中时成本低且可复现；未知变体仍需要报告和更新规则，因此它是长尾维护体系而非通用视觉理解器。</p>
</details>

## 明确排除

- **只检测不处置：** 只判断“有无弹窗”、暗黑模式、安全风险或权限申请是否合理，但没有执行关闭、拒绝、接受或阻止出现的方法。
- **只有标准没有实现：** ARIA `dialog`、WHATWG dialog/inert、W3C WebDriver user prompt 等只定义语义或协议边界，本身不证明移动端方案已经运行。
- **只有桌面证据：** 未说明移动浏览器、移动视口、WebView、Android 或 iOS 环境的桌面 Cookie 扩展与爬虫。
- **把坐标当闭环：** 只输出关闭坐标、没有动作后检查的工作，保留为候选执行入口，不能写成已经解决弹窗。
- **安全控制绕过：** CAPTCHA、风控、身份认证和平台安全提示不属于正常 UI 弹窗处置范围。

## 结论

现有方法已经分别证明三条可执行路线：**平台/协议回调直接接管、可访问性树 watcher、DOM/CMP 规则适配**；纯截图路线已经能定位并输出候选关闭坐标，但 PopSweeper 尚未实证真实点击及动作后关闭验证。目前仍没有同一方案在现代 Android 真机、未越狱 iPhone、移动浏览器与 WebView 上，对未知弹窗同时完成可靠发现、正确动作选择和动作后关闭验证。
