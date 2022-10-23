export function timeToString(time: number | null) {
  return time === null ? '00:00:00.0' : new Date(1000 * time).toISOString().substr(11, 8) + `.${Math.round(time % 1 * 10)}`
}