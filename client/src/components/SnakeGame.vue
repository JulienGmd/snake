<script setup lang="ts">
import { onMounted, ref } from 'vue'
import ButtonPrimary from './ButtonPrimary.vue'
import ModalAction from './ModalAction.vue'
import SnakeTutorial from './SnakeTutorial.vue'

const CANVAS_SIZE = 500
const COLUMNS = 16
const ROWS = 16
const MIN_TICK_TIME = 100
const MAX_TICK_TIME = 300

const canvas = ref<HTMLCanvasElement | null>()
let ctx: CanvasRenderingContext2D
let playing = false
let score: number
let bodyPositions: { col: number; row: number }[]
let fruitPosition: { col: number; row: number }
let direction: { x: number; y: number }
/** Direction that will be applied on next tick */
let newDirection: { x: number; y: number }
let tickTime: number
const showTutorial = ref(true)
const showGameOverModal = ref(false)
const showWinModal = ref(false)

onMounted(() => {
  if (!canvas.value) return
  ctx = canvas.value.getContext('2d')!
  canvas.value.width = CANVAS_SIZE
  canvas.value.height = CANVAS_SIZE
  restart()
})

function restart() {
  playing = false
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
  showTutorial.value = true
  showGameOverModal.value = false
  showWinModal.value = false

  spawnFruit()
  draw()
  document.addEventListener('keydown', (e) => {
    const bChangeDirection = tryChangeDirection(e)
    if (!playing && bChangeDirection) {
      showTutorial.value = false
      tick()
    }
  })
}

function tick() {
  playing = true
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
    showGameOverModal.value = true
    playing = false
    return
  }

  if (isBodyPartAt(newHeadPosition.col, newHeadPosition.row, true)) {
    // Hit the body
    showGameOverModal.value = true
    playing = false
    return
  }

  if (bEat) {
    score++

    const bWin = !spawnFruit()
    if (bWin) {
      // Win
      showWinModal.value = true
      playing = false
      return
    }

    // Increase speed
    const cellAmount = COLUMNS * ROWS
    tickTime = Math.max(
      MIN_TICK_TIME,
      MAX_TICK_TIME - (bodyPositions.length / cellAmount) * (MAX_TICK_TIME - MIN_TICK_TIME)
    )
  }

  draw()

  setTimeout(() => tick(), tickTime)
}

function draw() {
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
  drawBody()
  drawFruit()
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
  <div class="relative">
    <ModalAction :show="showGameOverModal">
      <template #title>Défaite</template>
      <template #content>
        Score : <span class="font-medium">{{ score }}</span>
      </template>
      <template #actions>
        <ButtonPrimary @click="restart">Rejouer</ButtonPrimary>
      </template>
    </ModalAction>
    <ModalAction :show="showWinModal">
      <template #title>Victoire! 🎉</template>
      <template #content> Score : {{ score }} </template>
      <template #actions>
        <ButtonPrimary @click="restart">Rejouer</ButtonPrimary>
      </template>
    </ModalAction>
    <SnakeTutorial v-if="showTutorial" />
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
