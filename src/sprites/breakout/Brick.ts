import { BREAKOUT_CONFIG as CONFIG, TINTS } from '../../constants'
import { Scene } from 'phaser'

export class Brick extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body
  index: number

  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y, 'brick')
    this.scene.add.existing(this)
    this.scene.physics.add.existing(this)
    this.setOrigin(0).setImmovable(true)
    this.setAlpha(0.33)
  }

  spawn(index: number, x: number, y: number) {
    this.index = index
    this.x = x
    this.y = y
    this.setActive(true)
    this.setVisible(true).setScale(2 * CONFIG.brickSize, 1 * CONFIG.brickSize)
    this.setTint(TINTS[index % TINTS.length])
  }

  kill() {
    this.x = -999
    this.y = -999
    this.setVelocityX(0)
    this.setActive(false)
    this.setVisible(false)
  }
}
