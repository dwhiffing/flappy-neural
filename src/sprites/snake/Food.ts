import { Scene } from 'phaser'
import { TINTS } from '../../constants'
import { Snake } from '../../scenes/Snake'

export class Food extends Phaser.GameObjects.Sprite {
  declare body: Phaser.Physics.Arcade.Body
  declare scene: Snake
  index: number
  _x: number
  _y: number

  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y, 'brick')
    this.scene.add.existing(this).setOrigin(0)
    this._x = -1
    this._y = -1
  }

  spawn(index: number, invalidPositions: [number, number][] = []) {
    this.index = index

    const [width, height] = this.scene.getBounds()

    let x = -1
    let y = -1
    do {
      x = Phaser.Math.Between(0, width)
      y = Phaser.Math.Between(0, height)
    } while (invalidPositions.some(([_x, _y]) => x === _x && y === _y))
    this._x = x
    this._y = y
    const [size, buffer] = this.scene.getSize()
    this.setDisplaySize(size, size)
    this.setPosition((size + buffer) * x, (size + buffer) * y)
    this.setTint(TINTS[index % TINTS.length])
    this.setActive(true)
    this.setVisible(true).setAlpha(0.33)
  }

  kill() {
    this.setPosition(-999, -999)
    this._x = -1
    this._y = -1
    this.setActive(false)
    this.setVisible(false)
  }
}
