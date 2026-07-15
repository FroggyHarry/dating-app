// ⚙️ 模式配置 — 朋友版将此值改为 'friend'
export type AppMode = 'elva' | 'friend';
export const APP_MODE: AppMode = 'elva';

interface ModeConfig {
  // 视觉
  primaryColor: string;
  primaryLight: string;
  primaryPale: string;
  primaryDark: string;
  bgGradient: string;
  fontFamily: string;
  // 文案
  inviteTitle: string;
  inviteHint: string;
  intermediateTitle: string;
  intermediateHint: string;
  intermediateBtn: string;
  confirmTitle: string;
  confirmSubtitle: string;
  showFrogImage: boolean;
  // 功能
  showAnimals: boolean;
  showFloatingDecor: boolean;
  showEvadingButton: boolean;
  showAdminEntry: boolean;
  requireName: boolean;
  requireApproval: boolean;
  // 确认后文案
  afterConfirmTitle: string;
  afterConfirmMsg: string;
}

const elvaConfig: ModeConfig = {
  primaryColor: '#FF85A2',
  primaryLight: '#FFB6C1',
  primaryPale: '#FFF0F3',
  primaryDark: '#E8587A',
  bgGradient: 'linear-gradient(180deg, #FFF0F3 0%, #FFF5F7 40%, #FFFFFF 100%)',
  fontFamily: "'PingFang SC', 'Microsoft YaHei', 'Hiragino Sans GB', 'Noto Sans SC', sans-serif",
  inviteTitle: '可以和蛙一起约会嘛？',
  inviteHint: '系统检测到：对方已经紧张到开始写网页了',
  intermediateTitle: '不是，你真的点了愿意？',
  intermediateHint: '我都已经准备好被你不要了',
  intermediateBtn: '干嘛',
  confirmTitle: '真开心你没有拒绝蛙，蛙会准时来接elva！',
  confirmSubtitle: '',
  showFrogImage: true,
  showAnimals: true,
  showFloatingDecor: true,
  showEvadingButton: true,
  showAdminEntry: true,
  requireName: false,
  requireApproval: false,
  afterConfirmTitle: '',
  afterConfirmMsg: '',
};

const friendConfig: ModeConfig = {
  primaryColor: '#4A90D9',
  primaryLight: '#7AB8F5',
  primaryPale: '#EBF4FD',
  primaryDark: '#357ABD',
  bgGradient: '#F5F7FA',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
  inviteTitle: '预约一个时间吧',
  inviteHint: '',
  intermediateTitle: '',
  intermediateHint: '',
  intermediateBtn: '',
  confirmTitle: '',
  confirmSubtitle: '',
  showFrogImage: false,
  showAnimals: false,
  showFloatingDecor: false,
  showEvadingButton: false,
  showAdminEntry: false,
  requireName: true,
  requireApproval: true,
  afterConfirmTitle: '预约已提交',
  afterConfirmMsg: '等待对方确认，确认后我们会通知你',
};

export const CONFIG: ModeConfig = (APP_MODE as string) === 'friend' ? friendConfig : elvaConfig;
