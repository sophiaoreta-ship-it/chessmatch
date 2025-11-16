# Chess Attack Match

A match-3 puzzle game with chess-themed pieces and unique pattern matching mechanics.

## Features

- **Chess-themed gameplay**: Match pieces (Knight, Rook, Bishop, Pawn) by forming specific patterns
- **Special tiles**: Create striped pieces that clear entire rows or columns
- **Multiple level types**: Score challenges, obstacle clearing, token dropping, and more
- **Beautiful UI**: Glassmorphism design with smooth animations
- **Hint system**: Automatic hints after 15 seconds of inactivity

## How to Play

1. **Knight (♞)**: Match exactly 4 tiles in an L-shape
2. **Rook (♜)**: Match at least 3 tiles in a straight line (horizontal or vertical)
3. **Bishop (♝)**: Match at least 3 tiles in a diagonal line
4. **Pawn (♟)**: Match exactly 4 tiles in a 2×2 square

### Special Tiles

- **Striped pieces**: Created by matching 4 Rook or Bishop tiles. When matched, they clear an entire row or column!

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
chess-attack/
├── chess-attack-match/    # Main game application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── game/          # Game logic
│   │   ├── state/         # State management (Zustand)
│   │   └── design/        # Design tokens
│   └── public/            # Static assets
└── package.json           # Root package configuration
```

## Technologies

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management

## License

Private project

