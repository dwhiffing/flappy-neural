import { Scene } from 'phaser'

export class Pipe extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y, 'pipe')
    this.scene.add.existing(this)
    this.scene.physics.add.existing(this)
    const body = this.body as Phaser.Physics.Arcade.Body
    body.setAllowGravity(false)
  }

  spawn(y: number, velocity: number, origin: number) {
    this.x = this.scene.cameras.main.width * 1.1
    this.y = y
    this.setVelocityX(-velocity)
    this.setActive(true)
    this.setVisible(true)
    this.setOrigin(0.5, origin)
  }

  kill() {
    this.x = -999
    this.y = -999
    this.setVelocityX(0)
    this.setActive(false)
    this.setVisible(false)
  }
}
