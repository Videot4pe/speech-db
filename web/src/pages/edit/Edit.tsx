import { useAtom } from "jotai";
import Konva from "konva";
import { KonvaEventListener, KonvaEventObject } from "konva/lib/Node";
import { ImageConfig } from "konva/lib/shapes/Image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Stage, Layer } from "react-konva";
import useImage from "use-image";
import { useRepositionStage } from "./composables/useRepositionStage";

let c = 0
function uid() {
  const id = c.toString()
  c = c + 1
  return id
}

const Edit = () => {
  let stage: Konva.Stage
  let layer: Konva.Layer

  let rectBuffer: Konva.RectConfig
  let selectedRectId: string | null = null
  let editedRect: Konva.Rect

  let creatingNewRect = false
  let rectWasMoved = false
  let stretchingRight = false

  function createRectConfig(id: string, x: number, width: number, text: string, fillColor = 'yellow', height?: number): Konva.RectConfig {
    return {
      id: id,
      x: x,
      width: 1,
      scaleX: width,
      name: text,
      height: height ? height : layer.height(),
      fill: fillColor,
      opacity: 0.2,
      draggable: true,
    }
  }

  function addNewRect(x: number): string {
    const newRect = createRectConfig(uid(), x, 1, '')
    // rects.value.push(newRect)
    rectBuffer = newRect
    return newRect.id as string
  }

    // KonvaEventListener<Stage, MouseEvent>
  function handleStageMouseDown(e: KonvaEventObject<MouseEvent>) {
    console.log('handleStageMouseDown')

    creatingNewRect = true
    const oldScaleX = layer.scaleX()
    const pointer = stage.getPointerPosition()
    if (!pointer) return
    const x = (pointer.x - layer.x()) / oldScaleX
    selectedRectId = addNewRect(x)
    // markSelectionAsChanged()
    console.debug('created new rect with id:', selectedRectId)
    console.debug('mainLayer.children:', layer.children)

    editedRect = new Konva.Rect(rectBuffer)
    layer.add(editedRect)
  }

  function handleMouseMove() {
    console.log('handleMouseMove')

    if (!selectedRectId) return
    if (!creatingNewRect) return
    rectWasMoved = true
    const rect = rectBuffer
    const pointer = stage.getPointerPosition()
    if (!rect || !pointer) return
    const mouseX = (pointer.x - layer.x()) / layer.scaleX()
    const rectX = rect.x ? rect.x : 0
    const rectWidth = rect.width ? rect.width : 0
    const rect_left = rectX
    const rect_right = rectX + rectWidth
    if (mouseX > rect_right) {
      if (stretchingRight) {
        rect.width = mouseX - rectX
      } else {
        rect.width = mouseX - rect_right
        rect.x = rect_right
        stretchingRight = true
      }
    } else if (mouseX < rect_left) {
      if (!stretchingRight) {
        rect.width = rect_right - mouseX
        rect.x = mouseX
      } else {
        stretchingRight = false
        rect.width = rect_left - mouseX
        rect.x = mouseX
      }
    } else {
      if (stretchingRight) {
        rect.width = mouseX - rectX
      } else {
        rect.width = rect_right - mouseX
        rect.x = mouseX
      }
    }

    if (rect.x) {
      editedRect.x(rect.x)
    }
    editedRect.width(rect.width)
  }

  useEffect(() => {
    const imageURL = 'https://www.frolov-lib.ru/books/hi/ch03.files/image010.jpg';

    const image = new Image();
    image.src = imageURL;

    const stageWidth = window.innerWidth - 64;
    const stageHeight = 300;

    stage = new Konva.Stage({
      container: 'container',
      width: stageWidth,
      height: stageHeight,
    });

    stage.on('mousedown', handleStageMouseDown);
    stage.on('mousemove', handleMouseMove);

    layer = new Konva.Layer();
    stage.add(layer);

    var bg = new Konva.Image({
      image: image,
      width: 3000,
      height: 300,
    });

    layer.add(bg);

    var scrollContainer = document.getElementById('scroll-container');
    const repositionStage = useRepositionStage(stage, scrollContainer);
    scrollContainer?.addEventListener('scroll', repositionStage);
    repositionStage();
  }, []);


  return (
    <div
      id="scroll-container"
      style={{
        width: '100%',
        height: '300px',
        overflow: 'auto',
        border: '1px solid grey',
      }}
    >
      <div id="large-container" style={{ width: '3000px', height: `300px`, overflow: 'hidden' }}>
        <div id="container"></div>
      </div>
    </div>
  );
};

export default Edit;
