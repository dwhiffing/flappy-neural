import { Menu } from './scenes/Menu'
import { Flappy } from './scenes/Flappy'
import { AUTO, Game, Scale, Types } from 'phaser'
import { Breakout } from './scenes/Breakout'

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Types.Core.GameConfig = {
  type: AUTO,
  width: 1024,
  height: 768,
  parent: 'game-container',
  backgroundColor: '#028af8',
  pixelArt: true,
  scale: {
    mode: Scale.FIT,
    autoCenter: Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    // arcade: { debug: true },
  },
  scene: [Menu, Flappy, Breakout],
}

export default new Game(config)
