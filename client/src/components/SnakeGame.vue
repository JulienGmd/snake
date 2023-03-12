<script setup lang="ts">
import { onMounted, ref } from 'vue'
import gsap from 'gsap'
import ButtonPrimary from './ButtonPrimary.vue'
import ModalAction from './ModalAction.vue'
import SnakeTutorial from './SnakeTutorial.vue'

const CANVAS_SIZE = 500
const COLUMNS = 16
const ROWS = 16
const MIN_TICK_TIME = 120
const MAX_TICK_TIME = 300
const MIN_SNAKE_WIDTH = 10
const MAX_SNAKE_WIDTH = 26

const canvas = ref<HTMLCanvasElement | null>()
let ctx: CanvasRenderingContext2D
const state = ref<'pre-game' | 'playing' | 'game-over' | 'win'>('pre-game')
let score: number
let bodyPositions: { col: number; row: number }[]
let fruitPosition: { col: number; row: number }
let direction: { x: number; y: number }
/** Direction that will be applied on next tick */
let newDirection: { x: number; y: number }
let tickTime: number
let animatedHeadPos: { x: number; y: number }
let animatedTailPos: { x: number; y: number }

onMounted(() => {
  if (!canvas.value) return
  ctx = canvas.value.getContext('2d')!
  canvas.value.width = CANVAS_SIZE
  canvas.value.height = CANVAS_SIZE
  restart()
})

function restart() {
  state.value = 'pre-game'
  score = 0
  const headPos = { col: COLUMNS / 2, row: ROWS / 2 }
  bodyPositions = [
    headPos,
    { col: headPos.col - 1, row: headPos.row },
    { col: headPos.col - 2, row: headPos.row }
  ]
  fruitPosition = { col: 0, row: 0 }
  direction = { x: 1, y: 0 }
  newDirection = { x: 1, y: 0 }
  tickTime = MAX_TICK_TIME
  animatedHeadPos = bodyPosToXY(bodyPositions[0])
  animatedTailPos = bodyPosToXY(bodyPositions[bodyPositions.length - 1])

  spawnFruit()
  drawAll()
  document.addEventListener('keydown', (e) => {
    const bChangeDirection = tryChangeDirection(e)
    if (state.value === 'pre-game' && bChangeDirection) {
      tick()
    }
  })
}

function tick() {
  state.value = 'playing'
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
    state.value = 'game-over'
    return
  }

  if (isBodyPartAt(newHeadPosition.col, newHeadPosition.row, true)) {
    // Hit the body
    state.value = 'game-over'
    return
  }

  if (bEat) {
    score++

    const bWin = !spawnFruit()
    if (bWin) {
      // Win
      state.value = 'win'
      return
    }

    // Increase speed
    const cellAmount = COLUMNS * ROWS
    tickTime = Math.max(
      MIN_TICK_TIME,
      MAX_TICK_TIME - (bodyPositions.length / cellAmount) * (MAX_TICK_TIME - MIN_TICK_TIME)
    )
  }

  // Animate head and tail
  const newHeadPositionPx = bodyPosToXY(newHeadPosition)
  gsap.to(animatedHeadPos, {
    x: newHeadPositionPx.x,
    y: newHeadPositionPx.y,
    duration: tickTime / 1000,
    ease: 'none',
    onUpdate: () => drawAll()
  })
  const newTailPositionPx = bodyPosToXY(bodyPositions[bodyPositions.length - 1])
  gsap.to(animatedTailPos, {
    x: newTailPositionPx.x,
    y: newTailPositionPx.y,
    duration: tickTime / 1000,
    ease: 'none'
  })

  drawAll()

  setTimeout(() => tick(), tickTime)
}

function drawAll() {
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
  drawFullBody()
  drawFruit()
}

function drawFullBody() {
  // body
  ctx.beginPath()
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.strokeStyle = 'black'
  ctx.moveTo(animatedHeadPos.x, animatedHeadPos.y)
  const points = bodyPositions.map((pos) => bodyPosToXY(pos))
  // Start from 1 to skip the real head location (which is ahead of the animated head)
  for (let i = 1; i < points.length; i++) {
    ctx.lineWidth = getBodyLineWidth(i)
    ctx.lineTo(points[i].x, points[i].y)
    ctx.stroke()
  }
  ctx.lineTo(animatedTailPos.x, animatedTailPos.y)
  ctx.stroke()

  // eyes
  ctx.beginPath()
  ctx.fillStyle = 'white'
  ctx.arc(
    animatedHeadPos.x + direction.x * 3,
    animatedHeadPos.y + direction.y * 3,
    MAX_SNAKE_WIDTH * 0.27,
    0,
    Math.PI * 2
  )
  ctx.fill()
  ctx.beginPath()
  ctx.fillStyle = 'black'
  ctx.arc(
    animatedHeadPos.x + direction.x * 5,
    animatedHeadPos.y + direction.y * 5,
    MAX_SNAKE_WIDTH * 0.15,
    0,
    Math.PI * 2
  )
  ctx.fill()
}

function getBodyLineWidth(index: number) {
  return MAX_SNAKE_WIDTH - (MAX_SNAKE_WIDTH - MIN_SNAKE_WIDTH) * (index / (COLUMNS * ROWS))
}

function bodyPosToXY(bodyPos: { col: number; row: number }): { x: number; y: number } {
  const cellSize = CANVAS_SIZE / COLUMNS
  return { x: bodyPos.col * cellSize + cellSize / 2, y: bodyPos.row * cellSize + cellSize / 2 }
}

function tryChangeDirection(e: KeyboardEvent): Boolean {
  switch (e.key) {
    case 'ArrowUp':
      if (direction.y === 1) return false
      newDirection = { x: 0, y: -1 }
      return true
    case 'ArrowDown':
      if (direction.y === -1) return false
      newDirection = { x: 0, y: 1 }
      return true
    case 'ArrowLeft':
      if (direction.x === 1) return false
      newDirection = { x: -1, y: 0 }
      return true
    case 'ArrowRight':
      if (direction.x === -1) return false
      newDirection = { x: 1, y: 0 }
      return true
  }
  return false
}

/**
 * Spawns a fruit at a random free cell
 * @returns true if fruit was spawned, false if there are no more free cells
 */
function spawnFruit(): Boolean {
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

function isBodyPartAt(col: number, row: number, ignoreHead = false): Boolean {
  return bodyPositions.some((part, index) => {
    if (ignoreHead && index === 0) return false
    return part.col === col && part.row === row
  })
}
</script>

<template>
  <div class="relative">
    <ModalAction :show="state === 'game-over'">
      <template #title>Défaite</template>
      <template #content>
        Score : <span class="font-medium">{{ score }}</span>
      </template>
      <template #actions>
        <ButtonPrimary @click="restart">Rejouer</ButtonPrimary>
      </template>
    </ModalAction>
    <ModalAction :show="state === 'win'">
      <template #title>Victoire! 🎉</template>
      <template #content> Score : {{ score }} </template>
      <template #actions>
        <ButtonPrimary @click="restart">Rejouer</ButtonPrimary>
      </template>
    </ModalAction>
    <SnakeTutorial v-if="state === 'pre-game'" />
    <canvas ref="canvas" class="canvas rounded-md shadow-2xl"></canvas>
  </div>
</template>

<style scoped>
.canvas {
  --cell-size: calc(100% / v-bind('COLUMNS'));
  --tint: theme(colors.green.DEFAULT / 96.5%);
  background-image: linear-gradient(to right, var(--tint), var(--tint)),
    linear-gradient(to right, black 50%, white 50%),
    linear-gradient(to bottom, black 50%, white 50%);
  background-blend-mode: normal, difference, normal;
  background-size: calc(var(--cell-size) * 2) calc(var(--cell-size) * 2);
}
</style>
