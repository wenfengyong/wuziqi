import type { Metadata } from 'next';
import { GameProvider } from '@/context/GameContext';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: '五子棋游戏',
  description: '一个现代化的五子棋游戏，支持多种主题和游戏模式',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <GameProvider>{children}</GameProvider>
      </body>
    </html>
  );
}
