import Konva from "konva";
import { EntityDto } from "models/markup";

export function mapTimeToStagePosition(time: number, duration: number, stageWidth: number): number {
  return time / duration * stageWidth
}

export function mapEntityDtoToRectConfig(entityDto: EntityDto, duration: number, stageWidth: number, stageHeight: number): Konva.RectConfig {
  return {
    id: entityDto.id,
    x: mapTimeToStagePosition(entityDto.beginTime, duration, stageWidth),
    width: 1,
    scaleX: mapTimeToStagePosition(entityDto.endTime - entityDto.beginTime, duration, stageWidth),
    name: entityDto.value,
    height: stageHeight,
    // TODO выбирать по типу сущности
    fill: 'yellow',
    opacity: 0.2,
    draggable: true,
  }
}