import { Application, Texture, Assets, Container, BlurFilter, Sprite, Graphics, Color, FillGradient, TextStyle, Text } from 'pixi.js';
import { gsap } from "gsap";

class SlotMachineTest {
  constructor({rows = 3, columns = 5, images = []}) {
    this.app = new Application();
    this.images = images;
    this.rows = rows;
    this.columns = columns;
    this.reels = [];
    this.running = false;
  }

  async init() {
    await this.app.init({ background: '#0c93cf', resizeTo: window });
    document.getElementById('app').appendChild(this.app.canvas);
    await Assets.load(this.images);
    this.slotTextures = this.images.map(url => Texture.from(url));
    this.setup();
  }

  setup() {
    this.createReels();
    this.createBottomControl();
    this.app.ticker.add(() => this.updateReels());
  }

  createReels() {
    const reelContainer = new Container();
    const REEL_WIDTH = 210;
    const SYMBOL_SIZE = 190;

    for (let i = 0; i < this.columns; i++) {
      const rc = new Container();
      rc.x = i * REEL_WIDTH;
      reelContainer.addChild(rc);

      const reel = new Reel(rc, this.slotTextures, this.rows, SYMBOL_SIZE);
      this.reels.push(reel);
    }

    reelContainer.y = (this.app.screen.height - SYMBOL_SIZE * this.rows) / 4;
    reelContainer.x = Math.round(this.app.screen.width - REEL_WIDTH * this.columns) / 2;
    this.app.stage.addChild(reelContainer);
  }

  createBottomControl() {
    const bottomContainer = new Container();
    const SYMBOL_SIZE = 190;
    const margin = (this.app.screen.height - SYMBOL_SIZE * 2.5) / 2;
    const bottomControl = new Graphics().rect(0, SYMBOL_SIZE * 3 + margin, this.app.screen.width, margin).fill(0x0b1146);
    const colors = [0xffffff, 0x0c93cf].map((color) => Color.shared.setValue(color).toNumber());
    const fill = new FillGradient(0, 0, 0, 36 * 1.7);

    colors.forEach((number, index) => {
      const ratio = index / colors.length;
      fill.addColorStop(ratio, number);
    });

    const style = new TextStyle({
      fontFamily: 'Arial',
      fontSize: 36,
      fontStyle: 'italic',
      fontWeight: 'bold',
      fill: { fill },
      stroke: { color: 0x4a1850, width: 5 },
      dropShadow: {
        color: 0x000000,
        angle: Math.PI / 6,
        blur: 4,
        distance: 6,
      },
      wordWrap: true,
      wordWrapWidth: 440,
    });

    const playText = new Text({ text: 'Spin!', style });
    playText.x = Math.round((bottomControl.width - playText.width) / 2);
    playText.y = this.app.screen.height - margin + Math.round((margin - playText.height) / 1.1);

    bottomContainer.addChild(bottomControl);
    bottomContainer.addChild(playText);
    this.app.stage.addChild(bottomContainer);

    bottomControl.eventMode = 'static';
    bottomControl.cursor = 'pointer';
    bottomControl.addListener('pointerdown', () => this.startSpin());
  }

  startSpin() {
    if (this.running) return;
    this.running = true;

    const spinTime = 500;

    for (let i = 0; i < this.reels.length; i++) {
      const reel = this.reels[i];
      const extra = Math.floor(Math.random() * 3 + 1);
      const target = reel.position + 10 + i * 5 + extra;
      gsap.to(reel, {
        position: target,
        duration: spinTime / 1000 + i * 0.2,
        ease: 'none',
        onUpdate: () => reel.updateReel(),
        onComplete: () => {
          if (i === this.reels.length - 1) {
            this.running = false;
          }
        },
      });
    }
  }

  updateReels() {
    if (this.running) {
      for (let reel of this.reels) {
        reel.updateReel();
      }
    }
  }
}

class Reel {
  constructor(container, textures, rows, symbolSize) {
    this.container = container;
    this.textures = textures;
    this.rows = rows;
    this.symbolSize = symbolSize;
    this.symbols = [];
    this.position = 0;
    this.blur = new BlurFilter();
    this.blur.strengthX = 0;
    this.blur.strengthY = 0;
    this.container.filters = [this.blur];
    this.createSymbols();
  }

  createSymbols() {
    for (let i = 0; i < this.rows; i++) {
      const symbol = new Sprite(this.textures[Math.floor(Math.random() * this.textures.length)]);
      symbol.y = i * this.symbolSize;
      symbol.scale.x = symbol.scale.y = Math.min(this.symbolSize / symbol.width, this.symbolSize / symbol.height);
      symbol.x = Math.round((this.symbolSize - symbol.width) / 2);
      this.symbols.push(symbol);
      this.container.addChild(symbol);
    }
  }

  updateReel() {
    const pos = this.position % this.symbols.length;
    for (let i = 0; i < this.symbols.length; i++) {
      const symbol = this.symbols[i];
      const prevY = symbol.y;
      const newY = ((pos + i) % this.symbols.length) * this.symbolSize - 5;
      symbol.y = newY;
      if (newY < 0 && prevY > this.symbolSize) {
        symbol.texture = this.textures[Math.floor(Math.random() * this.textures.length)];
        symbol.x = Math.round((this.symbolSize - symbol.width) / 2);
      }
    }
  }
}

(async () => {
  const settings = {
    rows: 3,
    columns: 5,
    images: [
      './assets/images/M00_000.jpg',
      './assets/images/M01_000.jpg',
      './assets/images/M02_000.jpg',
      './assets/images/M03_000.jpg',
      './assets/images/M04_000.jpg',
      './assets/images/M05_000.jpg',
      './assets/images/M06_000.jpg',
      './assets/images/M07_000.jpg',
      './assets/images/M08_000.jpg',
      './assets/images/M09_000.jpg',
      './assets/images/M10_000.jpg',
      './assets/images/M11_000.jpg',
      './assets/images/M12_000.jpg',
    ]
  }

  const slotMachineApp = new SlotMachineTest(settings);
  await slotMachineApp.init();
})();
