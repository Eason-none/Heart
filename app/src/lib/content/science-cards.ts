import type { ScienceCard } from '@/types'

export const SCIENCE_CARDS: ScienceCard[] = [
  {
    id: 'sc-001',
    topic: 'exercise_knowledge',
    card_type: 'principle',
    phase: ['adaptation', 'improvement', 'maintenance'],
    audience: ['general'],
    title: '为什么心脏病后反而需要运动？',
    body: '运动康复是经过大量临床研究验证的心脏康复核心处方之一。适度的有氧运动能帮助心脏更高效地泵血，改善血管弹性，降低心脏负担。长期坚持规律运动的冠心病患者，心脏事件发生风险明显低于不运动的患者。关键在于"适度"——找到属于你的安全强度范围。',
  },
  {
    id: 'sc-002',
    topic: 'exercise_knowledge',
    card_type: 'safety',
    phase: ['adaptation'],
    audience: ['general'],
    title: '运动中感受到什么时候该停下来？',
    body: '运动中出现以下任何一种情况，请立即停下来休息，并在必要时就医：胸痛或胸部压迫感、心慌或心跳明显不规律、头晕或视线模糊、呼吸极度困难（正常程度的喘气是正常的）、手脚明显无力。这些都不是"坚持一下就过去"的信号。',
  },
  {
    id: 'sc-003',
    topic: 'exercise_knowledge',
    card_type: 'concept',
    phase: ['adaptation', 'improvement'],
    audience: ['general'],
    title: '什么是 RPE？为什么不直接用心率？',
    body: 'RPE（自感运动强度）是一种用主观感受来衡量运动强度的方法。相比心率，RPE 更接近你的真实身体感受，特别适合服用了控制心率药物（如美托洛尔）的患者。简单说：运动时能说话但不能唱歌，就是适中强度，也是大多数有氧训练的目标区间。',
  },
  {
    id: 'sc-004',
    topic: 'disease_knowledge',
    card_type: 'concept',
    phase: ['adaptation'],
    audience: ['general'],
    title: '五大康复处方，缺一不可',
    body: '心脏康复不只是运动。完整的康复方案包含五个部分：运动处方（改善心肺功能）、营养处方（减少心血管风险因素）、药物依从（维持治疗效果）、心理疏导（管理焦虑和抑郁）、危险因素管理（血压、血糖、血脂控制）。每一项都有独立的循证依据，综合执行效果最佳。',
  },
  {
    id: 'sc-005',
    topic: 'nutrition',
    card_type: 'concept',
    phase: ['adaptation', 'improvement', 'maintenance'],
    audience: ['general'],
    title: '心脏友好的饮食，不是只能吃素',
    body: '心脏康复饮食的核心是"地中海式饮食"的中国本土化版本：优先选择深海鱼（鲑鱼、沙丁鱼）、茶油或橄榄油、大量蔬菜和杂粮，适量坚果。减少加工食品、精白米面、腌制食品和油炸食物。肉类不是禁区，但以白肉（鸡、鱼）为主，红肉控量。',
  },
  {
    id: 'sc-006',
    topic: 'mental_health',
    card_type: 'concept',
    phase: ['adaptation'],
    audience: ['general'],
    title: '心脏病后感到害怕或焦虑，是正常的',
    body: '许多经历过心脏事件的患者都会有一段时间感到害怕运动、担心再次发病。这种恐惧是正常的保护反应，不代表你"心理有问题"。研究显示，经过系统的心脏康复，患者的焦虑水平会随着康复进程逐渐降低。如果你的焦虑感持续影响日常生活，建议和医生聊聊。',
  },
  {
    id: 'sc-007',
    topic: 'exercise_knowledge',
    card_type: 'behavior_reinforcement',
    phase: ['adaptation'],
    audience: ['general'],
    title: '第一次运动：先从小目标开始',
    body: '很多患者在开始阶段会感到处方"太简单了"。这是故意的——低起点让心脏有时间适应，也让你建立运动信心。研究显示，康复初期过度激进的运动计划反而会增加放弃的风险。把第一次运动当作信心的开始，而不是体能的测试。',
  },
  {
    id: 'sc-008',
    topic: 'disease_knowledge',
    card_type: 'concept',
    phase: ['adaptation', 'improvement'],
    audience: ['cabg'],
    title: 'CABG 术后的上肢恢复',
    body: '冠状动脉搭桥手术（CABG）后，胸骨需要约 6–12 周才能充分愈合。在此期间，应避免上肢中高强度的抗阻训练（如俯卧撑、引体向上、哑铃推举），以防止骨骼愈合受影响。术后 3 个月后，可在康复师指导下逐步恢复上肢力量训练。步行等下肢有氧训练不受此限制。',
  },
  {
    id: 'sc-009',
    topic: 'disease_knowledge',
    card_type: 'safety',
    phase: ['adaptation', 'improvement'],
    audience: ['hypertension'],
    title: '高血压患者运动时的注意事项',
    body: '高血压患者进行有氧运动是安全且有益的，规律运动有助于长期血压管理。运动时需注意：避免憋气（如举重时憋气会短暂大幅升高血压），运动后不要立刻停下（冷身过渡更重要），如果血压超过180/110 mmHg，请先不要运动，联系医生。运动前可以自测血压，有助于发现趋势。',
  },
  {
    id: 'sc-010',
    topic: 'disease_knowledge',
    card_type: 'safety',
    phase: ['adaptation', 'improvement'],
    audience: ['diabetes'],
    title: '糖尿病患者运动需要额外留意血糖',
    body: '对于合并糖尿病的心脏病患者，运动既是降血糖的天然"药物"，也需要多一层注意：运动前血糖过低（<5.6 mmol/L）时，先吃点小零食再运动；注射胰岛素后不要立刻运动；随身携带小糖块，以防低血糖反应。有规律的运动能显著改善胰岛素敏感性，但前期需要与医生讨论血糖目标的调整。',
  },
  {
    id: 'sc-011',
    topic: 'daily_life',
    card_type: 'concept',
    phase: ['adaptation', 'improvement', 'maintenance'],
    audience: ['general'],
    title: '除了运动时间，日常活动也很重要',
    body: '研究表明，每天的"总活动量"对心血管健康同样重要。不必把所有运动集中在固定时间——饭后散步 10 分钟、选择爬楼梯代替电梯、做家务时保持适度活动，都是有效的日常积累。目标是减少连续久坐时间，每隔 30–60 分钟起身活动几分钟。',
  },
  {
    id: 'sc-012',
    topic: 'emergency',
    card_type: 'safety',
    phase: ['adaptation', 'improvement', 'maintenance'],
    audience: ['general'],
    title: '如何识别心脏急症，以及第一时间该做什么',
    body: '需要立即拨打 120 的症状：突然出现的剧烈胸痛（尤其向左臂或下颌放射）、突然大汗淋漓伴恶心、严重呼吸困难、突然晕厥或意识丧失。等待急救时：立刻坐下或躺下休息，不要独自一人，告诉身边的人你的状况。已有心脏支架的患者，随身携带硝酸甘油，按医嘱使用。',
  },
  {
    id: 'sc-013',
    topic: 'exercise_knowledge',
    card_type: 'milestone',
    phase: ['improvement'],
    audience: ['general'],
    title: '你已经坚持了 12 次运动',
    body: '完成 12 次规律有氧运动，代表你的心脏已经经历了第一个适应期。研究显示，能坚持到第 12 次的患者，后续康复依从性明显更高。接下来进入改善期，运动的质量和强度会随着你的状态逐步优化。继续保持这个节奏——你已经走过了最难的那段路。',
  },
  {
    id: 'sc-014',
    topic: 'smoking_cessation',
    card_type: 'concept',
    phase: ['adaptation', 'improvement', 'maintenance'],
    audience: ['general'],
    requires_smoker: true,
    title: '戒烟对心脏康复的作用，比任何药都快',
    body: '戒烟是心脏康复中效果最快的干预措施之一。戒烟后 20 分钟，血压和心率开始下降；24 小时后，心脏病发作风险开始降低；1 年内，心血管风险降幅明显。如果你目前在吸烟，和医生讨论戒烟支持方案——尼古丁替代疗法和药物辅助戒烟的成功率远高于纯意志力。',
  },
]

export function getCardsForUser(params: {
  phase: string
  audience_tags: string[]
  is_smoker?: boolean
  topic_preferences?: string[]
  count?: number
}): ScienceCard[] {
  const { phase, audience_tags, is_smoker, topic_preferences, count = 3 } = params

  return SCIENCE_CARDS.filter(card => {
    if (!card.phase.includes(phase as never)) return false
    if (card.requires_smoker && !is_smoker) return false
    const matchAudience =
      card.audience.includes('general') ||
      card.audience.some(a => audience_tags.includes(a))
    if (!matchAudience) return false
    if (topic_preferences?.length && !topic_preferences.includes(card.topic)) return false
    return true
  }).slice(0, count)
}
