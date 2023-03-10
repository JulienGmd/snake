const CANVAS_SIZE = 500
const COLUMNS = 20
const ROWS = 20
const MIN_TICK_TIME = 50
const MAX_TICK_TIME = 500

class SnakeGame {
    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    private bodyPositions: { col: number; row: number }[]
    private fruitPosition = { col: 0, row: 0 }
    private direction = { x: 1, y: 0 }
    /** Direction that will be applied on next tick */
    private newDirection = { x: 1, y: 0 }
    private tickTime = MAX_TICK_TIME

    constructor(canvasId: string) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.ctx = this.canvas.getContext("2d")!
        this.canvas.width = CANVAS_SIZE
        this.canvas.height = CANVAS_SIZE
        const headPos = { col: COLUMNS / 2, row: ROWS / 2 }
        this.bodyPositions = [
            headPos,
            { col: headPos.col - 1, row: headPos.row },
            { col: headPos.col - 2, row: headPos.row }
        ]
        this.spawnFruit()
        document.addEventListener('keydown', (e) => this.tryChangeDirection(e))
        this.tick()
    }

    private tick() {
        this.direction = this.newDirection

        const newHeadPosition = { col: this.bodyPositions[0].col + this.direction.x, row: this.bodyPositions[0].row + this.direction.y }

        let bEat = false
        if (newHeadPosition.col === this.fruitPosition.col && newHeadPosition.row === this.fruitPosition.row) {
            bEat = true
        }

        // Move body
        this.bodyPositions.unshift(newHeadPosition)
        if (!bEat) this.bodyPositions.pop()

        if (newHeadPosition.col < 0 || newHeadPosition.col >= COLUMNS || newHeadPosition.row < 0 || newHeadPosition.row >= ROWS) {
            // Hit the wall
            alert('Game Over - Hit the wall')
            return
        }

        if (this.isBodyPartAt(newHeadPosition.col, newHeadPosition.row, true)) {
            // Hit the body
            alert('Game Over - Hit the body')
            return
        }

        if (bEat) {
            const bWin = !this.spawnFruit()
            if (bWin) {
                // Win
                alert('You win!')
                return
            }

            // Increase speed
            const cellAmount = COLUMNS * ROWS
            this.tickTime = Math.max(MIN_TICK_TIME, MAX_TICK_TIME - (this.bodyPositions.length / cellAmount) * (MAX_TICK_TIME - MIN_TICK_TIME))
        }

        // Draw
        this.ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
        this.drawBody()
        this.drawFruit()

        setTimeout(() => this.tick(), this.tickTime)
    }

    private drawBody() {
        this.bodyPositions.forEach((part) => this.drawBodyPartAt(part.col, part.row))
    }

    private drawBodyPartAt(col: number, row: number) {
        this.ctx.fillStyle = 'red'
        const columnSize = CANVAS_SIZE / COLUMNS
        const rowSize = CANVAS_SIZE / ROWS
        this.ctx.fillRect(col * columnSize, row * rowSize, columnSize, rowSize)
    }

    private tryChangeDirection(e: KeyboardEvent) {
        switch (e.key) {
            case 'ArrowUp':
                if (this.direction.y === 1) return
                this.newDirection = { x: 0, y: -1 }
                break
            case 'ArrowDown':
                if (this.direction.y === -1) return
                this.newDirection = { x: 0, y: 1 }
                break
            case 'ArrowLeft':
                if (this.direction.x === 1) return
                this.newDirection = { x: -1, y: 0 }
                break
            case 'ArrowRight':
                if (this.direction.x === -1) return
                this.newDirection = { x: 1, y: 0 }
                break
        }
    }

    /**
     * Spawns a fruit at a random free cell
     * @returns true if fruit was spawned, false if there are no more free cells
     */
    private spawnFruit() {
        const availableCells = []
        for (let col = 0; col < COLUMNS; col++) {
            for (let row = 0; row < ROWS; row++) {
                if (!this.isBodyPartAt(col, row)) {
                    availableCells.push({ col, row })
                }
            }
        }
        if (availableCells.length === 0) return false

        const randomIndex = Math.round(Math.random() * availableCells.length - 1)
        this.fruitPosition = availableCells[randomIndex]
        this.drawFruit()
        return true
    }

    private drawFruit() {
        this.ctx.fillStyle = 'green'
        const columnSize = CANVAS_SIZE / COLUMNS
        const rowSize = CANVAS_SIZE / ROWS
        this.ctx.fillRect(this.fruitPosition.col * columnSize, this.fruitPosition.row * rowSize, columnSize, rowSize)
    }

    private isBodyPartAt(col: number, row: number, ignoreHead = false) {
        return this.bodyPositions.some((part, index) => {
            if (ignoreHead && index === 0) return false
            return part.col === col && part.row === row
        })
    }
}


const game = new SnakeGame('canvas')