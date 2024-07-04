import { Scene } from 'phaser'

export class Text extends Phaser.GameObjects.Text {
  constructor(
    x: number,
    y: number,
    scene: Phaser.Scene,
    text: string,
    sceneKey: string,
  ) {
    super(
      scene,
      x + scene.cameras.main.width / 2,
      y + scene.cameras.main.height / 2,
      text,
      { fontSize: 40 },
    )
    this.setOrigin(0.5)
    this.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, this.width, this.height),
      Phaser.Geom.Rectangle.Contains,
    )
    this.on('pointerdown', () => this.scene.scene.start(sceneKey))
  }
}

export class Menu extends Scene {
  constructor() {
    super('Menu')
  }
  create() {
    const text = new Text(0, 0, this, 'Flappy Bird', 'Flappy')
    // const text2 = new Text(0, 0, this, 'Breakout', 'Breakout')
    this.add.existing(text)
  }
}
