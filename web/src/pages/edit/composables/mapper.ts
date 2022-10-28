import Konva from "konva";
import { EntityDto } from "models/markup";

export function mapTimeToStagePosition(time: number, duration: number, stageWidth: number): number {
  return time / duration * stageWidth
}

export function mapStagePositionToTime(x: number, duration: number, stageWidth: number): number {
  return x / stageWidth * duration
}

export function mapEntityDtoToRectConfig(entityDto: EntityDto, duration: number, stageWidth: number, stageHeight: number): Konva.RectConfig {
  return {
    id: entityDto.id!.toString(),
    x: mapTimeToStagePosition(entityDto.beginTime, duration, stageWidth),
    width: 1,
    scaleX: mapTimeToStagePosition(entityDto.endTime - entityDto.beginTime, duration, stageWidth),
    name: entityDto.value,
    height: stageHeight,
    // TODO выбирать по типу сущности
    fill: 'green',
    opacity: 0.2,
    draggable: true,
  }
}

export function mapRectConfigToEntityDto(rect: Konva.RectConfig, duration: number, stageWidth: number): { id: string; beginTime: number; endTime: number; } {
  return {
    id: rect.id!,
    beginTime: mapStagePositionToTime(rect.x!, duration, stageWidth),
    endTime: mapStagePositionToTime(rect.x! + rect.scaleX!, duration, stageWidth),
  }
}