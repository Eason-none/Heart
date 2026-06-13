import type { ExerciseType, RPELevel, RehabPhase, DiagnosisType } from '@/types'

// ─── Equipment ───────────────────────────────────────────────────────────────

export type EquipmentType = 'dumbbells' | 'resistance_band' | 'pool' | 'nordic_poles'

// ─── Surgery Time Restriction ────────────────────────────────────────────────

export interface SurgeryWindow {
  diagnoses: DiagnosisType[]
  min_weeks: number   // exercise is blocked if weeks_post_surgery < min_weeks
  reason: string
}

// ─── Non-time-based Contraindication Flags ───────────────────────────────────

export type ContraFlag =
  | 'lvef_lt_40'       // LVEF < 40%
  | 'uncontrolled_bp'  // systolic ≥ 160 or diastolic ≥ 100
  | 'high_risk_any'    // any of high_risk_q1/2/3 = true
  | 'vsaq_lt_6'        // VSAQ < 6 METs (blocks moderate resistance)
  | 'cannot_swim'      // user self-reports cannot swim
  | 'icd_lt_6w'        // ICD implanted < 6 weeks ago
  | 'open_wound'       // active open wound

// ─── Modification Conditions ─────────────────────────────────────────────────

export type ModCondition =
  | { type: 'cabg_weeks_lt'; weeks: number }   // CABG < N weeks
  | { type: 'vsaq_lte'; value: number }         // VSAQ ≤ N
  | { type: 'always' }                          // show for all users

export interface ExerciseModification {
  condition: ModCondition
  when_display: string   // shown as "适用条件" in UI
  instruction: string
}

// ─── Exercise Item ────────────────────────────────────────────────────────────

export interface ExerciseItem {
  id: string
  name: string
  category: ExerciseType
  equipment?: EquipmentType
  duration_range: [number, number]   // [min, max] minutes for main activity
  rpe_range: [RPELevel, RPELevel]
  freq_range: [number, number]       // sessions per week [min, max]
  surgery_windows: SurgeryWindow[]
  contra_flags: ContraFlag[]
  modifications: ExerciseModification[]
  steps: string[]
  safety_notes: string[]
  video_guided?: boolean
  video_note?: string
  phases: RehabPhase[]
}

// ─── Aerobic ──────────────────────────────────────────────────────────────────

const walkingBasic: ExerciseItem = {
  id: 'walking_basic',
  name: '步行',
  category: 'walking',
  duration_range: [15, 60],
  rpe_range: [1, 3],
  freq_range: [3, 5],
  surgery_windows: [],
  contra_flags: ['high_risk_any', 'uncontrolled_bp'],
  modifications: [],
  steps: [
    '热身：以舒适慢速步行 3–5 分钟，逐渐升温',
    '主运动：以目标 RPE 强度匀速步行，保持能正常说话',
    '冷身：减速步行 3–5 分钟，待心率逐步降低',
  ],
  safety_notes: ['穿有支撑性的运动鞋', '感到胸闷、心慌、头晕立即停止'],
  phases: ['adaptation', 'improvement', 'maintenance'],
}

const nordicWalking: ExerciseItem = {
  id: 'nordic_walking',
  name: '北欧式健走',
  category: 'walking',
  equipment: 'nordic_poles',
  duration_range: [30, 60],
  rpe_range: [1, 2],
  freq_range: [2, 3],
  surgery_windows: [
    {
      diagnoses: ['cabg'],
      min_weeks: 8,
      reason: '胸骨未愈合前禁止上肢推杖发力',
    },
  ],
  contra_flags: ['high_risk_any', 'uncontrolled_bp'],
  modifications: [
    {
      condition: { type: 'cabg_weeks_lt', weeks: 12 },
      when_display: 'CABG 术后 8–12 周',
      instruction: '手杖仅辅助平衡，不做向后推杖发力动作',
    },
  ],
  steps: [
    '热身：不持杖慢速步行 3–5 分钟',
    '右脚迈出时左臂前推手杖（对侧节奏），将杖尖植于右脚前方 30–45 cm 处',
    '手掌向后推压手杖，感受核心和背部协同发力',
    '步幅略大于普通步行，保持抬头、收腹、肩膀放松',
    '冷身：减速步行 3–5 分钟',
  ],
  safety_notes: [
    '手杖高度：握杖时前臂与地面呈 90°（肘部成直角）',
    '使用专用手套式固定带，非普通腕带',
    '雨后湿滑路面换金属尖头并降低速度',
  ],
  phases: ['adaptation', 'improvement', 'maintenance'],
}

const homeMarch: ExerciseItem = {
  id: 'home_march',
  name: '原地踏步',
  category: 'home_aerobic',
  duration_range: [15, 30],
  rpe_range: [1, 2],
  freq_range: [3, 5],
  surgery_windows: [],
  contra_flags: ['high_risk_any', 'uncontrolled_bp'],
  modifications: [],
  steps: [
    '站立，双手自然前后摆动，交替抬膝至腰腹高度',
    '速度保持在能正常说话的程度（中等 RPE）',
    '进阶：加大手臂摆幅或加快节奏提升强度',
  ],
  safety_notes: ['平衡不稳时扶椅背', '感到头晕立即停止并坐下'],
  phases: ['adaptation', 'improvement', 'maintenance'],
}

const swimming: ExerciseItem = {
  id: 'swimming',
  name: '游泳 / 水中运动',
  category: 'swimming',
  equipment: 'pool',
  duration_range: [20, 30],
  rpe_range: [1, 2],
  freq_range: [3, 3],
  surgery_windows: [
    {
      diagnoses: ['pci', 'mi_recovery'],
      min_weeks: 6,
      reason: '心梗/支架术后伤口需充分愈合',
    },
    {
      diagnoses: ['cabg'],
      min_weeks: 12,
      reason: '胸骨及手术切口未完全愈合',
    },
  ],
  contra_flags: [
    'cannot_swim', 'icd_lt_6w', 'open_wound',
    'high_risk_any', 'uncontrolled_bp',
  ],
  modifications: [],
  steps: [
    '陆上热身 5–10 分钟（关节活动、慢走）',
    '逐步入水：先浸入手脚，再缓慢进入腰部深度（勿跳入）',
    '蛙泳或自由泳，保持中等速度（能正常说话）',
    '替代方案：在胸腰深度水中步行，利用水阻',
    '出水前在浅水区站立休息 2–3 分钟',
    '立即擦干，及时保暖',
  ],
  safety_notes: [
    '水温确认 33–34°C；< 26°C 或 > 38°C 不入水',
    '出水后缓慢站起，防止直立性低血压',
    '须有人陪同，不单独游泳',
  ],
  phases: ['improvement', 'maintenance'],
}

// ─── Resistance ───────────────────────────────────────────────────────────────

const seatedLegRaise: ExerciseItem = {
  id: 'seated_leg_raise',
  name: '坐姿腿抬伸',
  category: 'resistance',
  duration_range: [15, 25],
  rpe_range: [1, 2],
  freq_range: [2, 3],
  surgery_windows: [],
  contra_flags: ['lvef_lt_40', 'uncontrolled_bp', 'high_risk_any'],
  modifications: [],
  steps: [
    '坐椅边，背部挺直，双脚自然踩地',
    '呼气，缓慢伸直膝关节将腿抬至水平（2 秒）',
    '保持 1–2 秒，吸气，缓慢还原（3–4 秒）',
    '10–15 次/组，1–3 组，组间休息 1–2 分钟',
    '可单腿交替或双腿同时练习',
  ],
  safety_notes: [
    '用力时呼气，还原时吸气，全程不屏气',
    '速度宜慢，不借惯性弹起',
  ],
  phases: ['adaptation', 'improvement', 'maintenance'],
}

const wallSquat: ExerciseItem = {
  id: 'wall_squat',
  name: '靠墙静蹲',
  category: 'resistance',
  duration_range: [15, 25],
  rpe_range: [1, 2],
  freq_range: [2, 3],
  surgery_windows: [],
  contra_flags: ['lvef_lt_40', 'uncontrolled_bp', 'high_risk_any', 'vsaq_lt_6'],
  modifications: [
    {
      condition: { type: 'vsaq_lte', value: 5 },
      when_display: '体力较弱（VSAQ ≤ 5）',
      instruction: '减小下蹲幅度至 20–30°，以保持舒适为准，勿勉强蹲深',
    },
  ],
  steps: [
    '背靠墙站立，双脚距墙约 30 cm，脚尖朝前与肩同宽',
    '呼气，缓慢沿墙下滑至膝盖弯曲 60–90°',
    '维持姿势 5–10 秒，保持正常呼吸',
    '吸气，缓慢沿墙还原至站立',
    '8–12 次/组，1–3 组',
  ],
  safety_notes: [
    '膝盖不超过脚尖',
    '全程不屏气',
    '如膝盖疼痛立即停止',
  ],
  phases: ['adaptation', 'improvement', 'maintenance'],
}

const sitToStand: ExerciseItem = {
  id: 'sit_to_stand',
  name: '坐站起立',
  category: 'resistance',
  duration_range: [10, 20],
  rpe_range: [1, 2],
  freq_range: [2, 3],
  surgery_windows: [],
  contra_flags: ['lvef_lt_40', 'uncontrolled_bp', 'high_risk_any'],
  modifications: [],
  steps: [
    '坐椅边，双脚与肩同宽，踩实地面',
    '呼气，上身微前倾，缓慢从椅上站起（2–3 秒）',
    '稳定 1 秒后，吸气，缓慢控制坐回（3–4 秒，不要落坐）',
    '10–15 次/组，1–3 组',
  ],
  safety_notes: [
    '全程控制速度，不猛然站起或落坐',
    '如需要可双手扶椅背辅助',
  ],
  phases: ['adaptation', 'improvement', 'maintenance'],
}

const resistanceBandRow: ExerciseItem = {
  id: 'resistance_band_row',
  name: '弹力带划船',
  category: 'resistance',
  equipment: 'resistance_band',
  duration_range: [15, 25],
  rpe_range: [1, 2],
  freq_range: [2, 3],
  surgery_windows: [
    {
      diagnoses: ['cabg'],
      min_weeks: 8,
      reason: '胸骨骨愈合前禁止上肢抗阻运动',
    },
  ],
  contra_flags: ['lvef_lt_40', 'uncontrolled_bp', 'high_risk_any'],
  modifications: [],
  steps: [
    '将弹力带固定于与腰等高的稳固物（如门把手）',
    '坐位或站位，背部挺直，双手握带两端',
    '呼气，肘部向后拉，感受肩胛骨向脊柱夹紧（2 秒）',
    '吸气，缓慢还原（3–4 秒）',
    '10–15 次/组，1–3 组，组间休息 1–2 分钟',
  ],
  safety_notes: [
    '确认固定点牢固，防止松脱弹伤',
    '全程不屏气',
    '用力拉时呼气，还原时吸气',
  ],
  phases: ['adaptation', 'improvement', 'maintenance'],
}

const dumbbellBicepCurl: ExerciseItem = {
  id: 'dumbbell_bicep_curl',
  name: '哑铃弯举',
  category: 'resistance',
  equipment: 'dumbbells',
  duration_range: [15, 25],
  rpe_range: [1, 2],
  freq_range: [2, 3],
  surgery_windows: [
    {
      diagnoses: ['cabg'],
      min_weeks: 8,
      reason: '胸骨骨愈合前禁止上肢抗阻运动',
    },
  ],
  contra_flags: ['lvef_lt_40', 'uncontrolled_bp', 'high_risk_any'],
  modifications: [],
  steps: [
    '坐位，背部挺直，双手各持哑铃，掌心向上，肘部贴近躯干',
    '呼气，缓慢弯肘将哑铃举至肩部（2 秒）',
    '吸气，缓慢还原（3–4 秒）',
    '肩膀不耸动，不借惯性甩动',
    '10–15 次/组，1–3 组',
  ],
  safety_notes: [
    '选择轻重量：能舒适完成 15 次为宜（初始约 1–2 kg）',
    '如感到上肢疼痛或麻木立即停止',
  ],
  phases: ['adaptation', 'improvement', 'maintenance'],
}

// ─── Flexibility ──────────────────────────────────────────────────────────────

const staticStretchRoutine: ExerciseItem = {
  id: 'static_stretch_routine',
  name: '主要肌群拉伸',
  category: 'flexibility',
  duration_range: [10, 20],
  rpe_range: [1, 1],
  freq_range: [3, 5],
  surgery_windows: [],
  contra_flags: ['high_risk_any'],
  modifications: [
    {
      condition: { type: 'cabg_weeks_lt', weeks: 8 },
      when_display: 'CABG 术后 < 8 周',
      instruction: '跳过胸部扩胸拉伸（第 5 步），避免双臂向后大幅展开',
    },
  ],
  steps: [
    '小腿：弓步站立，后腿伸直脚跟踩地，感受小腿拉伸，保持 30 秒，左右各 1 次',
    '大腿前侧：站立单手扶椅，屈膝后拉脚踝至臀部，保持 30 秒，左右各 1 次',
    '大腿后侧：坐椅边，单腿前伸脚跟着地，上身缓慢前倾，保持 30 秒，左右各 1 次',
    '肩颈：头缓慢侧倾，同侧手轻压头部辅助，保持 20 秒，左右各 1 次',
    '胸部：双手背后十指交叉，缓慢向后扩胸，保持 20 秒',
  ],
  safety_notes: [
    '感到轻微牵拉感即可，不拉到疼痛位置',
    '全程保持正常呼吸，不屏气',
    '动作缓慢，不做弹振式拉伸',
  ],
  phases: ['adaptation', 'improvement', 'maintenance'],
}

const taiChiVideo: ExerciseItem = {
  id: 'tai_chi_video',
  name: '太极拳',
  category: 'flexibility',
  duration_range: [30, 60],
  rpe_range: [1, 2],
  freq_range: [3, 5],
  surgery_windows: [],
  contra_flags: ['high_risk_any'],
  modifications: [
    {
      condition: { type: 'always' },
      when_display: '平衡功能较差时',
      instruction: '全程扶椅，或选择坐式改良版太极',
    },
  ],
  steps: [],
  safety_notes: [
    '动作宜缓慢匀速，全程不屏气',
    '重心转换前确认平衡稳定',
    '寒冷或极热天气移至室内练习',
  ],
  video_guided: true,
  video_note: '搜索"杨式 24 式简化太极拳 教学"，推荐国家体育总局官方推广版本（动作平稳，强度约 3–4 METs）',
  phases: ['adaptation', 'improvement', 'maintenance'],
}

const baduanjinVideo: ExerciseItem = {
  id: 'baduanjin_video',
  name: '八段锦',
  category: 'flexibility',
  duration_range: [20, 40],
  rpe_range: [1, 2],
  freq_range: [3, 5],
  surgery_windows: [],
  contra_flags: ['high_risk_any'],
  modifications: [
    {
      condition: { type: 'cabg_weeks_lt', weeks: 10 },
      when_display: 'CABG 术后 < 10 周',
      instruction: '跳过第一节（双手托天理三焦），从第二节开始练习',
    },
    {
      condition: { type: 'always' },
      when_display: '腰椎病',
      instruction: '跳过第六节（两手攀足固肾腰），或减小前屈幅度',
    },
    {
      condition: { type: 'always' },
      when_display: '严重骨质疏松',
      instruction: '跳过第八节（背后七颠百病消），或仅轻踮不落踵',
    },
  ],
  steps: [],
  safety_notes: ['每节做 8 个呼吸循环', '动作缓慢连贯，全程不屏气'],
  video_guided: true,
  video_note: '搜索"八段锦 国家体育总局 2003 标准版"，按视频逐节跟练，每节 8 次呼吸循环',
  phases: ['adaptation', 'improvement', 'maintenance'],
}

const yogaBasicVideo: ExerciseItem = {
  id: 'yoga_basic_video',
  name: '瑜伽（哈他/阴瑜伽）',
  category: 'flexibility',
  duration_range: [30, 60],
  rpe_range: [1, 1],
  freq_range: [2, 3],
  surgery_windows: [
    {
      diagnoses: ['cabg'],
      min_weeks: 8,
      reason: '下犬式、平板支撑等上肢支撑体位在胸骨愈合前禁止',
    },
  ],
  contra_flags: ['high_risk_any'],
  modifications: [
    {
      condition: { type: 'cabg_weeks_lt', weeks: 12 },
      when_display: 'CABG 术后 8–12 周',
      instruction: '避免所有上肢支撑体位（下犬式、平板支撑），仅选择坐姿或仰卧动作',
    },
  ],
  steps: [],
  safety_notes: [
    '选择哈他瑜伽或阴瑜伽，禁止热瑜伽（高温 38°C+）',
    '全程不屏气，禁止倒立体位',
  ],
  video_guided: true,
  video_note: '搜索"哈他瑜伽 初学者"或"阴瑜伽 放松"，避免选择热瑜伽、流瑜伽（Vinyasa）课程',
  phases: ['adaptation', 'improvement', 'maintenance'],
}

// ─── Breathing ────────────────────────────────────────────────────────────────

const breathingPldb: ExerciseItem = {
  id: 'breathing_pldb',
  name: '缩唇膈肌呼吸',
  category: 'breathing_pldb',
  duration_range: [10, 15],
  rpe_range: [1, 1],
  freq_range: [3, 5],
  surgery_windows: [],
  contra_flags: [],
  modifications: [],
  steps: [
    '坐位或仰卧，肩膀放松，将一手轻放腹部感受运动',
    '经鼻缓慢吸气 2–3 秒，感受腹部隆起（膈肌下沉）',
    '嘴唇微缩呈吹口哨状，缓慢呼气 4–6 秒，感受腹部回落',
    '吸气：呼气时间比约 1:2，节奏由慢到自然',
    '10 次呼吸为一组，每次练习 2–3 组',
  ],
  safety_notes: [
    '出现头晕时暂停，恢复正常呼吸',
    '不要强迫呼气，保持自然放松',
  ],
  phases: ['adaptation', 'improvement', 'maintenance'],
}

// ─── Library Export ───────────────────────────────────────────────────────────

export const EXERCISE_LIBRARY: ExerciseItem[] = [
  // Aerobic
  walkingBasic,
  nordicWalking,
  homeMarch,
  swimming,
  // Resistance
  seatedLegRaise,
  wallSquat,
  sitToStand,
  resistanceBandRow,
  dumbbellBicepCurl,
  // Flexibility
  staticStretchRoutine,
  taiChiVideo,
  baduanjinVideo,
  yogaBasicVideo,
  // Breathing
  breathingPldb,
]

export function getExerciseById(id: string): ExerciseItem | undefined {
  return EXERCISE_LIBRARY.find(e => e.id === id)
}

export function getExercisesByCategory(category: ExerciseType): ExerciseItem[] {
  return EXERCISE_LIBRARY.filter(e => e.category === category)
}
