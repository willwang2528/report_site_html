---
tags:
  - papers/mobile-popup
  - research/extracted-reading
date: 2026-08-23
---

# 五篇论文提炼：只看弹窗如何发现与关闭

- 日期：2026-08-23
- 调研边界：只保留“发现弹窗—读取可操作目标—执行动作—判断是否关闭”；原任务恢复、覆盖率、安全检测和风控均不在本页展开。
- 阅读规则：每个步骤先给一句结论；实现细节默认收起，点击对应术语即可查看。

## 1. VLM-Fuzz

- **论文名称：** [VLM-Fuzz: Vision Language Model Assisted Recursive Depth-First Search Exploration for Effective GUI Testing of Android Apps](https://doi.org/10.1007/s10664-026-10816-4)；中文译名：VLM-Fuzz：视觉语言模型辅助的递归深度优先搜索，用于 Android 应用的高效 GUI 测试。
- **解决的问题：** 提高 Android GUI 自动测试的代码覆盖率。
  - 论文通过多入口启动、递归状态探索和按需 VLM 输入生成，减少动态界面、特殊输入与动作协同不足造成的探索停滞；Dialog、Popup 和 Spinner 只是其中一种临时 GUI 状态。
- **边界：** 只覆盖 Android；弹窗处理依赖 AccessibilityService 导出的 UI hierarchy XML、同一 Activity 内的控件差分和 150 像素边距规则；不直接覆盖没有可访问节点的纯视觉自绘或全屏覆盖；没有弹窗专项成功率，也不负责选择符合用户任务的按钮。

**核心提炼：** 它用 UI 树和布局尺寸发现临时覆盖层，随后机械遍历其中的可操作控件，直到某个动作令覆盖层消失。

1. **发现弹窗：** 动作前后 Activity 不变但可交互控件集合发生变化，且新布局任一边缘距屏幕超过 150 像素时，系统把它标记为临时弹窗状态。

<details>
<summary>发现机制</summary>
<p>自定义 AccessibilityService 导出动作前后的 GUI hierarchy XML；系统先比较 Activity，再对新增控件计算最小外接矩形，以“同一页面中的局部新布局”近似 Dialog 或 Popup，而不是让 VLM 判断这是不是弹窗。</p>
</details>

2. **读取控件：** 系统从弹窗自己的 UI hierarchy XML 中提取可点击、可编辑等交互节点。

<details>
<summary>控件来源</summary>
<p>节点包含文本、坐标和交互属性；如果弹窗没有向 Android 可访问性层暴露节点，这条读取链就没有论文给出的直接兜底方案。</p>
</details>

3. **决定动作：** 普通无输入弹窗按启发式顺序遍历全部动作，有文本输入时才按需调用 VLM 生成输入与动作序列。

<details>
<summary>动作规则</summary>
<p>无文本页面把按钮分为 neutral、positive 和 negative，依次尝试；论文所谓“完整探索弹窗动作”是覆盖率导向的穷举，不是识别并只点击关闭按钮。</p>
</details>

4. **执行点击：** 工具通过 Android 自动化通道按节点坐标发送点击等动作。

<details>
<summary>点击执行</summary>
<p>点击目标来自 XML 节点到屏幕坐标的映射，设备通过 ADB 接入；实现兼容模拟器和真机，但正式对比实验使用 Pixel 2 模拟器。</p>
</details>

5. **观察结果：** 动作关闭弹窗并返回宿主 Activity 时，系统确认临时状态结束；若动作跳转到其他界面，则只记录为另一种状态转移。

<details>
<summary>关闭判定</summary>
<p>返回宿主时会继续比较 Activity 和宿主 UI 树；跳转或退出不应当作关闭证据。论文没有给出“关闭按钮识别准确率”，也不能证明所选动作符合用户意图。</p>
</details>

## 2. PopSweeper

- **论文名称：** [PopSweeper: Automatically Detecting and Resolving App-Blocking Pop-Ups to Assist Automated Mobile GUI Testing](https://arxiv.org/abs/2412.02933)；中文译名：PopSweeper：自动检测并解除阻塞应用的弹窗，以辅助移动 GUI 自动化测试。
- **解决的问题：** 避免广告和系统提示等视觉弹窗遮挡控件并打断移动 GUI 自动化测试。
  - 论文把连续截图分类与关闭按钮目标检测组合起来，使自动化脚本即使读不到弹窗的可访问节点，也能获得一个候选关闭坐标。
- **边界：** 只处理带可识别关闭入口的全屏或部分覆盖弹窗，排除不阻塞测试的 banner；“端到端”实验是 GIF 和录屏回放，只比较预测坐标与人工标注，没有在实验中现场点击并验证弹窗真的消失；全屏弹窗关闭按钮召回率明显较弱。

**核心提炼：** 它是纯视觉的“发现阻塞画面—定位关闭图标—返回点击坐标”方案，但论文没有完成动作后的真实关闭验证。

1. **发现变化：** 系统每 100 毫秒取一张截图，并用相邻帧 RGB 直方图相似度过滤几乎未变化的画面。

<details>
<summary>发现机制</summary>
<p>直方图只比较整体颜色分布；低于 0.8 相似度的帧才进入后续分类，以减少对静止页面的重复计算。</p>
</details>

2. **识别弹窗：** ResNet50 与 MobileNetV2 两阶段分类器判断当前截图是否含有会阻塞测试的弹窗。

<details>
<summary>控件来源</summary>
<p>这一阶段完全读取像素，不依赖 Android UI tree、文本节点或 resource-id，因此能够覆盖部分自绘广告，但也会受到透明、动画和特殊图标影响。</p>
</details>

3. **定位关闭入口：** 微调后的 YOLO-World 在弹窗截图中输出关闭按钮的边界框。

<details>
<summary>动作规则</summary>
<p>模型只寻找视觉关闭入口，不比较“允许、拒绝、稍后”等任务含义；如果弹窗没有关闭按钮或按钮样式未被模型学到，就无法给出可靠动作。</p>
</details>

4. **交付点击：** 系统把关闭按钮坐标或预测框位置返回给外部自动化脚本，由脚本负责后续点击。

<details>
<summary>点击执行</summary>
<p>论文架构允许坐标点击，但正式评测只是对录屏逐帧返回坐标并与人工标注比对，没有展示点击事件在真实设备上被执行。</p>
</details>

5. **评估结果：** 论文以关闭按钮坐标是否命中人工标注作为“解除阻塞”的代理指标。

<details>
<summary>关闭判定</summary>
<p>这里没有动作后的截图、UI 树或弹窗消失检查，所以不能把 87.1% 的应用级结果写成真实弹窗关闭成功率；它证明的是正确关闭坐标的覆盖能力。</p>
</details>

## 3. Poker

- **论文名称：** [Understanding the Sneaky Patterns of Pop-up Windows in the Mobile Ecosystem](https://arxiv.org/abs/2505.12056)；中文译名：理解移动生态系统中弹窗的隐蔽操纵模式。
- **解决的问题：** 系统研究移动应用弹窗如何通过文字、界面、强制操作和出现时机操纵用户，并自动收集足够多的真实样本。
  - 为了规模化采集，Poker 必须先识别商业 Android 应用中的弹窗区域，再排除宿主页面混入的节点，并按优先级测试候选控件的行为。
- **边界：** 只覆盖 Android，论文未说明评测使用真机还是模拟器；依赖 YOLO、灰色半透明遮罩和 UIAutomator GUI 树，明确指出 mini-program 与 WebView 难以访问；关闭目标是让弹窗消失，不判断动作是否符合用户任务。

**核心提炼：** 它先用视觉确认弹窗边界，再把视觉按钮与边界内的可点击树节点组成优先队列，用 UIAutomator 测试候选交互。

1. **发现弹窗：** YOLO 在截图中框出候选区域，并用弹窗外画面的灰色半透明遮罩比例排除误报。

<details>
<summary>发现机制</summary>
<p>系统移除候选框后，在 HSV 颜色空间统计剩余区域的阴影比例；只有同时满足“模型检测到局部框”和“背景被灰色遮罩压暗”才确认弹窗。</p>
</details>

2. **读取控件：** 一个视觉模型优先识别弹窗内的确认、退出类按钮，UIAutomator 导出的 GUI component tree 再提供边界内其他 clickable 节点。

<details>
<summary>控件来源</summary>
<p>视觉框避免只依赖混有宿主控件的 GUI 树；树节点则为视觉模型未识别的按钮、复选框等目标提供兜底候选。</p>
</details>

3. **排列动作：** 先尝试视觉模型识别出的主要按钮，再依次尝试弹窗区域内其余可点击节点。

<details>
<summary>动作规则</summary>
<p>这是“主要按钮优先、树节点兜底”的固定次序；clickable 只表示可以点击，不代表它是关闭、拒绝或最符合用户意图的选择。</p>
</details>

4. **执行点击：** Poker 通过 UIAutomator 与排序后的候选 clickable components 交互。

<details>
<summary>点击执行</summary>
<p>论文支持视觉候选优先、树节点兜底以及实际交互，但没有交代节点点击与视觉框坐标的具体注入方式；底层页面节点混入时可能误点，复选框或强制操作也可能需要多次交互。</p>
</details>

5. **统计处置：** 论文记录每个弹窗最终被 dismiss 所需的交互次数，但没有说明逐次关闭检测和停止条件的算法。

<details>
<summary>关闭判定</summary>
<p>超过 88% 的弹窗最终在不超过两次交互后被 dismiss；这证明处置链实际运行过，但不能据此补写“每次重新扫描、消失即停止”的反馈循环，也不证明最终动作符合用户意图。</p>
</details>

## 4. WhisperTest

- **论文名称：** [WhisperTest: A Voice-Control-based Library for iOS UI Automation](https://doi.org/10.1145/3719027.3765183)；中文译名：WhisperTest：基于语音控制的 iOS UI 自动化库。
- **解决的问题：** 在不访问应用源码、也不越狱设备的前提下，为 iOS 建立可感知、可执行和可观测的跨应用 UI 自动化通道。
  - 权限、同意、订阅和年龄门槛弹窗是验证该通用库的案例；系统把可访问性、截图解析、规则或模型选择与 Apple Voice Control 串成真机交互链。
- **边界：** 只自动化 iOS；实验使用未越狱真机 iPhone 8、13、13 Pro（iOS 16.7.11–18.3.2），没有模拟器实验；权限动作和接受/拒绝模式由用户预设；OCR 与视觉模型只能看到屏内内容，屏幕变化只证明发生转移。

**核心提炼：** 它用“可访问性优先、OCR/视觉兜底”发现弹窗和目标，再让非越狱 iPhone 的 Voice Control 实际点击，并以日志与画面变化做弱验证。

1. **发现弹窗：** 独立线程读取 AccessibilityAudit；结构信息不足时，再从截图运行 OCR、OmniParser 或视觉语言模型。

<details>
<summary>发现机制</summary>
<p>系统权限提示优先用稳定的可访问性结构和启发式规则识别；任何类别只要可访问性信息或规则不足，都可能继续进入 OmniParser、视觉语言模型或语言模型路径。</p>
</details>

2. **读取目标：** 可访问性层提供标签与控件状态，截图解析层提供文字、图标和屏幕坐标。

<details>
<summary>控件来源</summary>
<p>有可访问标签时可以直接引用按钮名称；没有标签时，OmniParser 把截图中的可见文字和图标转换为候选坐标，但无法读取屏外元素或隐藏状态。</p>
</details>

3. **选择动作：** 原生权限提示按预设偏好允许或拒绝，同意弹窗按预设接受/拒绝模式寻找直接按钮或进入设置层，订阅页优先关闭或进入有限版本。

<details>
<summary>动作规则</summary>
<p>规则层优先于模型；拒绝按钮若不在第一层，系统可以先点“管理选项”再寻找拒绝，但所有策略都是实验预先配置，不是基于当前用户任务临时决定。</p>
</details>

4. **执行点击：** 控制机把 “Tap 按钮名” 或编号网格命令转成语音，经 Apple Voice Control 在真实 iPhone 上执行。

<details>
<summary>点击执行</summary>
<p>本地 TTS 播放命令；有标签时直接按名称点击，只有坐标时先显示 Voice Control 编号网格，再选择覆盖目标的区域。</p>
</details>

5. **判断结果：** syslog 确认 Voice Control 是否识别命令，再比较操作前后的 OCR 文本和图像哈希是否变化。

<details>
<summary>关闭判定</summary>
<p>论文的同意弹窗实验在 50 个应用中完成 48 次预设交互，但日志只确认命令识别、截图差异只确认画面变化；动画、跳转或错误按钮都可能造成“变了但未正确解决”。</p>
</details>

## 5. Cookieverse

- **论文名称：** [Exploring the Cookieverse: A Multi-Perspective Analysis of Web Cookies](https://doi.org/10.1007/978-3-031-28486-1_26)；中文译名：探索 Cookie 宇宙：Web Cookie 的多视角分析；弹窗工具名为 BannerClick。
- **解决的问题：** 测量地理位置、页面类型、桌面/移动配置以及用户与 Cookie banner 交互如何改变网站的 Cookie 生态。
  - BannerClick 负责真正找到并处置接受或拒绝路径，使测量不只停留在“未交互页面”，也能观察选择之后新增或减少的 Cookie。
- **边界：** 只处理 DOM、可见 iframe 或已知 CMP 接口可访问的 Cookie consent banner；Shadow DOM、自绘像素层和词表外文案会漏检；“移动端”只是 Firefox 的 Android UA 与 340×695 视口仿真，不是真机、WebView 或浏览器 chrome。

**核心提炼：** 它以多语言关键词和 DOM 几何找到 banner，再按“直接拒绝—CMP 拒绝函数—设置页拒绝”的确定性路径实际处置。

1. **发现弹窗：** 在所有可见 HTML 元素中搜索 12 种语言的关键词，并从命中节点向上寻找正 z-index 或 fixed 定位的祖先。

<details>
<summary>发现机制</summary>
<p>关键词语料库由 8 个英语词及 11 种语言翻译组成，共 80 个词；正 z-index 或 fixed 定位被当作覆盖层结构信号，命中的祖先 anchor 是向下收缩 banner 边界的起点；普通 DOM 未命中时，再进入作为独立嵌入文档的可见 iframe 重复检测。</p>
</details>

2. **读取控件：** 在确认的 banner 容器中查找包含 accept、reject、settings 三组动作词的 DOM 元素。

<details>
<summary>控件来源</summary>
<p>候选可来自 button、input 或充当按钮的 div；系统优先真正的 button，其次选择文字最少的元素，以减少长段说明文字误命中。</p>
</details>

3. **决定动作：** 接受路径直接点击 accept；拒绝路径依次尝试显式 reject、已知 CMP 拒绝函数，以及进入 settings 后再次寻找 reject。

<details>
<summary>动作规则</summary>
<p>Never-Consent 兜底可调用 OneTrust.RejectAll() 等厂商接口；多层设置页仍按词表查找，所以需要逐项选择的复杂 CMP 是主要失败来源。</p>
</details>

4. **执行点击：** OpenWPM/Firefox 自动化环境对目标 DOM 节点触发点击，或直接调用已知 CMP 的拒绝接口。

<details>
<summary>点击执行</summary>
<p>工具会在页面加载后的 0、10、20 秒最多检测三次，以处理延迟出现的 banner；移动配置仅改变 UA 与视口大小，执行环境不是物理手机。</p>
</details>

5. **记录结果：** 系统保存交互前、检测结果、点击目标和点击后的截图，并以人工核验统计接受与拒绝交互是否成功。

<details>
<summary>关闭判定</summary>
<p>论文报告接受交互准确率超过 97%、拒绝交互准确率 87.4%；拒绝可能来自按钮点击或 CMP 函数，“NOT Accept”仍会被词法规则误点，截图核验也只针对 Cookie banner 交互。</p>
</details>

## 总结

五篇论文里，**Poker** 直接以弹窗检测结果消失统计处置，**WhisperTest** 与 **BannerClick** 真实执行了预设交互但只做各自范围内的弱验证；**VLM-Fuzz** 提供 Android 可访问弹窗的机械遍历子机制；**PopSweeper** 只把纯视觉链做到关闭坐标，尚未在论文实验中验证真实点击后的消失。
