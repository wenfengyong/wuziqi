import { BoardTheme, BoardThemeId } from '@/types/game';

export const boardThemes: Record<BoardThemeId, BoardTheme> = {
  classic: {
    id: 'classic',
    name: '经典木质',
    description: '传统木纹棋盘，温暖典雅',
    background: '#DEB887',
    backgroundGradient: ['#DEB887', '#D2B48C'],
    lineColor: '#8B4513',
    starPointColor: '#8B4513',
    textColor: '#5D4037',
    preview: 'linear-gradient(135deg, #DEB887, #D2B48C)',
  },
  modern: {
    id: 'modern',
    name: '现代简约',
    description: '简洁明快，现代设计风格',
    background: '#F5F5F5',
    backgroundGradient: ['#FFFFFF', '#E0E0E0'],
    lineColor: '#333333',
    starPointColor: '#333333',
    textColor: '#212121',
    preview: 'linear-gradient(135deg, #FFFFFF, #E0E0E0)',
  },
  stone: {
    id: 'stone',
    name: '复古石板',
    description: '古朴石板纹理，沉稳大气',
    background: '#A0A0A0',
    backgroundGradient: ['#B0B0B0', '#808080'],
    lineColor: '#2F2F2F',
    starPointColor: '#1A1A1A',
    textColor: '#1A1A1A',
    preview: 'linear-gradient(135deg, #B0B0B0, #808080)',
  },
  bamboo: {
    id: 'bamboo',
    name: '竹韵清风',
    description: '清新竹纹，自然雅致',
    background: '#C8E6C9',
    backgroundGradient: ['#A5D6A7', '#81C784'],
    lineColor: '#2E7D32',
    starPointColor: '#1B5E20',
    textColor: '#1B5E20',
    preview: 'linear-gradient(135deg, #A5D6A7, #81C784)',
  },
  neon: {
    id: 'neon',
    name: '霓虹炫彩',
    description: '赛博朋克风格，炫酷夺目',
    background: '#1A1A2E',
    backgroundGradient: ['#16213E', '#0F0F23'],
    lineColor: '#00FFFF',
    starPointColor: '#FF00FF',
    textColor: '#FFFFFF',
    preview: 'linear-gradient(135deg, #16213E, #0F0F23)',
  },
};

export const getBoardTheme = (themeId: BoardThemeId): BoardTheme => {
  return boardThemes[themeId] || boardThemes.classic;
};

export const boardThemeList = Object.values(boardThemes);
