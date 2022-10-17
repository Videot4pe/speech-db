import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { RectConfig } from "konva/lib/shapes/Rect";
import { BaseSyntheticEvent, forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Stage, Layer, Image as KImage, Text as KText, Transformer, Rect } from "react-konva";

let c = 0
function uid() {
  const id = c.toString()
  c = c + 1
  return id
}

interface IEdit {
  // mapToLength: number;
  // entities: [];
  imageURL: string;
  // currentTime: number;
}

let INITIAL_STAGE_WIDTH = 1082;
const INITIAL_STAGE_HEIGHT = 200;

const Edit = forwardRef(({ imageURL }: IEdit, ref) => {
  let [creatingNewRect, setCreatingNewRect] = useState<boolean>(false)
  let [rectWasMoved, setRectWasMoved] = useState<boolean>(false)
  let [stretchingRight, setStretchingRight] = useState<boolean>(false)
  let [transformerIsActive, setTransformerIsActive ] = useState<boolean>(false)

  const stageRef = useRef<Konva.Stage>(null)
  const layerRef = useRef<Konva.Layer>(null)
  const imageRef = useRef<Konva.Image>(null)
  const transformerRef = useRef<Konva.Transformer>(null)
  const imageConfig = useRef<Konva.ImageConfig>({ image: undefined })
  const stageConfig = useRef<Konva.StageConfig>({
    container: 'scroll-container',
    width: INITIAL_STAGE_WIDTH,
    height: INITIAL_STAGE_HEIGHT,
  })
  const currentTimePointerConfig = useRef<Konva.RectConfig>({ visible: false })

  let [rects, setRects] = useState<Konva.RectConfig[]>([])
  // const [editedRect, setEditedRect] = useState<Konva.Rect | null>(null)
  const [editedRect, setEditedRect] = useState<Konva.RectConfig | null>(null)


  // const imageURL = 'https://www.frolov-lib.ru/books/hi/ch03.files/image010.jpg';
  const image = new Image();
  image.src = imageURL;

  imageConfig.current = {
    image: image,
    width: INITIAL_STAGE_WIDTH,
    height: INITIAL_STAGE_HEIGHT,
  }

  function zoomIn() {
    const newScale = stageRef.current?.scaleX() ?? 1 + 0.1;
    stageRef.current?.scaleX(newScale);
  }

  function zoomOut() {
    const newScale = stageRef.current?.scaleX() ?? 1 - 0.1;
    stageRef.current?.scaleX(newScale);
  }

  useImperativeHandle(ref, () => ({
    zoomIn,
    zoomOut,
  }))

  //

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
    console.debug('{ addNewRect }')

    const newRect = createRectConfig(uid(), x, 1)
    setRects(rects.concat(newRect))

    setEditedRect(newRect)
    updateTransformer(newRect)

    console.log('[addNewRect] newRect:', newRect)
    console.log('[addNewRect] editedRect:', editedRect)

    setTimeout(
      () => {
        // const editedRectToSet = layerRef.current?.children?.find(child => child.id() === newRect.id) as Konva.Rect ?? null
        // setEditedRect(editedRectToSet)
        
        // const editedRectToSet = rects.find(child => child.id === newRect.id) ?? null
        // setEditedRect(editedRectToSet)
        // updateTransformer(editedRectToSet)

        // console.log('[addNewRect] editedRectToSet:', editedRectToSet)
        // console.log('[addNewRect] editedRect:', editedRect)
      },
      0
    )

    return newRect.id as string
  }

  function updateTransformer(editedRect: RectConfig | null) {
    console.debug('updateTransformer')

    console.log('[updateTransformer] editedRect:', editedRect)

    // const selectedNode = layerRef.current?.findOne((node: Konva.Node) => node.id() === editedRect?.id())
    // if (selectedNode === transformerRef.current?.nodes()[0]) return
    // transformerRef.current?.nodes(selectedNode ? [selectedNode] : [] )

    // if (transformerRef.current?.nodes()[0] === editedRect) return
    // transformerRef.current?.nodes(editedRect ? [editedRect] : [])

    const editedRectNode = layerRef?.current?.children?.find(child => child.id() === editedRect?.id) ?? null

    // console.log('[updateTransformer] layerChildren:', layerRef?.current?.children?.map(child => child.id()).join(", "))

    console.log('[updateTransformer] layerChildren:')
    layerRef?.current?.children?.forEach(child => console.log(child))

    console.log('[updateTransformer] editedRectNode:', editedRectNode)

    // if (transformerRef.current?.nodes()[0] === editedRect) return
    // transformerRef.current?.nodes(editedRect ? [editedRect] : [])

    if (transformerRef.current?.nodes()[0] === editedRectNode) return
    transformerRef.current?.nodes(editedRectNode ? [editedRectNode] : [])

    
    setTransformerIsActive(transformerRef.current?.nodes().length ? true : false)
    console.log('transformerIsActive:', transformerIsActive)
  }

  function handleStageMouseDown(e: KonvaEventObject<MouseEvent>) {
    console.warn('handleStageMouseDown')

    console.log('e:', e)

    // Игнорируем нажатие ПКМ
    if (e.evt.button === 2) {
      return
    }

    // Игнорируем клик на трансформер
    if (e.target.parent?.className === 'Transformer') return
    // Игнорируем клик на редактируемый блок
    if (transformerRef.current?.nodes()[0] === e.target) return

    if (e.target.className === 'Rect') {
      // setEditedRect(e.target as Konva.Rect)
      const editedRect = rects.find(child => child.id === e.target.id()) ?? null
      setEditedRect(editedRect)
      updateTransformer(editedRect)

      return
    }
    
    // 
    if (transformerIsActive) {
      setEditedRect(null)
      updateTransformer(null)
      return
    }

    setCreatingNewRect(true)
    const pointer = stageRef.current?.getPointerPosition()
    if (!pointer || !stageRef.current) return
    const x = (pointer.x - stageRef.current.x()) / stageRef.current.scaleX()

    addNewRect(x)

    // console.log('rects:', rects)
    // markSelectionAsChanged()
    // console.debug('created new rect with id:', editedRect?.id())
    // console.debug('mainLayer.children:', layerRef.current.children)

    // updateTransformer()

    
    // layerRef.current?.scaleX(layerRef.current.scaleX() * 2)
    // stageRef.current?.width(stageRef.current.width() * 2)
  }

  function handleStageMouseUp() {
    console.warn('handleStageMouseUp')

    if (creatingNewRect) {
      setCreatingNewRect(false)
      setRectWasMoved(false)
      
      // if (!rectWasMoved && editedRect?.width() === 1) {
      if (!rectWasMoved && editedRect?.width === 1) {
        console.debug('!rectWasMoved && editedRect?.width() === 1')

        const editedRectNode = layerRef.current?.children?.find(child => child.id() === editedRect.id) as Konva.Rect
        if (!editedRectNode) {
          console.error('editedRectNode was not found!')
          return
        }

        /** Если после клика rect не менялся, то удаляем */
        editedRectNode.destroy()
        const updatedRects = rects.filter(child => child.id !== editedRect.id)
        setRects(updatedRects)
        /** */

        // editedRect.destroy()
        setEditedRect(null)
        updateTransformer(null)
        return
      }
      
      // editedRect?.scaleX(editedRect.width())
      // editedRect?.width(1)
      if (!editedRect) {
        console.error('editedRect is null')
        return
      }

      editedRect.scaleX = editedRect?.width
      editedRect.width = 1

      // updateTransformer(undefined)
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

  function handleMouseMove(e: any) {
    console.log('handleMouseMove')

    if (!creatingNewRect || !editedRect || !stageRef.current) return
    // setRectWasMoved(true)
    
    // const rect = {
    //   x: editedRect.x(),
    //   width: editedRect.width(),
    // }





    // const rect = {
    //   x: editedRect.x,
    //   width: editedRect.width,
    // }

    const editedRectNode = layerRef?.current?.children?.find(child => child.id() === editedRect?.id) ?? null
    if (!editedRectNode) return

    const rect = {
      x: editedRectNode.x(),
      width: editedRectNode.width(),
    }

    const pointer = stageRef.current.getPointerPosition()
    if (!rect || !pointer) return
    const mouseX = (pointer.x - stageRef.current.x()) / stageRef.current.scaleX()
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
      // editedRect.x(rect.x)

      editedRect.x = rect.x
    }
    // editedRect.width(rect.width)
    editedRect.width = rect.width

    /** */
    const curRect = rects.find(rect => rect.id === editedRect.id) ?? null
    if (!curRect) {
      console.error('curRect is null')
      return
    }

    if (rect.x) {
      curRect.x = editedRect.x
    }
    curRect.width = editedRect.width

    setRects(rects.filter(r => r.id !== curRect.id).concat([curRect]))
    /** */



    // const editedRectNode = layerRef?.current?.children?.find(child => child.id() === editedRect?.id) ?? null

    // stageRef.current.draw()

    console.log('editedRect:', editedRect)
  }

  function handleTransformEnd(e: KonvaEventObject<Event>) {
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

  function handleDragMove (e: KonvaEventObject<DragEvent>) {
    const transformer = e.target as unknown as Konva.Transformer
    const rect = transformer.nodes()[0] as Konva.Rect
    // const rect = rects.find((r: Konva.RectConfig) => r.id === e.target.id())
    if (rect) {
      moveRect(rect)
      setRectWasMoved(true)
    }
  }

  function moveRect(rect: Konva.Rect) {
    console.log('moveRect')

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

  useEffect(() => {
    window.addEventListener('resize', onStageContainerResize);
    onStageContainerResize();

    // document.addEventListener('keydown', handleKey);
  }, [])

  function onStageContainerResize() {
    const scrollContainer = document.getElementById('scroll-container') as HTMLDivElement
    const width = scrollContainer.clientWidth

    stageRef.current!.width(width)
    imageRef.current!.width(width)
  }

  // useEffect(updateTransformer, [editedRect]);

  function handleContextMenu(e: { nativeEvent: PointerEvent }) {
    console.log('handleContextMenu')
    console.log('e:', e)

    e.nativeEvent.preventDefault()
    e.nativeEvent.stopPropagation()
  }

  function handleWheel(e: KonvaEventObject<WheelEvent>) {
    const SCALE_BY = 1.045

    e.evt.preventDefault()

    if (e.evt.ctrlKey) {

      if (!stageRef.current) return
      const oldScaleX = stageRef.current.scaleX()
      let newScale = e.evt.deltaY < 0 ? oldScaleX * SCALE_BY : oldScaleX / SCALE_BY
      if (Math.abs(newScale - 1) < 1e-10) newScale = 1
      
      zoom(newScale)
    }
  }

  function zoom(newScale: number, position?: number) {
    if (!stageRef.current) return

    const oldScaleX = stageRef.current.scaleX()
    const pointer = position ?
      position 
      : stageRef.current.getPointerPosition()?.x ?? stageRef.current.width() / 2
    const oldStagePos = pointer -stageRef.current.x()
    
    const newWidth = INITIAL_STAGE_WIDTH * newScale;
    if (newWidth < INITIAL_STAGE_WIDTH) {
      newScale = 1
    }

    const newStagePos = oldStagePos / oldScaleX * newScale
    let newScrollLeft = newStagePos - pointer

    const stageWidth = stageRef.current.width()

    /**
     * stageWidth * newScale - newScrollLeft < stageWidth
     * =>
     * newScrollLeft/stageWidth > newScale - 1
     */
    if (newScrollLeft/stageWidth > newScale - 1) {
      newScrollLeft = stageWidth * (newScale - 1)
    }
    if (newScrollLeft < 0) {
      newScrollLeft = 0
    }

    stageRef.current!.scaleX(newScale);
    stageRef.current!.x(-newScrollLeft)
  }

  function handleScroll(e: BaseSyntheticEvent<WheelEvent>) {
    if (!stageRef.current || !e.nativeEvent.deltaX) return

    const newX = stageRef.current.x() - e.nativeEvent.deltaX
    const stageWidth = stageRef.current.width()
    const stageScale = stageRef.current.scaleX()
    if (newX > 0 || newX/stageWidth < 1 - stageScale) return 

    stageRef.current.x(newX)
  }

  function handleKey() {
    console.log('[updateTransformer] layerChildren:')
    layerRef?.current?.children?.forEach(child => console.log(child))
  }

  return (
    <div
      id="scroll-container"
      style={{ overflow: 'auto' }}
      onContextMenu={handleContextMenu}
      onWheel={handleScroll}
    >
      <Stage
        width={300}
        height={100}
      >
        <Layer>
          <Rect
            width={300}
            height={100}
            fill={'black'}
          />
          { /* creatingNewRect, rectWasMoved, transformerIsActive */ }
          <KText
            y={0}
            text={'creatingNewRect'}
            fill={creatingNewRect ? 'green' : 'red'}
          />
          <KText
            y={15}
            text={'rectWasMoved'}
            fill={rectWasMoved ? 'green' : 'red'}
          />
          <KText
            y={30}
            text={'transformerIsActive'}
            fill={transformerIsActive ? 'green' : 'red'}
          />
          <KText
            y={45}
            text={'editedRect'}
            fill={editedRect ? 'green' : 'red'}
          />
          <KText
            y={60}
            text={`[ ${rects.map((r) => r.id).join(", ")} ]`}
            fill={editedRect ? 'green' : 'red'}
          />
        </Layer>
      </Stage>
      <Stage
        ref={stageRef}
        {...stageConfig.current}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleStageMouseUp}
        onWheel={handleWheel}
      >
        <Layer ref={layerRef}>
          <KImage ref={imageRef} {...imageConfig.current}/>
          {/* <Rect
            key="currentTimePointer"
            {...currentTimePointerConfig}
          /> */}
          {
            rects.map(rect => (
              <Rect {...rect} key={rect.id} />
            ))
          }
          <Transformer
            ref={transformerRef}
            rotateEnabled={false}
            enabledAnchors={['middle-left', 'middle-right']}
            onDragMove={handleDragMove}
            onTransformEnd={handleTransformEnd}
          />
        </Layer>
      </Stage>
    </div>
  );
});

export default Edit;
