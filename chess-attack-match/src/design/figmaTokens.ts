/**
 * Design tokens extracted from Figma design
 * Source: https://www.figma.com/design/LzyMO29BV84Pw5k5Uh48XO/Untitled?node-id=5-8
 */

export const figmaColors = {
  // Primary colors
  primaryBlue: 'rgba(80, 168, 235, 0.9)', // #50A8EB
  primaryBlueSolid: '#50A8EB',
  darkBlue: 'rgba(0, 31, 55, 0.9)', // #001F37
  darkBlueSolid: '#001F37',
  lightBlueText: '#d0eaff',
  borderBlue: '#4e97d5',
  yellowProgress: '#ffff58',
  white: '#ffffff',
  black: '#000000',
  
  // Gradients
  panelGradient: 'linear-gradient(90deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.2) 100%), linear-gradient(90deg, rgba(80, 168, 235, 0.9) 0%, rgba(80, 168, 235, 0.9) 100%)',
  goalBoxGradient: 'linear-gradient(90deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.2) 100%), linear-gradient(4.016601664090615deg, rgba(0, 100, 178, 0.9) 9.1239%, rgba(0, 43, 76, 0.9) 157.69%)',
  progressBarGradient: 'linear-gradient(90deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.2) 100%), linear-gradient(90deg, rgba(0, 31, 55, 0.9) 0%, rgba(0, 31, 55, 0.9) 100%)',
}

export const figmaTypography = {
  // Font families
  besley: "'Besley', serif",
  cabin: "'Cabin', sans-serif",
  
  // Font sizes (from Figma)
  levelNumber: '100.8px', // Large level number
  goalScore: '64px', // Goal score display
  coinHeart: '24px', // Coins and hearts text
  label: '20.16px', // Labels like "Moves left", "Level 1 Goal:"
  progressText: '16px', // Progress text like "1300/50,000"
  
  // Font weights
  regular: 400,
  semibold: 600,
  bold: 700,
}

export const figmaSpacing = {
  // Gaps
  xs: '4px',
  sm: '5px',
  md: '10px',
  lg: '12.6px',
  xl: '16px',
  xxl: '44px',
  xxxl: '46px',
  huge: '60px',
  
  // Padding
  panelPadding: '16px 11px',
  buttonPadding: '12.6px',
  
  // Border radius
  panelRadius: '24px',
  goalBoxRadius: '8px',
  progressBarRadius: '24px',
}

export const figmaShadows = {
  panel: '0px 4px 4px 0px rgba(0,0,0,0.3), 0px 8px 16.4px 0px #1c0c78',
  inset: 'inset 0px 0px 4px 0px rgba(0,0,0,0.25)',
  textShadow: '0px 5.04px 5.04px rgba(0,0,0,0.5)',
}

// Image URLs from Figma (valid for 7 days)
export const figmaImages = {
  desktopBackground: 'https://www.figma.com/api/mcp/asset/4570e412-10cc-4caa-b107-25631cd31900',
  coinIcon: 'https://www.figma.com/api/mcp/asset/68050db6-2291-4672-af3c-fb8f4083e0e5',
  heartIcon: 'https://www.figma.com/api/mcp/asset/2a4411f8-bffe-4b12-8370-21fcc195360a',
  avatarEllipse: 'https://www.figma.com/api/mcp/asset/49e47354-0dea-4183-8645-bc50cd6da051',
  avatarMask: 'https://www.figma.com/api/mcp/asset/c9df80cd-b250-4b56-ada7-f742f676522d',
  avatarImage: 'https://www.figma.com/api/mcp/asset/5c1fbbd2-1432-4b8d-95cd-0b5bce63fdc8',
  gameBoard: 'https://www.figma.com/api/mcp/asset/8c54a296-7a3e-40f8-aaf0-edceec6ed521',
}

