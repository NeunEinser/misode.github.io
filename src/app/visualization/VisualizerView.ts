import { AbstractView, DataModel, Path, ModelPath } from "@mcschema/core"
import { BiomeNoiseVisualizer } from "./BiomeNoiseVisualizer"
import { NoiseSettingsVisualizer } from "./NoiseSettingsVisualizer"
import { Visualizer } from "./Visualizer"
import { addListener, removeListener } from 'resize-detector'

export class VisualizerView extends AbstractView {
  ctx: CanvasRenderingContext2D
  visualizer?: Visualizer
  active: boolean
  path?: ModelPath
  el: HTMLElement
  canvas: HTMLCanvasElement
  sourceView: HTMLElement
  gutter: HTMLElement
  controls: HTMLElement
  lastHeight?: string
  dragStart?: number[]
  private redrawTimer? : NodeJS.Timeout

  constructor(model: DataModel, el: HTMLElement) {
    super(model)
    this.el = el
    this.canvas = el.querySelector('canvas') as HTMLCanvasElement
    this.ctx = this.canvas.getContext('2d')!
    this.active = false
    this.gutter = el.parentElement!.querySelector('.gutter') as HTMLElement
    this.sourceView = el.parentElement!.getElementsByTagName('textarea')[0] as HTMLElement
    this.controls = el.querySelector('.visualizer-controls') as HTMLElement

    this.canvas.addEventListener('mousedown', evt => {
      this.dragStart = [evt.offsetX, evt.offsetY]
    })
    this.canvas.addEventListener('mousemove', evt => {
      if (this.dragStart === undefined) return
      if (this.visualizer?.onDrag) {
        this.visualizer.onDrag(this.dragStart[0], this.dragStart[1], evt.offsetX, evt.offsetY)
        this.redraw()
      }
      this.dragStart = [evt.offsetX, evt.offsetY]
    })
    this.canvas.addEventListener('mouseup', evt => {
      this.dragStart = undefined
    })
    this.canvas.addEventListener('resize', () => { 
      console.log('hi');
      this.redraw();
    })
    addListener(this.canvas, el => {
      if(el.clientWidth > 0 && el.clientHeight > 0
          && (el.width != el.clientWidth || el.height != el.clientHeight)) {

        el.width = el.clientWidth;
        el.height = el.clientWidth;
        this.redraw();
      }
    });
  }
  
  redraw() {
    if (this.active && this.visualizer) {
      if(this.redrawTimer) {
        clearTimeout(this.redrawTimer);
      }

      this.redrawTimer = setTimeout(() => {
        this.visualizer!.state = {};
        this.invalidated()
      }, 100);
    }
  }

  invalidated() {
    this.path = this.path?.withModel(this.model)
    let newState: any
    if (this.active && this.visualizer && this.path
        && this.visualizer.active(this.path)
        && (newState = this.path.get())) {
      if (newState && this.visualizer.dirty(this.path)) {
        console.log(`${this.canvas.width}, ${this.canvas.height}`);
        const img = this.ctx.createImageData(this.canvas.width, this.canvas.height)
        this.visualizer.state = JSON.parse(JSON.stringify(newState))
        this.visualizer.draw(this.model, img)
        this.ctx.putImageData(img, 0, 0)
      }
      this.el.style.display = 'block'
      this.gutter.style.display = 'block'
      if (this.lastHeight) {
        this.sourceView.style.height = this.lastHeight
        this.lastHeight = undefined
      }
    } else {
      this.el.style.display = 'none'
      this.gutter.style.display = 'none'
      this.lastHeight = this.sourceView.style.height
      this.sourceView.style.height = '100%'
    }
  }

  set(visualizer: Visualizer, path: ModelPath) {
    this.active = true
    this.visualizer = visualizer
    this.path = path
    this.visualizer.state = undefined
    this.controls.innerHTML = ''
    this.visualizer.addControls(this.controls, this)
    this.redraw()
  }
  
  static visualizers: Visualizer[] = [
    new BiomeNoiseVisualizer(),
    new NoiseSettingsVisualizer()
  ]
}
