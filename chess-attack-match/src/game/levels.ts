import type { LevelConfig } from './types'

export const levels: LevelConfig[] = [
    {
        id: 1,
        title: 'Opening Score',
        moveLimit: 30, // Increased from 20
        allowedPieces: ['knight', 'rook'],
        goal: {
            type: 'score',
            target: 50000, // Increased to 50k
        },
    },
    {
        id: 2,
        title: 'Ice Breaker',
        moveLimit: 35, // Increased from 25
        allowedPieces: ['knight', 'rook', 'bishop'],
        goal: {
            type: 'clearObstacles',
            obstacleType: 'ice',
            target: 3, // Reduced from 5
        },
        obstacles: [
            { type: 'ice', position: { row: 2, col: 2 } },
            { type: 'ice', position: { row: 2, col: 5 } },
            { type: 'ice', position: { row: 5, col: 2 } },
            { type: 'ice', position: { row: 5, col: 5 } },
            { type: 'ice', position: { row: 3, col: 4 } },
        ],
    },
    {
        id: 3,
        title: 'King Drop',
        moveLimit: 40, // Increased from 30
        allowedPieces: ['knight', 'rook', 'bishop', 'pawn'],
        goal: {
            type: 'dropTokens',
            tokenType: 'king',
            target: 1,
        },
        specialTokens: [
            { type: 'king', position: { row: 0, col: 4 } },
        ],
    },
    {
        id: 4,
        title: 'Clear Everything',
        moveLimit: 50, // Increased from 35
        allowedPieces: ['knight', 'rook', 'bishop', 'pawn'],
        goal: {
            type: 'clearBoard',
        },
    },
    {
        id: 5,
        title: 'Score & Clear',
        moveLimit: 35, // Increased from 25
        allowedPieces: ['knight', 'rook', 'bishop', 'pawn'],
        goal: {
            type: 'combination',
            goals: [
                { type: 'score', target: 18000 }, // Reduced from 25000
                { type: 'clearObstacles', obstacleType: 'crate', target: 2 }, // Reduced from 3
            ],
        },
        obstacles: [
            { type: 'crate', position: { row: 1, col: 1 } },
            { type: 'crate', position: { row: 1, col: 6 } },
            { type: 'crate', position: { row: 6, col: 3 } },
        ],
    },
    {
        id: 6,
        title: 'Speed Challenge',
        moveLimit: 20,
        allowedPieces: ['knight', 'rook', 'bishop', 'pawn'],
        goal: {
            type: 'score',
            target: 30000,
        },
    },
    {
        id: 7,
        title: 'Collect Knights',
        moveLimit: 40,
        allowedPieces: ['knight', 'rook', 'bishop', 'pawn'],
        goal: {
            type: 'score',
            target: 25000,
        },
    },
    {
        id: 8,
        title: 'Reach Bottom',
        moveLimit: 30,
        allowedPieces: ['knight', 'rook', 'bishop', 'pawn'],
        goal: {
            type: 'dropTokens',
            tokenType: 'king',
            target: 2,
        },
        specialTokens: [
            { type: 'king', position: { row: 0, col: 2 } },
            { type: 'king', position: { row: 0, col: 4 } },
        ],
    },
]

