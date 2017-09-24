export class Bikes {
  reporterId: string
  count: number
  lastCoords: {
    locationName: any
    accuracy: number
    latitude: number
    longitude: number
  }
  lastTime: number
  canceled: boolean
}