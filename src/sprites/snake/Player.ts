import { TINTS } from '../../constants'
import { NeuralNetwork } from '../../neat'
import { Snake } from '../../scenes/Snake'

export class Player {
  network: NeuralNetwork
  index: number
  active: boolean
  data: [number, number][]
  direction: number
  scene: Snake
  tint: number
  graphics: Phaser.GameObjects.Graphics

  constructor(scene: Snake) {
    this.scene = scene
    this.graphics = this.scene.add.graphics()
    this.graphics.setDepth(99)
    this.active = false
    this.data = []
    this.direction = 1
  }

  spawn = (index: number, network = new NeuralNetwork(5, 1)) => {
    this.network = network
    this.index = index
    this.active = true
    const [width, height] = this.scene.getBounds()
    const startX = Phaser.Math.Between(2, width - 2)
    const startY = Phaser.Math.Between(2, height - 2)
    this.data = [
      [startX - 3, startY],
      [startX - 2, startY],
      [startX - 1, startY],
      [startX, startY],
    ]
    this.direction = 1
    this.tick()
    this.tint = TINTS[index % TINTS.length]
    this.graphics.fillStyle(this.tint, 1)
  }

  kill = () => {
    this.graphics.clear()
    this.active = false
  }

  left() {
    if (this.direction === 1) return
    this.direction = 3
  }

  right() {
    if (this.direction === 3) return
    this.direction = 1
  }

  up() {
    if (this.direction === 2) return
    this.direction = 0
  }

  down() {
    if (this.direction === 0) return
    this.direction = 2
  }

  tick() {
    const head = this.data.at(-1) ?? [0, 0]
    let [x, y] = head

    const [width, height] = this.scene.getBounds()

    if (this.direction === 0) {
      y -= 1
    } else if (this.direction === 1) {
      x += 1
    } else if (this.direction === 2) {
      y += 1
    } else if (this.direction === 3) {
      x -= 1
    }
    if (
      x < 0 ||
      y < 0 ||
      x > width ||
      y > height ||
      this.data.some(([_x, _y]) => x === _x && y === _y)
    ) {
      return this.kill()
    }

    this.data.push([x, y])
    const food = this.scene.foodEntries.find((f) => f.index == this.index)
    if (food) {
      if (food._x === x && food._y === y) {
        this.scene.data.inc('currentScore', 1)
        this.network.fitness += 100
        food.spawn(this.index, this.data)
      } else {
        this.data.shift()
      }
    }
    this.update()
  }

  turnLeft() {
    if (this.direction === 0) {
      this.direction = 3
    } else if (this.direction === 1) {
      this.direction = 0
    } else if (this.direction === 2) {
      this.direction = 1
    } else if (this.direction === 3) {
      this.direction = 2
    }
  }

  turnRight() {
    if (this.direction === 0) {
      this.direction = 1
    } else if (this.direction === 1) {
      this.direction = 2
    } else if (this.direction === 2) {
      this.direction = 3
    } else if (this.direction === 3) {
      this.direction = 0
    }
  }

  update = () => {
    if (!this.active) return
    this.graphics.clear()
    const [size, buffer] = this.scene.getSize()

    this.graphics.fillStyle(this.tint, 1)
    this.data.forEach(([x, y]) => {
      this.graphics.fillRect(
        x * (size + buffer),
        y * (size + buffer),
        size,
        size,
      )
    })

    const food = this.scene.foodEntries.find((f) => f.index == this.index)
    if (!food) return

    const [width, height] = this.scene.getBounds()
    const head = this.data.at(-1) ?? [0, 0]

    const inputs = [
      head[0] / width,
      head[1] / height,
      this.direction / 3,
      food._x / width,
      food._y / height,
    ]

    const distance = Phaser.Math.Distance.Between(
      head[0],
      head[1],
      food._x,
      food._y,
    )

    const maxDistance = Phaser.Math.Distance.Between(0, 0, width, height)
    const val = distance / maxDistance
    if (this.scene.isPlayMode) return

    this.network.fitness += 1 - val
    const output = this.network.predict(inputs)
    if (output[0] < 0.33) {
      this.turnLeft()
    } else if (output[0] < 0.66) {
      this.turnRight()
    } else {
    }
  }
}
