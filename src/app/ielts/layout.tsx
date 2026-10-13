import type { Metadata } from 'next';
import { Lora } from 'next/font/google';

// 읽기·쓰기 본문용 세리프 (영문 가독성 + 손글씨 원고 느낌)
const lora = Lora({ subsets: ['latin'], variable: '--font-lora', display: 'swap' });

export const metadata: Metadata = {
  title: 'IELTS Writing Gym',
  description: '렌즈로 아이디어를 찾고, 빈칸·이어쓰기 발판으로 짧게 쓰고, 고친 버전을 따라 쓰며 Band 6.0→7.0을 만드는 IELTS 라이팅 연습장',
};

export default function IELTSLayout({ children }: { children: React.ReactNode }) {
  return <div className={lora.variable}>{children}</div>;
}
