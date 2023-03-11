<script setup lang="ts">
import { onMounted, ref } from 'vue'

const CANVAS_SIZE = 500
const COLUMNS = 16
const ROWS = 16
const MIN_TICK_TIME = 100
const MAX_TICK_TIME = 300

const canvas = ref<HTMLCanvasElement | null>()
let ctx: CanvasRenderingContext2D
let bodyPositions: { col: number; row: number }[]
let fruitPosition = { col: 0, row: 0 }
let direction = { x: 1, y: 0 }
/** Direction that will be applied on next tick */
let newDirection = { x: 1, y: 0 }
let tickTime = MAX_TICK_TIME

onMounted(() => {
  if (!canvas.value) return
  ctx = canvas.value.getContext('2d')!
  canvas.value.width = CANVAS_SIZE
  canvas.value.height = CANVAS_SIZE
  const headPos = { col: COLUMNS / 2, row: ROWS / 2 }
  bodyPositions = [
    headPos,
    { col: headPos.col - 1, row: headPos.row },
    { col: headPos.col - 2, row: headPos.row }
  ]
  spawnFruit()
  document.addEventListener('keydown', (e) => tryChangeDirection(e))
  tick()
})

function tick() {
  direction = newDirection

  const newHeadPosition = {
    col: bodyPositions[0].col + direction.x,
    row: bodyPositions[0].row + direction.y
  }

  let bEat = false
  if (newHeadPosition.col === fruitPosition.col && newHeadPosition.row === fruitPosition.row) {
    bEat = true
  }

  // Move body
  bodyPositions.unshift(newHeadPosition)
  if (!bEat) bodyPositions.pop()

  if (
    newHeadPosition.col < 0 ||
    newHeadPosition.col >= COLUMNS ||
    newHeadPosition.row < 0 ||
    newHeadPosition.row >= ROWS
  ) {
    // Hit the wall
    alert('Game Over - Hit the wall')
    return
  }

  if (isBodyPartAt(newHeadPosition.col, newHeadPosition.row, true)) {
    // Hit the body
    alert('Game Over - Hit the body')
    return
  }

  if (bEat) {
    const bWin = !spawnFruit()
    if (bWin) {
      // Win
      alert('You win!')
      return
    }

    // Increase speed
    const cellAmount = COLUMNS * ROWS
    tickTime = Math.max(
      MIN_TICK_TIME,
      MAX_TICK_TIME - (bodyPositions.length / cellAmount) * (MAX_TICK_TIME - MIN_TICK_TIME)
    )
  }

  // Draw
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
  drawBody()
  drawFruit()

  setTimeout(() => tick(), tickTime)
}

function drawBody() {
  bodyPositions.forEach((part) => drawBodyPartAt(part.col, part.row))
}

function drawBodyPartAt(col: number, row: number) {
  ctx.fillStyle = 'red'
  const columnSize = CANVAS_SIZE / COLUMNS
  const rowSize = CANVAS_SIZE / ROWS
  ctx.fillRect(col * columnSize, row * rowSize, columnSize, rowSize)
}

function tryChangeDirection(e: KeyboardEvent) {
  switch (e.key) {
    case 'ArrowUp':
      if (direction.y === 1) return
      newDirection = { x: 0, y: -1 }
      break
    case 'ArrowDown':
      if (direction.y === -1) return
      newDirection = { x: 0, y: 1 }
      break
    case 'ArrowLeft':
      if (direction.x === 1) return
      newDirection = { x: -1, y: 0 }
      break
    case 'ArrowRight':
      if (direction.x === -1) return
      newDirection = { x: 1, y: 0 }
      break
  }
}

/**
 * Spawns a fruit at a random free cell
 * @returns true if fruit was spawned, false if there are no more free cells
 */
function spawnFruit() {
  const availableCells = []
  for (let col = 0; col < COLUMNS; col++) {
    for (let row = 0; row < ROWS; row++) {
      if (!isBodyPartAt(col, row)) {
        availableCells.push({ col, row })
      }
    }
  }
  if (availableCells.length === 0) return false

  const randomIndex = Math.round(Math.random() * (availableCells.length - 1))
  fruitPosition = availableCells[randomIndex]
  drawFruit()
  return true
}

function drawFruit() {
  ctx.fillStyle = 'green'
  const columnSize = CANVAS_SIZE / COLUMNS
  const rowSize = CANVAS_SIZE / ROWS
  ctx.fillRect(fruitPosition.col * columnSize, fruitPosition.row * rowSize, columnSize, rowSize)
}

function isBodyPartAt(col: number, row: number, ignoreHead = false) {
  return bodyPositions.some((part, index) => {
    if (ignoreHead && index === 0) return false
    return part.col === col && part.row === row
  })
}
</script>

<template>
  <canvas ref="canvas" class="canvas"></canvas>
</template>

<style scoped>
.canvas {
  --cell-size: calc(100% / v-bind('COLUMNS'));
  --tint: rgba(130, 255, 90, 0.96);
  background-image: linear-gradient(to right, var(--tint), var(--tint)),
    linear-gradient(to right, black 50%, white 50%),
    linear-gradient(to bottom, black 50%, white 50%);
  background-blend-mode: normal, difference, normal;
  background-size: calc(var(--cell-size) * 2) calc(var(--cell-size) * 2);
}
</style>
