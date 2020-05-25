import { RootNode } from "../nodes/RootNode"
import { Path } from "./Path"

export interface ModelListener {
  invalidated(model: DataModel): void
}

export class DataModel {
  data: any
  schema: RootNode
  listeners: ModelListener[]

  constructor(schema: RootNode) {
    this.schema = schema
    this.data = schema.default
    this.listeners = []
  }

  addListener(listener: ModelListener) {
    this.listeners.push(listener)
  }

  invalidate() {
    this.listeners.forEach(listener => listener.invalidated(this))
  }

  set(path: Path, value: any) {
    let node = this.data;
    for (let index of path.pop()) {
      if (node[index] === undefined) {
        node[index] = {}
      }
      node = node[index]
    }
    node[path.last()] = value

    this.invalidate()
  }
}