import { Scene } from 'phaser'

export class Brick extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y, 'brick')
    this.scene.add.existing(this)
    this.scene.physics.add.existing(this)
    this.setScale(2, 1).setOrigin(0)
    const body = this.body as Phaser.Physics.Arcade.Body
    body.setAllowGravity(false)
  }

  spawn(x: number, y: number) {
    this.x = x
    this.y = y
    this.setActive(true)
    this.setVisible(true)
  }

  kill() {
    this.x = -999
    this.y = -999
    this.setVelocityX(0)
    this.setActive(false)
    this.setVisible(false)
  }
}
