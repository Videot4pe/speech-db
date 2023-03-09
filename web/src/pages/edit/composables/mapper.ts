import Konva from "konva";
import { EntityDto, EntityType } from "models/markup";

function getColorFromType(type?: EntityType) {
  console.log('type:', type)

  switch (type) {
    case "Allophone": {
      return 'green'
    }
    case "Word": {
      return 'orange'
    }
    case "Sentence": {
      return 'blue'
    }
    default: {
      return 'grey'
    }
  }
}

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
    fill: getColorFromType(entityDto.type),
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