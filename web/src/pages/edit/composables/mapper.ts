export function mapTimeToStagePosition(time: number, duration: number, stageWidth: number): number {
  return time / duration * stageWidth
}