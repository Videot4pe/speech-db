export const createEmptyImage = (width = 100, height = 100) => {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  
  const ctx = canvas.getContext('2d')
  if (!ctx) throw Error('ctx is null')
  ctx.fillStyle = 'rgb(200, 200, 200)'
  ctx.fillRect(0, 0, width, height)

  const img = new Image(width, height)
  img.src = canvas.toDataURL()

  return img
}