import type { KnowledgeCard, KMSectionMeta, KMSectionId, ContentPhase, ContentAudience } from '@/types'

export const KM_SECTIONS: KMSectionMeta[] = [
  { id: 'emergency', label: '应急应对', description: '识别危险信号，掌握急救步骤', urgent: true },
  { id: 'exercise',  label: '运动康复', description: '安全运动，科学强度管理' },
  { id: 'meds',      label: '用药与复查', description: '坚持服药，正确用药' },
  { id: 'heart',     label: '认识我的心脏', description: '了解疾病，建立康复信心' },
  { id: 'risk',      label: '危险因素管理', description: '控制血压、血脂、血糖' },
  { id: 'diet',      label: '饮食管理', description: '心脏友好的饮食选择' },
  { id: 'psych',     label: '心理与情绪', description: '应对焦虑，保持心理健康' },
  { id: 'daily',     label: '回归日常', description: '工作、出行与长期自我管理' },
]

export const KNOWLEDGE_CARDS: KnowledgeCard[] = [
  // ─── S3 应急应对 ───────────────────────────────────────────────────────────

  {
    id: 'emergency-signs-01',
    section: 'emergency', subsection: 'signs', priority: 'P0',
    phase: ['adaptation', 'improvement', 'maintenance'],
    audience: ['general'],
    title: '胸痛的特点：哪些是心脏发出的信号',
    body: '心绞痛是心脏缺血时发出的警告信号。您可能会感到以下部位的疼痛或不适：胸部、下巴、胳膊、上背或咽喉。同时可能伴有呼吸急促、极度疲倦或恶心。记住"PAIN"四个字：压力感（Pressure）、焦虑感（Anxiety）、不能呼吸（Inability to breathe）、恶心或呕吐（Nausea）——这些都是心脏可能在发出的信号。稳定型心绞痛通常在运动过度、情绪激动或饱餐后发生，休息或含服硝酸甘油后5分钟内可以缓解；不稳定型心绞痛即使在休息或睡眠时也可能发作，症状可持续30分钟，这种情况必须立即就医。',
  },
  {
    id: 'emergency-signs-02',
    section: 'emergency', subsection: 'signs', priority: 'P0',
    phase: ['adaptation', 'improvement', 'maintenance'],
    audience: ['general'],
    title: '除了胸痛，还有哪些警示症状',
    body: '心脏病发作时不一定都有剧烈胸痛，以下症状同样需要警惕：呼吸急促（即使在安静时）、极度疲倦且原因不明、恶心或呕吐、大汗淋漓、头晕或眼前发黑、心慌或心跳不规律。女性患者尤其容易出现这些"非典型"症状，而没有典型的胸口压迫感。记录下您平时的"正常"症状模式——如果某次发作时症状更频繁、更强烈、持续时间更长，或者在平时不会引起症状的轻微活动时出现，就需要马上联系医生。',
  },
  {
    id: 'emergency-nitro-01',
    section: 'emergency', subsection: 'nitro', priority: 'P0',
    phase: ['adaptation', 'improvement', 'maintenance'],
    audience: ['general'],
    title: '硝酸甘油怎么用',
    body: '硝酸甘油（舌下含片或喷雾）是缓解心绞痛的急救药，通过放松血管、改善心脏供血来发挥作用。使用方法：先坐下来，将1片含片放在舌下含服，或在舌下喷1喷，然后休息5分钟。服药后可能出现头痛、头晕或面部潮红，这是正常反应。保存要点：避光、干燥、常温存放，不要放在高温车内；开封后6个月更换；随身携带。重要提醒：服用硝酸甘油期间不能同时服用治疗勃起功能障碍的药物（如西地那非），两者同用可能导致血压骤降。',
  },
  {
    id: 'emergency-nitro-02',
    section: 'emergency', subsection: 'nitro', priority: 'P0',
    phase: ['adaptation', 'improvement', 'maintenance'],
    audience: ['general'],
    title: '心绞痛发作时应该做什么（分步指南）',
    body: '运动中或日常活动中出现心绞痛，请按以下步骤处理——第一步：放慢动作，慢速活动1分钟；第二步：若症状未消失，立即停下来坐着等待1分钟；第三步：若仍在，坐下服1片硝酸甘油，休息5分钟。如果症状消失了，继续以较慢速度活动5分钟观察；如果没消失，服第2片，再等5分钟；如果还没消失，服第3片，等5分钟——第三片后仍未缓解，立即拨打120。安全提示：服1次硝酸甘油后缓解，当天不要继续运动，先咨询医生；服了2次后才缓解，当天也不要再运动；出现新症状或不同于以往的症状，请联系您的医生。',
  },
  {
    id: 'emergency-ems-01',
    section: 'emergency', subsection: 'ems', priority: 'P0',
    phase: ['adaptation', 'improvement', 'maintenance'],
    audience: ['general'],
    title: '必须立即拨打120的情况',
    body: '以下情况必须立即拨打120，不要自行驾车或让家人开车送医——救护车上有急救设备和药物，可以在路上开始抢救，这一点非常重要：服了3片硝酸甘油后心绞痛仍未缓解；心绞痛持续超过15分钟；症状比以往更严重、更持久；首次出现胸痛而不能确定原因；出现意识改变、晕倒或严重呼吸困难。此外，如果您感觉到症状模式发生了变化——比如以前爬2层楼才发作，现在走平路就发作——这也是需要尽快联系医生的信号，不要拖延。',
  },
  {
    id: 'emergency-ems-02',
    section: 'emergency', subsection: 'ems', priority: 'P0',
    phase: ['adaptation', 'improvement', 'maintenance'],
    audience: ['general'],
    title: '等待救援时，家人应该做什么',
    body: '拨打120后等待救援期间，家人或陪同者可以这样帮助患者：让患者坐下或半躺（通常坐姿比躺着更容易呼吸）；保持环境安静，帮助患者情绪平稳；不要给患者进食或饮水；帮助整理就诊资料，如医保卡、近期检查报告、常用药物列表；告诉急救人员：患者的主要症状、开始出现的时间、已服用了哪些药物。如果患者突然失去意识，先大声呼唤，如果没有反应且没有正常呼吸，立即开始胸外按压。',
  },
  {
    id: 'emergency-cpr-01',
    section: 'emergency', subsection: 'cpr', priority: 'P0',
    phase: ['adaptation', 'improvement', 'maintenance'],
    audience: ['general'],
    title: '心肺复苏（CPR）基础',
    body: '当身边有人突然倒下、没有反应时，立即按以下步骤操作：①大声呼叫并拍打肩膀，确认是否有意识；②立即大声呼救，让旁人拨打120并找AED（自动体外除颤器）；③检查是否有正常呼吸——如果没有或看不出来，立即开始心肺复苏；④双手交叠压在胸骨正中偏下方，手臂伸直，用体重力量向下快速按压，深度约5厘米，频率100-120次/分钟；⑤持续按压直到急救人员到达或AED可以使用。即使您没有经过专业培训，持续按压也比什么都不做强——不要因为担心"做不好"而放弃尝试。',
  },
  {
    id: 'emergency-cpr-02',
    section: 'emergency', subsection: 'cpr', priority: 'P0',
    phase: ['adaptation', 'improvement', 'maintenance'],
    audience: ['general'],
    title: '家中急救准备清单',
    body: '建议心脏病患者在家中做好以下准备：硝酸甘油——遵医嘱随身携带，注意有效期（开封后约6个月），避光干燥保存，不要放在高温车内或贴身口袋（体温会加速失效）；紧急联系人列表——写下主治医生、心脏康复团队和120的电话，贴在显眼位置；就诊资料袋——装好病历摘要、近期检查报告、用药清单和剂量；急救卡片——写明姓名、诊断、过敏药物、常用药物，放在钱包里。定期检查药品有效期，并确保家庭成员知道急救物品的存放位置和使用方法。',
  },

  // ─── S4 运动康复（来自现有卡片，映射到新结构）─────────────────────────────

  {
    id: 'exercise-why-01',
    section: 'exercise', subsection: 'why', priority: 'P0',
    phase: ['adaptation', 'improvement', 'maintenance'],
    audience: ['general'],
    title: '为什么心脏病后反而需要运动？',
    body: '运动康复是经过大量临床研究验证的心脏康复核心处方之一。适度的有氧运动能帮助心脏更高效地泵血，改善血管弹性，降低心脏负担。长期坚持规律运动的冠心病患者，心脏事件发生风险明显低于不运动的患者。关键在于"适度"——找到属于你的安全强度范围。',
  },
  {
    id: 'exercise-stop-01',
    section: 'exercise', subsection: 'stop', priority: 'P0',
    phase: ['adaptation', 'improvement'],
    audience: ['general'],
    title: '运动中出现什么感受时该立即停下来',
    body: '运动中出现以下任何一种情况，请立即停下来休息，并在必要时就医：胸痛或胸部压迫感、心慌或心跳明显不规律、头晕或视线模糊、呼吸极度困难（正常程度的喘气是正常的）、手脚明显无力。这些都不是"坚持一下就过去"的信号。',
  },
  {
    id: 'exercise-intensity-01',
    section: 'exercise', subsection: 'intensity', priority: 'P0',
    phase: ['adaptation', 'improvement'],
    audience: ['general'],
    title: '什么是 RPE？为什么不直接用心率？',
    body: 'RPE（自感运动强度）是一种用主观感受来衡量运动强度的方法。相比心率，RPE 更接近你的真实身体感受，特别适合服用了控制心率药物（如美托洛尔）的患者。简单说：运动时能说话但不能唱歌，就是适中强度，也是大多数有氧训练的目标区间。',
  },
  {
    id: 'exercise-plan-01',
    section: 'exercise', subsection: 'plan', priority: 'P0',
    phase: ['adaptation'],
    audience: ['general'],
    title: '第一次运动：先从小目标开始',
    body: '很多患者在开始阶段会感到处方"太简单了"。这是故意的——低起点让心脏有时间适应，也让你建立运动信心。研究显示，康复初期过度激进的运动计划反而会增加放弃的风险。把第一次运动当作信心的开始，而不是体能的测试。',
  },
  {
    id: 'exercise-cabg-01',
    section: 'exercise', subsection: 'precaution', priority: 'P0',
    phase: ['adaptation', 'improvement'],
    audience: ['cabg'],
    title: 'CABG 术后的上肢恢复',
    body: '冠状动脉搭桥手术（CABG）后，胸骨需要约 6–12 周才能充分愈合。在此期间，应避免上肢中高强度的抗阻训练（如俯卧撑、引体向上、哑铃推举），以防止骨骼愈合受影响。术后 3 个月后，可在康复师指导下逐步恢复上肢力量训练。步行等下肢有氧训练不受此限制。',
  },
  {
    id: 'exercise-precaution-htn',
    section: 'exercise', subsection: 'precaution', priority: 'P0',
    phase: ['adaptation', 'improvement'],
    audience: ['hypertension'],
    title: '高血压患者运动时的注意事项',
    body: '高血压患者进行有氧运动是安全且有益的，规律运动有助于长期血压管理。运动时需注意：避免憋气（如举重时憋气会短暂大幅升高血压），运动后不要立刻停下（冷身过渡更重要），如果血压超过180/110 mmHg，请先不要运动，联系医生。运动前可以自测血压，有助于发现趋势。',
  },

  // ─── S6 用药与复查 ────────────────────────────────────────────────────────

  {
    id: 'meds-drug-01',
    section: 'meds', subsection: 'drug', priority: 'P0',
    phase: ['adaptation', 'improvement', 'maintenance'],
    audience: ['general'],
    title: '抗血小板药物（阿司匹林/氯吡格雷）',
    body: '抗血小板药物（如阿司匹林、氯吡格雷/波立维®、替格瑞洛/倍林达®）通过防止血小板粘结成血栓来保护心脏。PCI支架手术后，医生通常要求同时服用两种抗血小板药物（双联抗血小板疗法）至少12个月——这是防止支架内血栓的重要保护措施，不能因为"感觉好了"就擅自停药。常见副作用：容易瘀伤、恶心、偶有头晕；如出现黑色柏油样大便，这是消化道出血信号，需立即就医。如需手术或拔牙，请提前告知医生您正在服用这类药物。',
  },
  {
    id: 'meds-drug-02',
    section: 'meds', subsection: 'drug', priority: 'P0',
    phase: ['adaptation', 'improvement', 'maintenance'],
    audience: ['general'],
    title: '他汀类降脂药：不只是降血脂',
    body: '他汀类药物（如阿托伐他汀/立普妥®、瑞舒伐他汀/可定®）通过阻止肝脏产生过多胆固醇来发挥作用。它不只是"降血脂"——更重要的是稳定血管内的斑块，防止斑块破裂引发心梗。即使您的胆固醇指标已经正常，也不能擅自停药，因为他汀的保护作用需要持续维持。常见副作用：肌肉疼痛、无力、肝功能异常——如果出现明显肌肉酸痛，请告知医生；不要因副作用自行停药，医生可以调整方案。PCI术后患者的LDL目标值通常需要低于1.8 mmol/L。',
  },
  {
    id: 'meds-drug-03',
    section: 'meds', subsection: 'drug', priority: 'P0',
    phase: ['adaptation', 'improvement', 'maintenance'],
    audience: ['general'],
    title: 'β受体阻滞剂（美托洛尔等）：不能突然停',
    body: 'β受体阻滞剂（如美托洛尔/倍他乐克®、比索洛尔、阿替洛尔）通过降低血压和减慢心率来减少心脏工作量，降低心绞痛和再次发作风险。重要提醒：绝对不能突然停药——骤停可能引起心率反跳和心绞痛加重，如需减量必须在医生指导下逐步进行。常见副作用：心跳偏慢、头晕、疲倦、可能影响睡眠；服用这类药物时心率偏低属正常，但如果低于每分钟50次请联系医生。合并糖尿病的患者需注意：β受体阻滞剂会掩盖低血糖症状，运动时更要留心。',
  },
  {
    id: 'meds-drug-04',
    section: 'meds', subsection: 'drug', priority: 'P0',
    phase: ['adaptation', 'improvement', 'maintenance'],
    audience: ['general'],
    title: 'ACEI/ARB（普利/沙坦类）保护心脏和肾脏',
    body: 'ACEI（如雷米普利/Altace®、培哚普利/Coversyl®）和ARB（如氯沙坦/科素亚®、缬沙坦/代文®）是两类扩张血管、降低血压的药物，同时保护心肌、减少心力衰竭风险，适用于高血压或心功能下降的患者。当ACEI出现副作用时可换用ARB。ACEI最常见副作用是持续性干咳（约10-20%的患者会出现）——这是正常的药物反应，不是过敏，但如果严重影响生活，可以和医生商量换ARB。两类药物都可能引起低血压（头晕），起身时动作要放慢。',
  },
  {
    id: 'meds-how-01',
    section: 'meds', subsection: 'how', priority: 'P0',
    phase: ['adaptation', 'improvement', 'maintenance'],
    audience: ['general'],
    title: '服药时间和注意事项',
    body: '心脏病药物的服用时机很重要：他汀类药物通常晚上睡前服用效果最佳（肝脏夜间合成胆固醇更活跃）；β受体阻滞剂和ACEI/ARB通常早晨服用；利尿剂建议早上服用，避免夜间频繁起床。硝酸甘油是急救药，需随身携带，避免高温和阳光直射（不要放在车内仪表台或深层口袋），开封后每6个月更换。如果您同时服用中草药、保健品或维生素，请告知医生——某些中草药可能与心脏药物产生相互作用，影响疗效或增加副作用风险。',
  },
  {
    id: 'meds-how-02',
    section: 'meds', subsection: 'how', priority: 'P0',
    phase: ['adaptation', 'improvement', 'maintenance'],
    audience: ['general'],
    title: '漏服了怎么办，出现副作用怎么处理',
    body: '漏服处理原则：想起来时如果距下次服药还有超过一半时间，按正常剂量补服一次；如果已接近下次服药时间，跳过这次直接服下一次——不要一次服双倍剂量。连续漏服超过两天，请主动联系医生。以下副作用需要立即就医：严重肌肉疼痛（他汀类）、嘴唇或脸部突然肿胀（ACEI）、黑色柏油样大便（抗血小板药）、心率持续低于每分钟50次（β受体阻滞剂）。轻微副作用（如轻微头晕、短暂恶心）通常在服药初期会出现，大多在几天内适应，不要因此擅自停药。',
  },

  // ─── S1 认识我的心脏 ──────────────────────────────────────────────────────

  {
    id: 'heart-prognosis-01',
    section: 'heart', subsection: 'prognosis', priority: 'P0',
    phase: ['adaptation'],
    audience: ['general'],
    title: '五大康复处方，缺一不可',
    body: '心脏康复不只是运动。完整的康复方案包含五个部分：运动处方（改善心肺功能）、营养处方（减少心血管风险因素）、药物依从（维持治疗效果）、心理疏导（管理焦虑和抑郁）、危险因素管理（血压、血糖、血脂控制）。每一项都有独立的循证依据，综合执行效果最佳。',
  },

  // ─── S2 危险因素管理 ─────────────────────────────────────────────────────

  {
    id: 'risk-glucose-01',
    section: 'risk', subsection: 'glucose', priority: 'P0',
    phase: ['adaptation', 'improvement'],
    audience: ['diabetes'],
    title: '糖尿病患者运动需要额外留意血糖',
    body: '对于合并糖尿病的心脏病患者，运动既是降血糖的天然"药物"，也需要多一层注意：运动前血糖过低（<5.6 mmol/L）时，先吃点小零食再运动；注射胰岛素后不要立刻运动；随身携带小糖块，以防低血糖反应。有规律的运动能显著改善胰岛素敏感性，但前期需要与医生讨论血糖目标的调整。',
  },
  {
    id: 'risk-smoke-01',
    section: 'risk', subsection: 'smoke', priority: 'P0',
    phase: ['adaptation', 'improvement', 'maintenance'],
    audience: ['general'],
    requires_smoker: true,
    title: '戒烟对心脏康复的作用，比任何药都快',
    body: '戒烟是心脏康复中效果最快的干预措施之一。戒烟后 20 分钟，血压和心率开始下降；24 小时后，心脏病发作风险开始降低；1 年内，心血管风险降幅明显。如果你目前在吸烟，和医生讨论戒烟支持方案——尼古丁替代疗法和药物辅助戒烟的成功率远高于纯意志力。',
  },
  {
    id: 'risk-bp-01',
    section: 'risk', subsection: 'bp', priority: 'P0',
    phase: ['adaptation', 'improvement', 'maintenance'],
    audience: ['general'],
    title: '血压控制目标：心脏病患者该降到多少',
    body: '血压控制不达标，是冠心病患者心脏事件反复发生的最常见原因之一。《中国心血管病一级预防指南》明确：一般高血压患者血压目标 <130/80 mmHg；合并糖尿病或慢性肾病时目标相同；高龄老年患者可结合个体情况适当放宽。仅靠生活方式改变就能使收缩压下降 5–11 mmHg：每天食盐控制在 5g 以下、BMI<24、坚持规律有氧运动，这三项叠加效果显著。当血压超过 140/90 mmHg 且属于心血管中高危患者时，需要在医生指导下联合降压药物治疗。建议在家自测血压（早晨起床后、服药前），每次连测 2 次取均值，这样比单次测量更能反映真实血压水平，也方便医生调整方案。',
  },
  {
    id: 'risk-lipid-01',
    section: 'risk', subsection: 'lipid', priority: 'P0',
    phase: ['adaptation', 'improvement', 'maintenance'],
    audience: ['general'],
    title: '血脂达标：LDL-C 才是真正的靶点',
    body: '血脂检查中最关键的指标是低密度脂蛋白胆固醇（LDL-C），它是导致动脉斑块形成的核心物质，也是他汀类药物主要作用的靶点。不同的心血管风险等级，LDL-C 的控制目标不同：已发生过心肌梗死、接受过 PCI 支架或 CABG 搭桥的高危患者，LDL-C 目标应 <1.8 mmol/L（约 70 mg/dl），或相比治疗前降低 50% 以上；风险中等的患者目标是 <2.6 mmol/L；低风险人群 <3.4 mmol/L 即可。需要特别注意：即使血脂"看起来正常"，也不能自行停药——他汀的抗炎和稳定斑块作用需要长期维持，停药后保护效果迅速消退。建议每 3–6 个月复查血脂，非 HDL-C（总胆固醇减去 HDL-C）在甘油三酯偏高时也是重要参考指标。',
  },
  {
    id: 'risk-weight-01',
    section: 'risk', subsection: 'weight', priority: 'P0',
    phase: ['adaptation', 'improvement', 'maintenance'],
    audience: ['general'],
    title: '体重管理：血压、血脂、血糖同步受益',
    body: '超重和肥胖是心血管疾病的独立危险因素，也是血压、血脂和血糖同时异常的共同根源。中国指南推荐的健康体重目标：BMI（体重 kg ÷ 身高 m²）维持在 18.5–<24.0 kg/m²；腰围男性 <90 cm，女性 <85 cm（腰围是评估腹型肥胖的更敏感指标，比体重更能反映心血管风险）。体重每减少 5–10%，收缩压可下降 5–10 mmHg，LDL-C 和血糖也随之改善，往往可以减少降压药的种类或剂量。减重的核心是两端发力：减少精白米面、油脂和加工食品来控制热量摄入，同时坚持规律运动增加热量消耗。每周 150 分钟以上的中等强度有氧运动，是长期维持减重效果的关键。不建议自行尝试极低热量饮食（每天 <800 大卡），副作用多且难以坚持。',
  },
  {
    id: 'risk-alcohol-01',
    section: 'risk', subsection: 'alcohol', priority: 'P0',
    phase: ['adaptation', 'improvement', 'maintenance'],
    audience: ['general'],
    title: '已患心脏病：不建议用饮酒来"保护心脏"',
    body: '曾有研究认为适量饮酒对心脏有益，但这一结论不适用于已患心血管疾病的患者。对于冠心病患者，饮酒会升高血压、增加心房颤动复发风险，并干扰他汀类药物和降压药的代谢效果；合并高血压、糖尿病或房颤的患者，指南明确建议不饮酒。如果目前有规律饮酒习惯，减少饮酒量本身就有降压获益，越早减少越好。若无法完全戒酒，每日酒精摄入量建议男性不超过 25g（相当于 50 度白酒约 50ml，或葡萄酒 250ml，或啤酒 750ml），女性不超过 15g。要注意：酒精与硝酸甘油同时服用会加重低血压，出现心绞痛时更要绝对避免饮酒。',
  },

  // ─── S5 饮食管理 ─────────────────────────────────────────────────────────

  {
    id: 'diet-principle-01',
    section: 'diet', subsection: 'principle', priority: 'P0',
    phase: ['adaptation', 'improvement', 'maintenance'],
    audience: ['general'],
    title: '心脏友好的饮食，不是只能吃素',
    body: '心脏康复饮食的核心是"地中海式饮食"的中国本土化版本：优先选择深海鱼（鲑鱼、沙丁鱼）、茶油或橄榄油、大量蔬菜和杂粮，适量坚果。减少加工食品、精白米面、腌制食品和油炸食物。肉类不是禁区，但以白肉（鸡、鱼）为主，红肉控量。',
  },
  {
    id: 'diet-fat-01',
    section: 'diet', subsection: 'fat', priority: 'P0',
    phase: ['adaptation', 'improvement', 'maintenance'],
    audience: ['general'],
    title: '不是所有脂肪都有害：认识膳食脂肪',
    body: '脂肪对心脏的影响因类型而异。饱和脂肪酸（主要来自肥肉、动物油脂、全脂奶油、椰子油和棕榈油）摄入过多会升高血液 LDL-C，冠心病患者需将其控制在每日总热量的 7% 以内。反式脂肪酸（来自氢化植物油，存在于人造黄油、酥皮糕点、油炸快餐和包装零食中）危害更大——它既升高 LDL-C，又降低保护性的 HDL-C，应尽量避免摄入。相反，不饱和脂肪酸是"好脂肪"：茶油、橄榄油、菜籽油富含单不饱和脂肪酸；鱼类中的 EPA/DHA 和亚麻籽油中的 ω-3 是多不饱和脂肪酸，有助于降低甘油三酯、保护心脏。每天烹调用油建议控制在 20g 左右（约两白瓷勺），优先选择植物油，避免用猪油、黄油和棕榈油炒菜。',
  },
  {
    id: 'diet-fish-01',
    section: 'diet', subsection: 'fish', priority: 'P0',
    phase: ['adaptation', 'improvement', 'maintenance'],
    audience: ['general'],
    title: '鱼类：心脏的天然保护食物',
    body: '大量研究证实鱼类对心脏的保护作用。每周至少吃 1 次鱼，可使冠心病风险降低约 15%；对于高危患者，研究估计每天摄入富含脂肪的深海鱼，可使冠心病死亡率降低约 50%。这些保护作用主要来自 ω-3 脂肪酸（EPA 和 DHA），它们有抗炎、抗血小板聚集和降低甘油三酯的作用。首选富含 omega-3 的鱼类：鲑鱼、沙丁鱼、鲭鱼、金枪鱼、鳟鱼。建议每周鱼类摄入量 300–525g（约 2–3 餐），烹饪方式用清蒸、炖煮，避免油炸——油炸不仅破坏 omega-3，还会增加饱和脂肪摄入。不推荐用鱼油胶囊代替天然食物中的鱼类，通过日常饮食获得的 n-3 脂肪酸更安全有效。',
  },
  {
    id: 'diet-salt-01',
    section: 'diet', subsection: 'salt', priority: 'P0',
    phase: ['adaptation', 'improvement', 'maintenance'],
    audience: ['general'],
    title: '限盐：对心脏和血压最直接的饮食改变',
    body: '钠摄入量与血压直接相关，而高血压是心血管事件的首要可控危险因素。研究显示，每天减少约 3g 食盐（相当于减少 50 mmol/L 钠），可使卒中死亡减少 22%、冠心病死亡减少 16%。然而我国居民平均每天食盐摄入约 14.5g，是推荐量 5g 的近三倍。减盐的实际方法：烹饪时减少食盐、酱油、味精、鸡精、蚝油等含钠调味品；减少腌制食品（咸菜、泡菜、腊肉）和加工食品（方便面、薯片、香肠）；在外就餐主动要求少盐；可以使用限盐勺帮助量化。另外，多吃天然富含钾的食物（蔬菜、水果、豆类）有助于对抗钠的升压效应，这比额外补充钾制剂更安全有效。',
  },
  {
    id: 'diet-veg-fruit-01',
    section: 'diet', subsection: 'veg', priority: 'P0',
    phase: ['adaptation', 'improvement', 'maintenance'],
    audience: ['general'],
    title: '蔬果摄入：最简单的心血管风险干预',
    body: '蔬菜和水果是证据最充分的心脏保护食物。荟萃分析显示，每天每多摄入 100g 蔬菜或水果（约 1 小份），可减少冠心病风险约 4%、卒中风险约 5%。中国指南推荐：每天新鲜蔬菜不少于 500g，其中深色蔬菜（菠菜、西兰花、胡萝卜、紫甘蓝等）应占至少一半；水果每天 200–350g，注意鲜果汁不能替代完整水果，因为榨汁后膳食纤维大量丢失、糖分浓缩。蔬果的多重保护机制：膳食纤维可降低 LDL-C 和血糖；天然钾有助于控制血压；植物化学物质（多酚、类黄酮）有抗炎和抗氧化作用。国内大队列研究发现，成人每天蔬果摄入 ≥500g，结合不吸烟、适宜体重和规律运动，可以预防 5.1% 的心血管病发生。',
  },
  {
    id: 'diet-nuts-soy-01',
    section: 'diet', subsection: 'nuts', priority: 'P0',
    phase: ['adaptation', 'improvement', 'maintenance'],
    audience: ['general'],
    title: '坚果和大豆：小份量，大获益',
    body: '坚果和大豆制品是心脏友好饮食中两类容易被忽视的食物。坚果（核桃、杏仁、腰果、花生等）富含不饱和脂肪酸、膳食纤维和矿物质。流行病学研究显示，每天食用约 67g 坚果，可降低血清 LDL-C 约 7.4%，在甘油三酯偏高的人群中降脂效果更明显。中国指南建议每天 50–70g，但坚果热量较高，食用时应相应减少其他脂肪来源，避免总热量超标。大豆及其制品是优质植物蛋白来源，研究表明每天摄入 47g 大豆蛋白，可使血总胆固醇下降 9%、LDL-C 下降 13%。建议每天食用大豆制品，折合大豆约 25g（相当于北豆腐 125g，或豆腐丝 50g，或豆浆 300ml）。豆制品还富含大豆异黄酮和植物固醇，有额外的心血管保护作用。',
  },

  // ─── S7 心理与情绪 ────────────────────────────────────────────────────────

  {
    id: 'psych-reaction-01',
    section: 'psych', subsection: 'reaction', priority: 'P0',
    phase: ['adaptation'],
    audience: ['general'],
    title: '心脏病后感到害怕或焦虑，是正常的',
    body: '许多经历过心脏事件的患者都会有一段时间感到害怕运动、担心再次发病。这种恐惧是正常的保护反应，不代表你"心理有问题"。研究显示，经过系统的心脏康复，患者的焦虑水平会随着康复进程逐渐降低。如果你的焦虑感持续影响日常生活，建议和医生聊聊。',
  },

  // ─── S8 回归日常 ─────────────────────────────────────────────────────────

  {
    id: 'daily-activity-01',
    section: 'daily', subsection: 'activity', priority: 'P0',
    phase: ['adaptation', 'improvement', 'maintenance'],
    audience: ['general'],
    title: '除了运动时间，日常活动也很重要',
    body: '研究表明，每天的"总活动量"对心血管健康同样重要。不必把所有运动集中在固定时间——饭后散步 10 分钟、选择爬楼梯代替电梯、做家务时保持适度活动，都是有效的日常积累。目标是减少连续久坐时间，每隔 30–60 分钟起身活动几分钟。',
  },
]

// ─── 工具函数 ─────────────────────────────────────────────────────────────────

const SECTION_PRIORITY_ORDER: KMSectionId[] = [
  'emergency', 'exercise', 'meds', 'heart', 'risk', 'diet', 'psych', 'daily',
]

export function getSequentialCard(params: {
  phase: ContentPhase
  audienceTags: ContentAudience[]
  isSmoker?: boolean
  shownIds: string[]
}): KnowledgeCard {
  const { phase, audienceTags, isSmoker, shownIds } = params

  const eligible = KNOWLEDGE_CARDS.filter(card => {
    if (card.priority !== 'P0') return false
    if (!card.phase.includes(phase)) return false
    if (card.requires_smoker && !isSmoker) return false
    return (
      card.audience.includes('general') ||
      card.audience.some(a => audienceTags.includes(a))
    )
  })

  eligible.sort((a, b) => {
    const ai = SECTION_PRIORITY_ORDER.indexOf(a.section)
    const bi = SECTION_PRIORITY_ORDER.indexOf(b.section)
    return ai - bi
  })

  const unshown = eligible.filter(c => !shownIds.includes(c.id))
  if (unshown.length > 0) return unshown[0]
  // All shown — restart cycle
  return eligible[0] ?? KNOWLEDGE_CARDS[0]
}

export function getCardsBySection(sectionId: KMSectionId, phase?: ContentPhase): KnowledgeCard[] {
  return KNOWLEDGE_CARDS.filter(
    c => c.section === sectionId && (phase ? c.phase.includes(phase) : true)
  )
}

export function getCardById(id: string): KnowledgeCard | undefined {
  return KNOWLEDGE_CARDS.find(c => c.id === id)
}
