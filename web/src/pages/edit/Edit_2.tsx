import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Image as KImage, Text as KText, Transformer, Rect } from "react-konva";

let c = 0
function uid() {
  const id = c.toString()
  c = c + 1
  return id
}

const Edit = () => {
  let [creatingNewRect, setCreatingNewRect] = useState<boolean>(false)
  let [rectWasMoved, setRectWasMoved] = useState<boolean>(false)
  let [stretchingRight, setStretchingRight] = useState<boolean>(false)
  let [transformerIsActive, setTransformerIsActive ] = useState<boolean>(false)

  const stageRef = useRef<Konva.Stage>(null)
  const layerRef = useRef<Konva.Layer>(null)
  const transformerRef = useRef<Konva.Transformer>(null)
  const textRef = useRef<Konva.Text>(null)
  const imageConfig = useRef<Konva.ImageConfig>({ image: undefined })
  const currentTimePointerConfig = useRef<Konva.RectConfig>({ visible: false })

  let [rects, setRects] = useState<Konva.RectConfig[]>([])
  const [editedRect, setEditedRect] = useState<Konva.Rect | null>(null)


  const imageURL = 'https://www.frolov-lib.ru/books/hi/ch03.files/image010.jpg';

  const image = new Image();
  image.src = imageURL;

  image.onload = (ev) => console.log('ev:', ev)

  imageConfig.current = {
    image: image,
    width: 3000,
    height: 300,
  }

  function createRectConfig(id: string, x: number, width: number, text: string = '', fillColor = 'yellow'): Konva.RectConfig {
    return {
      id: id,
      x: x,
      width: 1,
      scaleX: width,
      name: text,
      height: layerRef.current?.height(),
      fill: fillColor,
      opacity: 0.2,
      draggable: true,
    }
  }

  function addNewRect(x: number): string {
    console.warn('{ addNewRect }')

    const newRect = createRectConfig(uid(), x, 1)
    setRects(rects.concat(newRect))

    setTimeout(
      () => {
        setEditedRect(layerRef.current?.children?.find(child => child.id() === newRect.id) as Konva.Rect ?? null)
        console.log('editedRect:', editedRect)
      },
      0
    )

    return newRect.id as string
  }

  function updateTransformer() {
    // const selectedNode = layerRef.current?.findOne((node: Konva.Node) => node.id() === editedRect?.id())
    // if (selectedNode === transformerRef.current?.nodes()[0]) return
    // transformerRef.current?.nodes(selectedNode ? [selectedNode] : [] )

    if (transformerRef.current?.nodes()[0] === editedRect) return
    transformerRef.current?.nodes(editedRect ? [editedRect] : [])

    
    setTransformerIsActive(transformerRef.current?.nodes.length ? true : false)
  }

  function handleStageMouseDown(e: KonvaEventObject<MouseEvent>) {
    console.log('handleStageMouseDown')

    console.log('e:', e)

    if (e.target.parent?.className === 'Transformer') return
    if (transformerRef.current?.nodes()[0] === e.target) return

    setCreatingNewRect(true)
    const pointer = stageRef.current?.getPointerPosition()
    if (!pointer || !layerRef.current) return
    const x = (pointer.x - layerRef.current.x()) / layerRef.current.scaleX()

    addNewRect(x)

    // console.log('rects:', rects)
    // markSelectionAsChanged()
    // console.debug('created new rect with id:', editedRect?.id())
    // console.debug('mainLayer.children:', layerRef.current.children)

    updateTransformer()

    
    // layerRef.current?.scaleX(layerRef.current.scaleX() * 2)
    // stageRef.current?.width(stageRef.current.width() * 2)
  }

  function handleStageMouseUp() {
    console.log('handleStageMouseUp')

    if (creatingNewRect) {
      if (!rectWasMoved) {
        setEditedRect(null)
        setCreatingNewRect(false)
        return
      }
      setCreatingNewRect(false)
      setRectWasMoved(false)
      
      if (!editedRect) return
      const width = editedRect?.width()
      editedRect.width(1)
      editedRect.scaleX(width)
      updateTransformer()
      // emitEntitySelected()
    } else {
      if (rectWasMoved && editedRect !== null) {
        // emitEntityUpdated()
      }
      setRectWasMoved(false)
      if (editedRect === null) {
        // emit('reset-selection')
      }
    }
  }

  function handleMouseMove() {
    console.log('handleMouseMove')

    // console.log('creatingNewRect:', creatingNewRect)
    // console.log('editedRect:', editedRect)

    // const pointer = stageRef.current?.getPointerPosition()
    // const mouseX = (pointer!.x - layerRef.current!.x()) / layerRef.current!.scaleX()
    // console.log(pointer?.x)
    // console.log(mouseX)

    // logState()

    if (!creatingNewRect || !editedRect || !layerRef.current) return
    setRectWasMoved(true)
    const rect = {
      x: editedRect.x(),
      width: editedRect.width(),
    }
    const pointer = stageRef.current?.getPointerPosition()
    if (!rect || !pointer) return
    const mouseX = (pointer.x - layerRef.current.x()) / layerRef.current.scaleX()
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
        setStretchingRight(true)
      }
    } else if (mouseX < rect_left) {
      if (!stretchingRight) {
        rect.width = rect_right - mouseX
        rect.x = mouseX
      } else {
        setStretchingRight(false)
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

  function handleTransformEnd(e: { evt: MouseEvent, target: Konva.Rect }) {
    const rect = e.target
    if (rect.x() < 0) {
      rect.scaleX((rect.width() * rect.scaleX() + rect.x()) / rect.width()  )
      rect.x(0)
    }
    if (rect.x() + rect.width() * rect.scaleX() > layerRef.current!.width() * layerRef.current!.scaleX()) {
      rect.scaleX((layerRef.current!.width() * layerRef.current!.scaleX() - rect.x()) / rect.width())
    }
    const rectId = (rect.attrs as { id: string }).id
    const srcRect = rects.find((r: Konva.RectConfig) => r.id === rectId)
    if (!srcRect) return
    srcRect.x = rect.x()
    srcRect.scaleX = rect.width() * rect.scaleX()
    srcRect.width = 1
    // emitEntityUpdated()
  }

  function handleDragMove (e: { target: Konva.Rect }) {
    const rect = rects.find((r: Konva.RectConfig) => r.id === e.target.id())
    if (rect) {
      moveRect(e.target)
      setRectWasMoved(true)
    }
  }

  function moveRect(rect: Konva.Rect) {
    const layerWidth = layerRef.current!.width() * layerRef.current!.scaleX()
    const layerHeight = layerRef.current!.height() * layerRef.current!.scaleY()
    const newPosX = rect.x() < 0 ? 0 :
      rect.x() + rect.width() * rect.scaleX() > layerWidth ? layerWidth - rect.width() * rect.scaleX() : rect.x()
    const newPosY = rect.y() < 0 ? 0 :
      rect.y() + rect.height() > layerHeight ? layerHeight - rect.height() : rect.y()
    rect.position({x: newPosX, y: newPosY})
    const rectId = (rect.attrs as { id: string }).id
    const srcRect = rects.find((r: Konva.RectConfig) => r.id === rectId)
    if (!srcRect) return
    srcRect.x = newPosX
    srcRect.y = newPosY
  }


  return (
    <div
      id="scroll-container"
      style={{
        overflow: 'auto',
      }}
    >
      <Stage
        ref={stageRef}
        width={3000}
        height={300}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleStageMouseUp}
      >
        <Layer ref={layerRef}>
          <KImage {...imageConfig.current}/>
          <KText
            ref={textRef}
            text={`transformerIsActive: ${transformerIsActive}`}
            fill={transformerIsActive ? 'green' : 'red'}
            fontSize={15}
          />
          <Rect
            key="currentTimePointer"
            {...currentTimePointerConfig}
            onTransformEnd={handleTransformEnd}
            onDragMove={handleDragMove}
          />
          {
            rects.map(rect => (
              <Rect {...rect} key={rect.id} />
            ))
          }
          <Transformer ref={transformerRef} rotateEnabled={false} enabledAnchors={['middle-left', 'middle-right']} />
        </Layer>
      </Stage>
    </div>
  );
};

export default Edit;
