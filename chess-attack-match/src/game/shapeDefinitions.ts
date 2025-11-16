export type RelativePoint = {
    row: number
    col: number
}

const baseKnightShape: RelativePoint[] = [
    { row: 0, col: 0 },
    { row: 1, col: 0 },
    { row: 2, col: 0 },
    { row: 2, col: 1 },
]

const rotatePoint = (
    point: RelativePoint,
    turns: number,
): RelativePoint => {
    const { row, col } = point
    switch (turns % 4) {
        case 0:
            return { row, col }
        case 1:
            return { row: col, col: -row }
        case 2:
            return { row: -row, col: -col }
        case 3:
            return { row: -col, col: row }
        default:
            return point
    }
}

const normalizeShape = (points: RelativePoint[]): RelativePoint[] => {
    const minRow = Math.min(...points.map((point) => point.row))
    const minCol = Math.min(...points.map((point) => point.col))

    return points.map((point) => ({
        row: point.row - minRow,
        col: point.col - minCol,
    }))
}

const mirrorShape = (points: RelativePoint[]): RelativePoint[] =>
    points.map((point) => ({ row: point.row, col: -point.col }))

export const knightShapes: RelativePoint[][] = (() => {
    const shapes = new Map<string, RelativePoint[]>()

    for (let rotation = 0; rotation < 4; rotation += 1) {
        const rotated = baseKnightShape.map((point) =>
            rotatePoint(point, rotation),
        )
        const normalizedRotated = normalizeShape(rotated)
        const rotatedKey = normalizedRotated
            .map((point) => `${point.row}:${point.col}`)
            .sort()
            .join('|')
        if (!shapes.has(rotatedKey)) {
            shapes.set(rotatedKey, normalizedRotated)
        }

        const mirrored = normalizeShape(mirrorShape(rotated))
        const mirroredKey = mirrored
            .map((point) => `${point.row}:${point.col}`)
            .sort()
            .join('|')

        if (!shapes.has(mirroredKey)) {
            shapes.set(mirroredKey, mirrored)
        }
    }

    return Array.from(shapes.values())
})()



