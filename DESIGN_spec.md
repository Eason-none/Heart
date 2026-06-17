# Heart Web App UI/UX 设计语言文档

> **版本：** v1.0  
> **日期：** 2026-05-29  
> **角色：** UI/UX 设计师  
> **用途：** 开发团队直接实现参考，含页面清单 + 组件树 + 交互流程 + 设计决策说明  
> **平台：** 移动端优先 Web App；组件库 TBD

---

## 全局设计规范

| 项目 | 规范值 |
|------|--------|
| 背景色 | `#F7F5F1`（页面底色） |
| 卡片色 | `#F0EDE8` |
| 主文字 | `#2C2A26` |
| 次级文字 | `#888780` |
| 蓝色（信息/目标） | `#185FA5`，浅底 `#E6F1FB` |
| 橙色（提示/中等） | `#BA7517`，浅底 `#FAEEDA` |
| 红色（警告） | `#A32D2D`，浅底 `#FCEBEB` |
| 绿色（完成/达标） | `#1D9E75`，深文字 `#085041` |
| 正文字体 | ≥ 16px，行高 1.6 |
| 触控区域 | ≥ 44pt（高度），宽度铺满容器 |
| 圆角 | 卡片 12pt，按钮 8pt，胶囊标签 16pt |
| 卡片间距 | 页面水平边距 16pt，卡片间距 12pt |
| 动效 | 无复杂动效，状态切换用即时替换，不用滑动/淡入淡出 |

---

## Part 1 — 页面清单与信息架构

### 1.1 Onboarding 系列（无 Tab 归属，首次使用 page 栈）

| page 路径 | 页面目的 | 入口来源 | 离开去向 |
|---|---|---|---|
| `pages/onboarding/welcome` | 价值定位屏：展示五大处方+循证锚点，用户选择身份入口 | 新用户首次打开小程序 | → `pages/onboarding/consent` |
| `pages/onboarding/consent` | 知情同意：四项声明，主动勾选后方可进入评估 | `welcome` | → `pages/assessment/index` |
| `pages/assessment/index` | F3 首次评估问卷（5 组，≤30 题，进度自动保存） | `consent` / 首页 `AssessmentResumeBanner` 续填入口 | → `pages/assessment/summary` |
| `pages/assessment/summary` | 评估摘要分叉：低中危显示「康复计划已生成」，高危显示「先做好准备」 | `assessment/index` 完成提交后 | → `pages/onboarding/guide` |
| `pages/onboarding/guide` | 功能快速引导（3–4 张卡片，低中危以运动为主，高危以营养/助手为主，可跳过） | `assessment/summary` | → `pages/home/index`（Tab 入口） |

### 1.2 主 Tab 页面（底部导航，已定稿）

| page 路径 | 所属 Tab | 页面目的 |
|---|---|---|
| `pages/home/index` | 首页（Tab 1） | 每日科普卡片 + 今日运动提示 + 症状静态提示 + 随访 banner |
| `pages/exercise/index` | 运动（Tab 2） | 四状态运动流（Check-in → 处方展示 → 执行中 → 反馈记录） |
| `pages/nutrition/index` | 营养（Tab 3） | 饮食科普卡片 + 参考页入口 |
| `pages/assistant/index` | 助手（Tab 4） | RAG 驱动聊天助手 + 固定安全提示 |
| `pages/profile/index` | 我（Tab 5） | 用户信息 + 康复进度 + 随访历史 + 设置 |

### 1.3 二级页面（从主 Tab 跳入，无独立底部导航）

| page 路径 | 入口 | 页面目的 |
|---|---|---|
| `pages/exercise/data` | 运动页右上角「查看数据」 | 数据可视化：进度环 / RPE 趋势图 / 心率图 / 时间轴记录 |
| `pages/nutrition/shopping` | 营养页卡片入口 | 食物选购指南（超市场景参考） |
| `pages/nutrition/swap` | 营养页卡片入口 | 中式替代食材对照表（烹饪场景） |
| `pages/followup/index` | 首页 banner / 我页面历史区 | 随访问卷（每周轻量 5 题 / 每月完整扩展题） |
| `pages/profile/update-assessment` | 我页面「更新评估」入口 | 高影响字段重走 F3 相关组（不可直接编辑的字段） |

---

## Part 2 — 组件树

### 2.1 pages/onboarding/welcome

```
pages/onboarding/welcome
├── HeroSection（无状态）
│   ├── AppLogo（无状态）
│   └── HeroTagline（无状态，「心脏康复，从科学运动开始」）
├── ValuePropositionList（无状态）
│   └── PrescriptionItem × 5（无状态，五大处方 + 循证锚点数据）
└── EntryButtonGroup（无状态）
    ├── PrimaryEntryButton（「我已确诊冠心病」，蓝色主按钮，高度 56pt）
    └── SecondaryEntryButton（「我在帮家人了解」，灰色次按钮，高度 56pt）
```

### 2.2 pages/onboarding/consent

```
pages/onboarding/consent
├── ConsentTitle（无状态，「使用前请阅读」）
├── ConsentScrollArea（无状态，可滚动，含四条声明文本）
└── ConsentFooter（有状态）
    ├── ConsentCheckbox（有状态，WeUI Checkbox，主动勾选）
    ├── ConsentLabel（无状态，「我已阅读并同意以上内容」，16px）
    └── StartAssessmentButton（有状态，勾选前置灰，勾选后激活，高度 56pt）
```

### 2.3 pages/assessment/index（F3 评估问卷）

```
pages/assessment/index
├── AssessmentProgressBar（无状态，「第 N 部分 / 共 5 部分」，顶部）
├── GroupTransitionCard（无状态，组间过渡语，非进度提示，进入新组时显示）
├── QuestionGroup（有状态，组内题目容器，管理当前组答题状态）
│   ├── SingleSelectQuestion（无状态，可复用）
│   ├── MultiSelectQuestion（无状态，可复用）
│   ├── NumberInputQuestion（无状态，可复用，含单位标签与合理范围限制）
│   ├── SkippableNumberInput（无状态，可复用，含「可跳过」灰色提示）
│   └── VSAQQuestion（无状态，第四组功能储备专用，活动能力自评量表）
├── QuestionNavButtons（无状态，「上一题」/「下一题」/「下一部分」，高度 56pt）
├── HighRiskWarningModal（有状态，高危三问任意「是」时立即弹出，覆盖全屏）
│   ├── WarningIcon（感叹号，56pt）
│   ├── WarningTitle（「需要先做好准备」，18px 粗体）
│   ├── WarningBody（说明文字，不含「高危」字样）
│   └── ConfirmButton（「我明白了，继续」，蓝色，56pt）
└── CrossGroupBackModal（无状态，跨组后退时触发，WeUI Dialog 样式）
```

### 2.4 pages/assessment/summary（评估摘要）

```
pages/assessment/summary
├── [低中危分支] LowRiskSummary（无状态）
│   ├── SummaryTitle（「你的康复计划已生成」）
│   ├── RiskLabel（通俗表达，不用「低危」「中危」临床术语）
│   ├── InitialPrescriptionCard（无状态，初始强度范围 + 运动类型 + RPE 目标档位）
│   ├── FirstSessionHint（无状态，首次运动建议时间窗）
│   └── ContinueButton（「查看功能引导」，蓝色，56pt）
└── [高危分支] HighRiskSummary（无状态）
    ├── SummaryTitle（「先做好准备」）
    ├── AvailableFeatureList（无状态，列出：营养 / 康复助手 / 科普 / 心理科普）
    ├── ExerciseLockNotice（无状态，说明运动功能暂不可用的原因，不含「高危」）
    └── ContinueButton（「去看看可以做什么」，蓝色，56pt）
```

### 2.5 pages/home/index（首页）

首页采用**三区布局**：上 1/3 科普卡片 / 中 1/3 运动提示 / 下 1/3 症状静态提示+待完成项。

```
pages/home/index
├── AssessmentResumeBanner（有状态，条件显示：评估未完成时置顶，点击→assessment/index续填）
│   └── 文案：「首次评估未完成 · 点击继续填写 →」，橙色横幅，高度 44pt
│
├── [上 1/3] ScienceCardSection
│   └── ScienceCard（有状态，含主题偏好标签区，可复用）
│       ├── CardTag（无状态，小胶囊标签，如「运动知识」）
│       ├── CardTitle（无状态，18px 粗体）
│       ├── CardBody（无状态，16px，最多 4 行，超出折叠）
│       ├── ExpandButton（有状态，「展开」/「收起」，16px 蓝色文字）
│       └── TopicTagSelector（有状态，底部横排 4 个随机主题标签供用户点选）
│
├── [中 1/3] ExerciseTodaySection（条件分支）
│   ├── [运动日] ExerciseDayCard（无状态）
│   │   ├── TodayLabel（「今日运动」，16px 灰）
│   │   ├── ExerciseTypeSummary（无状态，运动类型+时长提示）
│   │   └── ExerciseCTAButton（「去运动 →」，蓝色主按钮，56pt，点击→exercise/index）
│   └── [休息日] RestDayCard（无状态）
│       └── NextExerciseHint（「下次运动建议：明天」，16px 灰色文字，无 CTA 按钮）
│
└── [下 1/3] BottomSection
    ├── SymptomStaticReminder（无状态，固定静态文字）
    │   └── 文案：「如出现胸痛、胸闷、心慌、头晕等不适，请立即停止活动并就医」（16px 灰）
    └── FollowUpBanner（有状态，条件分支）
        ├── [常规] 仅在「我」Tab 图标注入红点，此区域无额外显示
        └── [逾期 3 天] FollowUpPromptBar（无状态，橙色左边框提示条，高度 56pt）
            └── 文案：「本周随访未完成，点击开始 →」，点击→followup/index
```

### 2.6 pages/exercise/index（运动页——四状态状态机）

运动页顶层维护 `exerciseState`，四个状态依次流转，不使用独立 page 跳转。

```
pages/exercise/index（有状态，exerciseState: 'checkin' | 'prescription' | 'active' | 'feedback' | 'summary'）
│
├── ExercisePageHeader（无状态，含「查看数据」右上角入口→exercise/data）
│
├── [高危用户，覆盖所有状态] ExerciseLockState（无状态，可复用）
│
├── [state = 'checkin'] CheckInPanel（有状态）
│   ├── CheckInStepIndicator（无状态，「步骤 1/2」或「步骤 2/2」）
│   ├── [步骤一] SymptomChecklist（无状态，可复用）
│   │   ├── ChecklistTitle（「运动前，请确认以下情况」）
│   │   ├── SymptomItem × 6（无状态，胸痛/胸闷/心慌/头晕/呼吸困难/发热，Checkbox）
│   │   ├── NoneOfAboveOption（无状态，「以上都没有」互斥选项）
│   │   └── [任意勾选] SymptomWarningCard（无状态，可复用，展示后锁定进入下一步）
│   └── [步骤二，仅症状全否后显示] StateAssessment（无状态，可复用）
│       ├── StateAssessmentTitle（「今天的状态怎么样？」）
│       ├── SleepRatingSelector（无状态，三档：好 / 一般 / 很差，整卡选择）
│       └── FatigueRatingSelector（无状态，四档：精力好 / 还可以 / 比较累 / 很累，整卡选择）
│   └── CheckInConfirmButton（有状态，「确认状态，查看处方」，蓝色 56pt，症状全否时可点）
│
├── [state = 'prescription'] PrescriptionSection（无状态）
│   ├── [层2/层3触发时显示] AdjustmentSuggestionCard（有状态，可复用）
│   │   ├── SuggestionText（「根据近期数据，建议降低运动强度 ↓」）
│   │   ├── ViewReasonLink（「查看原因 →」，蓝色文字，点击→展开原因说明区域）
│   │   ├── AcceptButton（「接受调整」，蓝色主按钮，52pt）
│   │   └── KeepCurrentButton（「暂时保持」，灰色文字按钮，44pt）
│   ├── [中危差状态] BadStatePrescriptionCard（无状态）
│   │   ├── BadStateNotice（橙色提示条，「今日状态不佳，以舒缓训练为主」）
│   │   ├── FlexibilityBlock（无状态）
│   │   │   ├── SectionLabel（「柔韧训练 · 10–15 min」）
│   │   │   └── StretchingInstruction（大肌群静态拉伸，10–30 秒 × 4 次，文字+图示）
│   │   ├── BreathingBlock（无状态，PLDB 方案）
│   │   │   ├── SectionLabel（「缩唇膈肌呼吸 PLDB · 10 min」）
│   │   │   ├── BreathingStep（「经鼻吸气 2 秒 → 缩唇呼气 4 秒，约 30 次」）
│   │   │   └── PostureNote（「坐位或仰卧，一手置腹感受膈肌起伏」）
│   │   └── RecordTypeNote（无状态，灰色小字，「本次记录为柔韧训练，不计入有氧打卡」）
│   ├── [正常状态] PrescriptionCard（无状态，可复用）
│   │   ├── ExerciseTypeTag（无状态，如「步行」「居家拉伸」）
│   │   ├── DurationLabel（无状态，「时长：30 分钟」，含热身5分+主体20分+冷身5分说明）
│   │   ├── IntensityLabel（无状态，显示 RPE 四档标签之一，不展示原始 RPE 数值）
│   │   ├── WarmupNote（无状态，热身说明，折叠展示）
│   │   └── CooldownNote（无状态，冷身说明，折叠展示）
│   └── StartExerciseButton（无状态，绿色主按钮，56pt；差状态日文案「开始训练」，正常日「开始运动」）
│
├── [state = 'active'] ActivePanel（有状态）
│   ├── ExerciseTypeLabel（无状态）
│   ├── ExerciseTimer（有状态，分钟:秒 显示，含开始/暂停/完成操作）
│   ├── RPEReminder（无状态，静态提示，「注意感受运动强度」）
│   └── FinishExerciseButton（无状态，「完成运动，记录反馈」，绿色，56pt）
│
├── [state = 'feedback'] FeedbackForm（有状态）
│   ├── FeedbackTitle（「记录本次运动」）
│   ├── RPESelector（无状态，可复用）
│   ├── SymptomMultiSelect（无状态，可复用，运动后不适多选）
│   ├── HRRecoveryInput（有状态，区分手环/无手环路径）
│   │   ├── [手环用户路径] HRRecoveryBadgeSelect（三档：已恢复 / 心率仍偏高 / 未记录跳过）
│   │   └── [无手环路径] HRRecoveryTimeSelect（四档：10分钟内 / 10–30分钟 / 超过30分钟 / 没有特别注意）
│   └── SubmitFeedbackButton（无状态，「提交」，蓝色，56pt）
│
├── [state = 'summary'] SummaryCard（无状态，可复用）
│   ├── ExerciseSummaryBlock（无状态）
│   │   ├── ExerciseTypeLabel（无状态）
│   │   ├── DurationLabel（无状态）
│   │   ├── RPETagLabel（无状态，RPE 档位标签）
│   │   └── CumulativeCountLabel（无状态，「累计第 N 次运动」）
│   ├── [层2触发时显示] AdjustmentNotice（无状态，「下次强度已小幅调整 ↓ [查看原因]」）
│   ├── AITextBlock（有状态）
│   │   ├── [加载中] LoadingPlaceholder（静态「正在生成…」，不用动画）
│   │   ├── [流式输出] StreamingText（逐字显示，16px）
│   │   └── [超时降级] FallbackText（「今日运动记录已保存」，灰色 16px）
│   └── NextSessionBlock（无状态）
│       ├── NextDateLabel（「下次运动建议：明天」）
│       ├── NextTypeLabel（运动类型）
│       └── NextIntensityLabel（RPE 目标档位标签）
│
└── WeeklyPlanSection（无状态，始终可见，运动执行中可滚动至）
    ├── SectionTitle（「本周计划」，16px，`#888780`）
    └── WeeklyPlanItem × N（有状态，默认折叠，点击展开）
        ├── SessionDate（日期，16px，`#2C2A26`）
        ├── ExerciseTypeTag（运动类型胶囊标签，如「有氧」「抗阻」「柔韧」）
        ├── DurationLabel（预计时长，16px 灰色）
        ├── VenueTag（条件显示：需场地或器械时展示橙色胶囊「需场地」/「需器械」；居家运动不展示）
        └── [展开后] PrescriptionDetailBlock（当次处方细节，内容同 PrescriptionCard，复用样式）
```

### 2.7 pages/exercise/data（数据可视化页）

```
pages/exercise/data（有状态，activeTab: 'recent2w' | 'recent1m' | 'all'，Tab 切换驱动全页重算）
├── TimeRangeTabBar（有状态，三档 Tab：近2周 / 近1个月 / 全程）
│
├── OverviewSection（无状态，数据随 activeTab 变化）
│   ├── ProgressRing（无状态，可复用，SVG 弧形进度环）
│   ├── MonthComparisonLabel（无状态，与上月对比，如「↑ 2 次」）
│   └── AvgDurationLabel（无状态，「平均时长：N 分钟」）
│
├── RPETrendChart（无状态，可复用，SVG 折线图，数据随 activeTab 变化）
│
├── HeartRateChart（无状态，可复用，仅手环用户可见）
│   └── WearableTag（无状态，右上角「来自手环」灰色小标签）
│
└── ExerciseTimeline（无状态，时间轴记录列表，数据随 activeTab 变化）
    └── ExerciseTimelineItem × N（无状态，可复用）
        ├── TimelineDot（无状态，颜色匹配 RPE 档位）
        ├── ExerciseDateLabel（无状态）
        ├── ExerciseTypeLabel（无状态）
        ├── DurationLabel（无状态）
        ├── RPETagLabel（无状态）
        └── AdjustmentBadge（条件显示，「强度已调整」小标记）
```

### 2.8 pages/nutrition/index（营养页）

```
pages/nutrition/index
├── NutritionScienceCard（无状态，按阶段推送的饮食科普卡片，同 ScienceCard 结构）
├── ShoppingGuideEntry（无状态，入口卡片→pages/nutrition/shopping，高度 56pt）
└── FoodSwapEntry（无状态，入口卡片→pages/nutrition/swap，高度 56pt）
```

### 2.9 pages/assistant/index（助手页）

助手后端将用户问题分为四类意图，UI 层根据意图类型决定是否展示免责声明。意图分类规则如下：

| 意图标识 | 触发条件 | UI 行为 |
|---|---|---|
| `Intent_General`（通用知识） | 问题与心脏康复知识相关，无个人化诉求（如「为什么要运动？」） | 正常展示回复，无附加声明 |
| `Intent_Personalized`（个性化范围查询） | 用户询问适合自己的运动频率/强度范围（如「我每天可以走多远？」） | 回复末尾附 `SafetyFootnote`（灰色免责声明） |
| `Intent_Symptom`（症状/安全相关） | 涉及身体不适或安全判断（如「我昨天胸闷，今天能运动吗？」） | 回复为固定就医建议文案，不给能/不能运动的结论，不展示 `SafetyFootnote`（已是纯软阻断） |
| `Intent_PrescriptionSpecific`（处方级具体问题） | 用户问具体处方数字（速度 / 时长 / 组数等，如「我应该走多快？」） | 回复为引导文案（告知可查运动页 + 可继续问知识），**不附** `SafetyFootnote`；多轮追问升级后回复为单句引导，同样不附 `SafetyFootnote` |
| `Intent_OutOfScope`（超出知识库） | 不属于 12 个健康教育主题（如「我的支架还有多少年寿命？」） | 回复固定文案「本模块服务于健康教育和知识科普，不侧重于解答具体问题」 |

高危用户发送运动相关问题时，后端将意图识别为 `Intent_Personalized`，但回复内容替换为软阻断文案：「您目前的情况建议在医生明确允许并有专业监护的前提下再开始康复运动。」`SafetyFootnote` 照常展示。

```
pages/assistant/index
├── SafetyBanner（无状态，顶部固定静态安全提示）
│   └── 文案：「如出现胸痛、胸闷、心慌、头晕等不适，请立即就医」（16px 橙色背景条）
├── ChatHistory（有状态，消息列表，可滚动）
│   ├── [首次进入空状态] WelcomeGuide（无状态）
│   │   ├── WelcomeText（「你好，我是你的心脏康复助手」）
│   │   └── SuggestedQuestion × 3（无状态，点击预填输入框，如「运动后为什么要记录感受？」）
│   ├── UserMessage（无状态，右侧气泡，暖灰背景）
│   └── AssistantMessage（无状态，左侧气泡，白色背景）
│       ├── MessageText（无状态，16px，流式输出）
│       └── SafetyFootnote（无状态，仅 Intent_Personalized 时展示）
│           └── 文案：「以上为参考范围，请根据自身感受动态调整，有不适及时就医」（14px 灰色）
└── InputArea（有状态，底部固定）
    ├── MessageInput（有状态，WeUI Textarea，placeholder「向助手提问…」）
    └── SendButton（有状态，「发送」，蓝色，44pt，无内容时置灰）
```

### 2.10 pages/profile/index（我的页面）

```
pages/profile/index
├── UserInfoSection（无状态）
│   ├── UserAvatar（无状态，微信头像）
│   ├── UserNickname（无状态，微信昵称）
│   ├── RiskLevelLabel（无状态，通俗表达危险分层）
│   └── UpdateAssessmentEntry（无状态，「更新评估」→pages/profile/update-assessment）
│
├── RehabProgressSection（无状态）
│   ├── StageLabel（无状态，「当前阶段：适应期 / 改善期 / 维持期」）
│   ├── TotalCountLabel（无状态，「累计运动 N 次」）
│   └── MilestoneCardRow（无状态，横向排列三个里程碑卡片，MilestoneCard 组件）
│       ├── MilestoneCard（第 12 次，条件解锁）
│       ├── MilestoneCard（第 18 次，条件解锁）
│       └── MilestoneCard（第 90 天，条件解锁，特殊样式）
│
├── FollowUpHistorySection（无状态，只读时间轴）
│   ├── SectionTitle（「随访记录」）
│   ├── [有记录] FollowUpTimeline（无状态，时间轴列表）
│   │   └── FollowUpItem × N（无状态，日期+随访类型+摘要，只读）
│   └── [空状态] EmptyFollowUpHint（无状态，「暂无随访记录」灰色文字）
│
└── SettingsSection（无状态）
    ├── OnboardingGuideReplayEntry（「重看功能引导」→pages/onboarding/guide）
    ├── TopicPreferenceEditorEntry（「内容偏好」→内联多选弹窗，8 个主题全选）
    ├── AboutEntry（「关于 Heart」→静态说明页）
    └── PrivacyEntry（「隐私说明」→静态说明页）
```

### 2.11 pages/followup/index（随访问卷）

每周轻量随访与每月完整随访使用同一 page，通过 `followupType: 'weekly' | 'monthly'` 参数控制渲染题目集合。两套题目差异如下：

**每周轻量随访（基础 5 题，约 2 分钟）**

| # | 题目 | 类型 | 必填 |
|---|---|---|---|
| W1 | 本周运动了几次？ | 单选（0 / 1 / 2 / 3 / 4 次及以上） | 是 |
| W2 | 运动时或运动后有没有出现不适（胸痛/胸闷/心慌/头晕/呼吸困难）？ | 多选（各症状 + 没有不适） | 是 |
| W3 | 这周睡眠整体怎么样？ | 单选（好 / 一般 / 很差） | 是 |
| W4 | 这周情绪整体怎么样？ | 单选（还不错 / 还可以 / 比较低落） | 是 |
| W5 | 这周有没有便秘的困扰？ | 单选（没有 / 偶尔 / 比较明显） | 是 |

**慢病额外题（叠加在 W5 之后，按用户档案标签触发）**

| 触发条件 | 题目 | 类型 |
|---|---|---|
| 合并高血压 | 本周自测血压大概是多少（收缩压/舒张压）？ | 数字输入，可跳过 |
| 合并高血脂 | 本周有没有漏服降脂药？ | 单选（没有 / 偶尔漏服 / 经常漏服） |

**每月完整随访（在每周 5 题基础上增加以下题目，约 5 分钟）**

| # | 题目 | 类型 | 必填 |
|---|---|---|---|
| M1 | 本月体重大约是多少？ | 数字输入（kg），可跳过 | 否 |
| M2 | 本月腰围大约是多少？ | 数字输入（cm），可跳过 | 否 |
| M3 | 本月有没有新的身体症状，或者去医院复诊？ | 单选（没有 / 有新症状未就医 / 已就医） | 是 |
| M4 | VSAQ 运动能力复测（能完成的最高强度活动）| 单选，活动列表同首次评估第四组，复用 VSAQQuestion | 是 |
| M5 | 椅子站立测试：30 秒内能站起来几次？ | 数字输入 | 否 |

**中危用户月度额外题**

| 触发条件 | 题目 | 类型 |
|---|---|---|
| 危险分层=中危 | 本月有没有联系或复诊主治医生？ | 单选（是 / 否 / 计划中） |

```
pages/followup/index（有状态，followupType: 'weekly' | 'monthly'）
├── FollowUpTypeHeader（无状态）
│   ├── TypeLabel（「每周随访」或「每月完整随访」，18px 粗体）
│   └── EstimatedTimeLabel（「预计约 2 分钟」或「预计约 5 分钟」，14px 灰色）
│
├── [followupType = 'weekly'] WeeklyQuestionSet（有状态）
│   ├── ExerciseCountQuestion（单选，W1）
│   ├── SymptomMultiSelect（无状态，可复用，W2，复用 FeedbackForm 同组件）
│   ├── SleepRatingQuestion（单选，W3，复用 StateAssessment 同组件）
│   ├── MoodRatingQuestion（单选，W4）
│   ├── ConstipationQuestion（单选，W5）
│   ├── [高血压标签] BloodPressureInput（可跳过，含收缩压/舒张压双输入）
│   └── [高血脂标签] MedicationAdherenceQuestion（单选）
│
├── [followupType = 'monthly'] MonthlyQuestionSet（有状态）
│   ├── WeeklyQuestionSet（嵌套复用，同上全套 weekly 题）
│   ├── WeightInput（数字输入，M1，可跳过）
│   ├── WaistInput（数字输入，M2，可跳过）
│   ├── NewSymptomQuestion（单选，M3）
│   ├── VSAQQuestion（单选，M4，复用首次评估组件）
│   ├── ChairStandInput（数字输入，M5，可跳过）
│   └── [中危用户] DoctorContactQuestion（单选）
│
└── SubmitFollowUpButton（无状态，「提交随访」，蓝色，56pt）
```

**PHQ-9/GAD-7（月度随访，心理评分专用）**

月度随访中 PHQ-9（9 题）和 GAD-7（7 题）在 WeeklyQuestionSet 的 W4「情绪」题回答为「比较低落」时展开，或在注册后第 7 天首次随访时必填。组件复用 SingleSelectQuestion（0–3 分 Likert 量表），题目集合由后端根据随访类型注入，UI 层不硬编码题目文本。

评分响应规则（后端计算，UI 根据评分等级展示不同反馈卡）：

| 评分 | PHQ-9 / GAD-7 | UI 响应 |
|---|---|---|
| 正常 | PHQ-9 < 5 且 GAD-7 < 5 | 正常鼓励文案，无特殊处理 |
| 轻中度 | PHQ-9 5–14 或 GAD-7 5–14 | 提交后展示心理健康科普引导卡，中度（10–14）额外显示「如状态持续，建议与医生或心理咨询师沟通」 |
| 重度 | PHQ-9 ≥ 15 或 GAD-7 ≥ 15 | 提交后展示重度响应卡，暂停运动功能（exercise/index 展示 ExerciseLockState 变体），明确建议就诊 |

### 2.12 pages/profile/update-assessment（更新评估）

此页面只允许修改部分字段，字段按可编辑权限分为两类：

**低影响字段（可直接编辑，在此页完成）**

| 字段 | 组件类型 | 说明 |
|---|---|---|
| 身高 / 体重 / 腰围 | NumberInputQuestion | 即时校验合理范围 |
| 吸烟状态 | SingleSelectQuestion（戒烟 / 吸烟 / 不吸烟） | |
| 合并慢病标签 | MultiSelectQuestion（高血压/糖尿病/高血脂/高尿酸/都没有） | |

**高影响字段（不可直接编辑，需重走 F3 相关组）**

| 字段 | 说明 | 重走路径 |
|---|---|---|
| 诊断类型 / 手术距今月数 | 影响运动处方计算 | 重走 F3 第一组 |
| LVEF / 高危三问 | 影响危险分层 | 重走 F3 第二组 |
| VSAQ 功能储备 | 影响处方初始强度 | 重走 F3 第四组 |

高影响字段入口展示为只读行（灰色 + 锁定图标），点击时弹出确认框「修改此项需要重新填写相关问题，是否继续？」，确认后进入对应 F3 组。重走某一组完成后，返回此页面（不重走全部 5 组）。

```
pages/profile/update-assessment
├── PageTitle（无状态，「更新个人信息」）
├── EditableFieldSection（无状态，低影响字段区，标题「可直接修改」）
│   ├── HeightWeightWaistInputGroup（有状态，三个数字输入并排）
│   │   ├── NumberInputQuestion（身高，cm）
│   │   ├── NumberInputQuestion（体重，kg）
│   │   └── NumberInputQuestion（腰围，cm）
│   ├── SmokingStatusQuestion（无状态，单选，复用 SingleSelectQuestion）
│   └── ComorbidityMultiSelect（无状态，多选，复用 MultiSelectQuestion）
│
├── LockedFieldSection（无状态，高影响字段区，标题「修改以下项目需重新填写相关问题」）
│   ├── LockedFieldRow（无状态，可复用）× 3
│   │   ├── FieldLabel（字段名，16px）
│   │   ├── CurrentValueLabel（当前值，灰色）
│   │   └── LockIcon + EditEntryButton（点击→弹确认框）
│   │   ─── [诊断类型/手术月数] → 重走 F3 第一组
│   │   ─── [LVEF/高危三问] → 重走 F3 第二组
│   │   └── [VSAQ] → 重走 F3 第四组
│
├── ReassessmentConfirmModal（有状态，点击高影响字段 EditEntryButton 时弹出）
│   ├── ModalTitle（「需要重新填写相关问题」）
│   ├── ModalBody（说明修改此项会触发哪一组重填，16px）
│   └── ModalButtons（「取消」灰色 / 「继续」蓝色）
│
└── SaveChangesButton（有状态，「保存修改」，蓝色，56pt，仅低影响字段有改动时激活）
```

**注意：** 重走某 F3 组时，由 `pages/assessment/index` 接受 `groupIndex` 参数进入对应组，完成后通过 `wx.navigateBack` 返回此页面（不是重走全部 5 组，不重新触发危险分层计算，除非高危三问或 PHQ 组有改动）。高危三问或第五组 PHQ 改动后，需重新触发危险分层逻辑。

---

## Part 2 附 — Heart 特有 9 个组件设计规格

### RPESelector

四档强度选择器，用于反馈记录页（FeedbackForm）。

**布局：** 四张选项卡竖排，每卡宽度 100%，高度 ≥ 56pt，间距 8pt。

**视觉规则：**
- 「适中（RPE 12–14）」——默认高亮，视觉权重最高：
  - 边框 2px，颜色 `#185FA5`
  - 卡片背景 `#E6F1FB`
  - 右侧「✓ 目标区间」小徽章（蓝色胶囊，12px）
  - 文字颜色 `#185FA5`
- 其他三档（未选中）：
  - 背景 `#F0EDE8`，边框 1px `#C8C5BE`
  - 文字颜色 `#2C2A26`
  - 无特殊标记
- 其他三档（用户选中后）：
  - 背景 `#F0EDE8`，边框 2px `#2C2A26`（加深，非蓝色）
  - 无「目标区间」标记（视觉权重仍低于「适中」被选中态）

**文字格式（每卡）：**
```
轻松               还能再做 6+ 次
适中  ✓ 目标区间   还能再做 3–5 次
较累               还能再做 1–2 次
很累               几乎无法再做
```

**交互：** 整卡可点击选中，不用 Radio 组件（减少认知负担）。

---

### SymptomWarningCard

Check-in 症状筛查勾选任意症状时展示，锁定当日运动。

**布局：** 卡片，左侧 4px 红色竖线（`#A32D2D`），背景 `#FCEBEB`，圆角 12pt。

**内部结构：**
- 顶部：圆圈感叹号图标（24pt，`#A32D2D`）+ 粗体标题「今日建议停止运动」（18px，`#A32D2D`）
- 正文（16px，`#2C2A26`）：「您勾选了 [症状名]，建议今日休息。如症状持续或加重，请及时就医。」
- 底部：「我知道了」按钮（灰色文字按钮，44pt，非红色——降低焦虑感）

**状态：** 卡片展示后，Check-in 「确认状态」按钮消失，不可进入处方页。整个运动 Tab 区域下方灰色静态提示「明天进入运动页时，将询问您的状态是否已缓解」。

---

### ExerciseLockState

高危用户进入运动 Tab 时，替代正常运动流，覆盖全页。

**布局：** 居中纵向排列，上下留白各 48pt。

**内部结构：**
- 锁定图标（WeUI 或自绘，56pt，颜色 `#888780`）
- 主文案（18px 粗体，`#2C2A26`）：「运动功能暂时不可用」
- 副文案（16px，`#888780`）：「等获得医生明确许可后，此功能将为你解锁。」
- 分隔线
- 列表标题（16px，`#888780`）：「目前你可以：」
  - ✓ 查看每日科普（首页）
  - ✓ 学习饮食知识（营养）
  - ✓ 向康复助手提问（助手）

**注意：** 全页不出现「高危」字样。

---

### ScienceCard

首页上 1/3 每日科普卡片，含主题偏好标签交互。

**布局：** 全宽卡片，背景 `#F0EDE8`，圆角 12pt，内边距 16pt。

**内部结构：**
- 顶部：小胶囊主题标签（如「运动知识」，蓝色底白字，12px）
- 标题：18px 粗体，`#2C2A26`
- 正文：16px，`#2C2A26`，行高 1.6，默认显示 4 行，超出显示「展开 ↓」（蓝色文字按钮）
- 底部主题偏好标签区（距离上次选择 < 3 天时隐藏）：
  - 提示文字「你对哪个话题感兴趣？」（14px 灰）
  - 横排 4 个主题标签（从 8 个主题中随机展示）
  - 标签样式：暖灰底 `#F0EDE8` + 灰色文字，触控高度 ≥ 36pt
  - 用户点选 1 个后：该标签短暂变蓝（即时态反馈）→ 标签区整体消失

---

### MilestoneCard

「我」页面康复进度区里程碑展示，纪念章风格。

**布局：** 横排三个卡片，每卡宽度约 104pt，高度 120pt，圆角 12pt。

**视觉风格：**
- 已解锁：圆形内框（线描，2px 边框，颜色 `#BA7517` 橙金）+ 内部数字/汉字
  - 内圈：大数字（「12」「18」「90」，24px 粗体，`#BA7517`）
  - 下方：汉字标注（「次·适应期」，12px，`#BA7517`）
  - 卡片底部：一句激励文案（14px，`#2C2A26`，如「坚持的力量」）
- 未解锁：圆形内框（虚线，灰色 `#C8C5BE`）+ 数字灰色 + 底部「-」占位

**第 90 天特殊样式：** 同风格但边框颜色用 `#185FA5` 蓝色，文案为「90天·维持期」，激励文案专属。

---

### RPETrendChart

数据可视化页 RPE 趋势折线图，固定 4 档坐标系。

**规格：** SVG，宽 335pt，高 130pt。

**坐标系：**
- Y 轴：固定 4 档，从下到上依次为「轻松 / 适中 / 较累 / 很累」，均匀分布（不显示原始 RPE 数字）
- Y 轴格线：4 条横格线，对应 4 档刻度（修复问题一：使用固定高度映射，非 `v / 4.5 * ch` 计算）
- X 轴：按时间排列数据点，标注日期（近2周精确到日，近1个月精确到周，全程精确到月）

**数据点：** 圆圈，直径 12pt，颜色对应 RPE 档位：
- 轻松 → `#1D9E75` 绿色
- 适中 → `#185FA5` 蓝色
- 较累 → `#BA7517` 橙色
- 很累 → `#A32D2D` 红色

**目标区间背景带：** 「适中」档位对应高度区间，蓝色半透明矩形（`#E6F1FB`，不透明度 60%）。

**Tab 切换行为：** 切换时间范围后，重新计算当前范围内的数据点并重绘，坐标系宽度自适应数据点数量（修复问题四）。

---

### HeartRateChart

数据可视化页静息心率折线图，仅手环用户可见。

**规格：** SVG，宽 335pt，高 100pt。

**坐标系：**
- Y 轴动态范围计算（修复问题三）：
  - `yMin = Math.floor(Math.min(...hrData) - 5)`
  - `yMax = Math.ceil(Math.max(...hrData) + 5)`
  - 确保显示范围 ≥ 10 bpm（若 `yMax - yMin < 10`，强制扩展至 10）
  - Y 轴标签：最小值 / 中间值 / 最大值，三档，取整数
- X 轴：同 RPETrendChart

**线条：** 紫色 `#534AB7`，圆形数据点，直径 8pt。

**附加元素：** 右上角「来自手环」灰色小标签（14px，背景 `#F0EDE8`，圆角 8pt）。

**Tab 切换行为：** 根据当前时间范围的 HR 数据重新计算 yMin / yMax，重绘（修复问题四）。

---

### ProgressRing

数据可视化页月度完成进度环。

**规格：** SVG，130×130pt，中心圆弧 radius 48，线宽 12pt。

**颜色：** 完成弧 `#1D9E75`，背景弧 `#B4B2A9`。

**中心文字：**
- 已完成次数：24px 粗体，`#2C2A26`
- 「/ 目标 N 次」：14px，`#888780`

**Tab 切换行为：** 分子（完成次数）和分母（该时间范围目标次数）均随 activeTab 重算（修复问题四）：
- 近2周：分母 = 近2周应完成次数（约 6 次）
- 近1个月：分母 = 近1个月目标（约 12 次）
- 全程：分母 = 总目标次数

---

### FollowUpBanner

随访提醒，两档触发。

**档位一（常规提醒）：**
- 表现：「我」Tab 图标右上角小红点（8pt 红点 `#A32D2D`，WeUI badge 样式）
- 首页内容区无额外展示

**档位二（逾期 3 天升级提醒）：**
- 位置：首页下 1/3 区域（SymptomStaticReminder 上方）
- 样式：背景 `#FAEEDA`，左边框 4px `#BA7517`，高度 56pt，全行可点击
- 文案：「本周随访未完成，点击开始 →」（16px，`#2C2A26`）
- 点击：→ `pages/followup/index`
- 消失：随访提交成功后立即消失（无延迟，无动效）

---

## Part 3 — 交互流程

### 3.1 主流程（Happy Path）：首次使用 → 第一次运动完成

**Step 1 — Onboarding（约 1 分钟）**
1. 用户打开小程序，看到价值定位屏（五大处方 + 数据锚点）
2. 点击「我已确诊冠心病」→ 进入知情同意页
3. 滚动至底部，勾选「我已阅读并同意」→ 「开始评估」按钮激活
4. 点击进入 F3 评估问卷

**Step 2 — F3 评估问卷（约 8 分钟）**
1. 第一组：基本信息（年龄、性别、身高体重腰围、诊断类型、手术距今月数）
2. 组间过渡语卡片（温和说明下一组内容，非进度条）
3. 第二组：心脏功能（静息心率可跳过、LVEF 两步问法、**高危三问**）
   - 高危三问全答「否」→ 继续
   - 任意答「是」→ 立即弹出 `HighRiskWarningModal`，确认后切入高危路径
4. 第三组：慢病与用药（合并症多选、β 受体阻滞剂）
5. 第四组：功能储备（VSAQ 简化版）
6. 第五组：心理基线快筛（PHQ-2 + GAD-2，共 4 题）
7. 提交 → 系统计算危险分层（loading 1–2s，「正在生成你的康复计划…」占位）
8. 进入评估摘要页（低中危分支）→ 快速引导 → 首页

**Step 3 — 首次进入首页**
- 科普卡片（事件触发卡，第一次进入专属内容）
- 今日运动提示区：显示「今日可以运动」+ 「去运动 →」CTA
- 点击 → 进入运动 Tab（Check-in 状态）

**Step 4 — 日常运动会话（约 35–40 分钟）**
1. Check-in 步骤一：症状筛查（全选「以上都没有」）→ 进入步骤二
2. Check-in 步骤二：睡眠选「好」，疲劳选「精力好」→ 点击「确认状态，查看处方」
3. 处方展示页：查看运动类型/时长/RPE 目标标签 → 点击「开始运动」
4. 执行中：计时器开始，用户自主完成 → 点击「完成运动，记录反馈」
5. 反馈记录：选择 RPE（如选「适中」）→ 症状「没有不适」→ 心率恢复「10 分钟内」→ 点击「提交」
6. 提交按钮变灰「提交中…」（约 0.5s）→ 进入 SummaryCard
7. SummaryCard：显示运动摘要 → AITextBlock 流式输出 AI 文案 → 下次运动建议

---

### 3.2 Loading 状态设计

**AI 流式文案加载（反馈提交后）：**
- 触发：用户点击「提交」按钮
- 阶段一（0–0.5s）：按钮置灰「提交中…」，防止重复提交
- 阶段二（0.5s 后）：页面切换至 SummaryCard，运动摘要和下次建议立即展示（规则引擎提供）
- AITextBlock 状态：
  - 正在生成中：「✦ 正在生成…」灰色文字（静态，无动画，不显示空白区域）
  - 流式输出：文字逐段出现，速度约 30 字/秒，不使用打字动效（减少认知负担）
  - 5s 超时：替换为「今日运动记录已保存。」灰色文字，不展示空白，不展示错误提示

**F3 评估提交 loading：**
- 全屏 loading 覆盖（WeUI LoadingPage），文案「正在生成你的康复计划…」
- 进度不可见，避免用户对 1–2s 等待感到焦虑
- 完成后直接跳转摘要页

---

### 3.3 空状态设计

| 场景 | 空状态设计 |
|---|---|
| 数据可视化页（无运动记录） | 图表区域显示灰色空状态插图 + 「完成第一次运动后，数据将显示在这里」（16px 灰色） |
| 随访历史为空（我页面） | 「暂无随访记录」灰色文字，居中显示 |
| 助手首次进入 | 欢迎语「你好，我是你的心脏康复助手」+ 3 个建议问题气泡，点击任意一个预填输入框 |
| 营养 Tab | 无空状态，内容池有默认内容，始终有卡片展示 |
| 里程碑未解锁 | MilestoneCard 灰色虚线状态，不显示数字和文案 |

---

### 3.4 错误与异常状态

**AI 调用超时（US-08 降级）：**
- SummaryCard 中 AITextBlock 降级为「今日运动记录已保存。」
- 运动摘要、下次建议、强度调整提示（若触发）均由规则引擎提供，正常显示
- 不显示错误 toast，不显示「加载失败」，不显示重试按钮

**网络断开时离线查看处方：**
- 运动处方内容（运动类型、时长、强度标签）在首次生成时写入本地缓存
- 断网状态下进入处方展示页：正常展示缓存内容，页面顶部显示灰色横幅「离线模式，数据来自上次同步」
- 反馈提交按钮保留，提交时提示「网络不可用，稍后将自动同步」，本地先行记录
- 助手页、AI 文案：显示「当前网络不可用，请稍后重试」，不显示空白

**症状锁定后次日解锁询问：**
- 次日用户进入运动 Tab，Check-in 步骤一替换为询问卡：「昨天的不适感是否已缓解？」
- 「已缓解」→ 进入正常 Check-in 流程（重新筛查，不跳过步骤一）
- 「仍有不适」→ 展示 SymptomWarningCard，维持锁定，文案「建议继续休息，如有需要请就医」

---

### 3.5 表单校验（F3 评估问卷）

**校验时机：** 仅在点击「下一题」或「下一组」时触发，不做实时校验（减少输入打断）。

**必填项校验反馈：**
- 未填写：题目底部出现红色提示文字「此项必填」，页面自动滚动至该题（不弹 toast）
- 不通过时「下一题」按钮不响应，不换页

**数字输入特殊规则：**
- 即时范围限制：超出合理范围（如年龄 > 120）时，输入框边框变红，提示「请输入合理数值」
- 允许后续校验，不阻断用户输入

**可跳过字段处理（静息心率/血压/LVEF）：**
- 题目底部固定显示「可跳过」灰色文字
- 无必填校验，留空可直接进入下一题
- LVEF 两步问法：先问「医生有没有提过心脏泵血功能比较弱？」→「是」才展示数值输入框，数值输入框含「等我问医生」选项作为替代答案

---

### 3.6 特殊交互

**F3 跨组后退确认弹窗：**
- 触发条件：用户在当前组第一题点击「上一题」（即试图跨组后退）
- 弹窗组件：`CrossGroupBackModal`，WeUI Dialog 样式
  - 标题：「返回上一部分」
  - 内容：「返回上一部分会清空当前部分的填写，确认吗？」
  - 按钮：「取消」（左，灰色）/ 「确认」（右，蓝色）
- 确认后：清空当前组所有答案，回到上一组第一题
- 组内（非跨组）自由后退：不触发弹窗，直接回上一题，已填答案保留

**强度调整建议的接受/拒绝交互：**
- 卡片位置：处方展示页顶部，PrescriptionCard 上方
- 展开说明：点击「查看原因」→ 当前卡片内展开详细说明区域（如「近 3 次运动中有 2 次 RPE 较高」），不跳转新页
- 接受调整：
  - 按钮文案变灰「已接受」，卡片收起
  - PrescriptionCard 内容同步更新（强度标签/时长变化）
  - 调整记录写入历史
- 暂时保持：
  - 卡片收起，处方内容不变
  - 系统记录「用户选择维持」，不再在本次会话中重复提示

**运动页四状态流转的状态保持（Tab 切换）：**
- 用户在运动页任意状态切换至其他 Tab 再返回：页面恢复到离开时的状态
- 实现机制：运动会话状态（`exerciseState` + 当前数据）写入小程序 `globalData` 或 `storage`，`onShow` 时恢复
- 执行中（计时器运行）切 Tab 后：
  - 计时器数值继续计时（后台 `setInterval` 或记录离开时间戳）
  - 返回时显示「已暂停 N 分钟」，不强制重置计时
- 特殊：SummaryCard 展示后，再次切 Tab 回来仍显示 SummaryCard（不重置至 Check-in）

**β 受体阻滞剂用户特殊路径：**
- 处方展示页：不显示「靶心率区间」相关内容
- 反馈记录页 HRRecoveryInput：展示但数据仅记录，不参与层 2 降档判断（交互层面无差异，逻辑层区分）
- 强度调整说明（AdjustmentSuggestionCard）：文案中不引用心率数据

---

## Part 4 — 设计决策说明

### 决策 1：运动页使用单页状态机而非多 page 跳转

**问题：** 运动会话涉及四个连续状态（Check-in → 处方 → 执行 → 反馈），每个状态需要用户操作，状态间存在强依赖（症状筛查结果影响处方内容）。

**方案选择：单页四状态状态机**

**理由：**
1. **状态保持**：微信小程序 page 栈切换 Tab 后，原 Tab 的 page 实例保留（`onHide`/`onShow`），但若用多 page 跳转（`wx.navigateTo`），用户切 Tab 再返回时会回到栈顶 page，中间 page 的状态可能丢失。单页状态机只需在 `globalData` 中持久化一个状态枚举，`onShow` 时恢复。
2. **流程完整性**：四状态是一次不可拆分的运动会话。用户若中途退出再回来，状态机可精确恢复到上次离开位置；多 page 方案需要各 page 独立实现状态恢复，复杂度高。
3. **导航栈清洁**：四状态流转不产生 page 栈堆叠，用户点击右上角「返回」不会意外退出到中间状态页。

**取舍：** 单页代码量较大（需在一个 page 内管理所有状态的 UI 切换），通过 `wx:if` / 组件条件渲染控制，可接受。

---

### 决策 2：医疗警告 UI 的视觉权重控制

**问题：** 症状警告需要有足够视觉权重让用户停止运动，但心脏病患者对「红色警告」可能产生过度焦虑（焦虑本身加剧心脏负担）。

**方案：** 左侧红色竖线 + 浅红背景（非全屏红色）

**理由：**
1. **颜色编码保留功能性**：红色（`#A32D2D`/`#FCEBEB`）是通用的「停止/注意」语义，不改变颜色编码可维持直觉识别。
2. **强度降级**：全红背景 → 浅红（`#FCEBEB`）背景 + 左侧竖线，视觉权重「警告但不恐慌」。研究显示，老年心脏病患者对鲜红大面积色块的心率应激反应更强。
3. **文案陈述性**：「建议今日停止运动」（陈述）而非「请立即停止！」（命令），降低紧张感。
4. **操作按钮灰色**：「我知道了」用灰色而非红色，避免强烈 CTA 色彩加强紧张情绪。

**取舍：** 视觉权重不如全红卡强烈，但对目标用户群（40–70 岁心脏病患者）更为适宜。

---

### 决策 3：高危用户运动锁定的文案框架

**竞选方案：**
- 方案 A：「此功能目前不适合您」——终止感太强，无行动路径
- 方案 B：「请先联系医生」——指令性，但没说明为什么/解锁条件
- **方案 C（选用）**：「等获得医生明确许可后，此功能将为你解锁」——给用户清晰的解锁路径和可逆感

**选用理由：**
1. **不使用「高危」字样**（spec 明确要求）：文案回避临床术语，避免用户产生标签化焦虑。
2. **「将为你解锁」暗示可逆**：用户知道这是临时状态，不是永久封锁，降低放弃感。
3. **给行动路径**：用户知道应该做什么（获得医生许可），而非面对死路。
4. **列出可访问功能**：让用户立刻发现价值（营养/助手/科普），不产生「安装了没用」的挫败感。

---

### 决策 4：RPE 四档选择器的视觉区分设计

**核心问题：** 需要同时表达两件事：① 哪个档位是「目标」（适中），② 用户当前选择了哪个档位。两者可能不一致（用户选了「较累」）。

**方案：** 三级视觉权重

| 状态 | 视觉表现 |
|---|---|
| 「适中」未选中 | 蓝色边框 + 蓝色浅底 + 「✓ 目标区间」徽章（最高静态权重） |
| 「适中」被选中 | 同上 + 加深边框（与静态态相比更明显） |
| 其他档位未选中 | 暖灰底 + 灰色边框（低权重） |
| 其他档位被选中 | 暖灰底 + **深色**边框（高于未选中，低于「适中」任何状态） |

**设计原则：**
- 「适中」的目标标记（蓝色）在任何情况下都不消失，始终提醒用户目标区间
- 用户选中「很累」时，「很累」卡片有明显选中态，但蓝色目标标记始终留在「适中」卡上，形成「你选了这个，但目标是那个」的直觉感知
- 不用 Radio 组件原生样式（对 40–70 岁用户圆点 UI 认知负担高）

---

### 决策 5：数据可视化 Tab 切换与概览数字联动（修复 4 处已知问题）

**问题来源（cardiac_rehab_final.html 已知问题）：**

| # | 原问题 | 修复方案 |
|---|---|---|
| 问题一 | RPE Y 轴使用 `v / 4.5 * ch` 计算，导致档位高度不等距，格线与数据点错位 | 改为固定 4 档等分高度映射：`chartH / 4 * (档位索引)`，格线锚定档位坐标 |
| 问题二 | 时间轴竖线用 `absolute` 定位 `top:6px;bottom:6px`，记录多时竖线不到底 | 改为父容器 `border-left: 2px solid #C8C5BE`，高度随内容自动撑开 |
| 问题三 | HR 图 Y 轴计算 `[hrMin+1, midVal, hrMax-1]`，数据集中时范围极窄，难以辨别 | `yMin = floor(min - 5)`, `yMax = ceil(max + 5)`，强制范围 ≥ 10bpm |
| 问题四 | Tab 切换后只过滤了记录列表，进度环分子分母、图表数据未重算，显示失实 | Tab `onChange` 回调中统一触发 `recalculateTabData()`，重算：完成次数、目标次数、平均时长、RPE 数据点数组、HR 数据点数组及 Y 轴范围，再统一重渲染 |

**Tab 数据分组规则：**
- 近2周：取最近 14 天内的运动记录
- 近1个月：取最近 30 天内的运动记录
- 全程：取所有运动记录（注册至今）

**进度环分母定义：**
- 近2周：该2周内运动处方建议次数（约 6 次，按频率计算）
- 近1个月：该月运动处方建议次数（约 12 次）
- 全程：累计总目标次数（按每周 3 次从注册日起计算）

---

## 质量门自检

- [x] 覆盖所有 P0 功能对应页面（F0 Onboarding / F3 评估 / F2 运动 / F1a 科普 / F1b 助手）
- [x] 高危用户降级视图有独立说明（HighRiskSummary / ExerciseLockState / 助手软阻断）
- [x] Heart 特有 9 个组件均有完整设计规格说明
- [x] AI 超时、网络断开、空状态、症状锁定均有处理方案
- [x] 全程无复杂动效设计（状态切换即时替换）
- [x] 无 Web 框架概念（无 Tailwind / shadcn / Next.js / React Router）
- [x] 组件树结构可直接映射为小程序 `components/` 文件目录
- [x] 交互逻辑与 spec.md US-01 至 US-08 的 Given/When/Then 验收标准一致

---

*文档结束。UI 阶段完成，请确认后进入 Dev 阶段。*
