import { Menu, MenuItem, MenuList } from "@chakra-ui/menu";
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { RectConfig } from "konva/lib/shapes/Rect";
import { BaseSyntheticEvent, forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Stage, Layer, Image as KImage, Text as KText, Transformer, Rect } from "react-konva";
import { useParams } from "react-router-dom";
import { useErrorHandler } from "../../utils/handle-get-error";

import MarkupsApi from "../../api/markups-api";

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
  const errorHandler = useErrorHandler();
  const params = useParams();
  const markupId = +params.id!;

  let [creatingNewRect, setCreatingNewRect] = useState<boolean>(false)
  let [rectWasMoved, setRectWasMoved] = useState<boolean>(false)
  let [stretchingRight, setStretchingRight] = useState<boolean>(false)
  let [transformerIsActive, setTransformerIsActive ] = useState<boolean>(false)
  let [showMenu, setShowMenu] = useState<boolean>(false)
  let [menuOffset, setMenuOffset] = useState<{x: number; y: number}>({x: 0, y: 0})

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
  const [editedRect, setEditedRect] = useState<Konva.RectConfig | null>(null)

  function zoomIn() {
    const newScale = stageRef.current?.scaleX() ?? 1 + 0.1;
    stageRef.current?.scaleX(newScale);
  }

  function zoomOut() {
    const newScale = stageRef.current?.scaleX() ?? 1 - 0.1;
    stageRef.current?.scaleX(newScale);
  }

  //
  function deleteSelectedEntity() {
    console.debug('deleteSelectedEntity')
    deleteEditedRect()

    setShowMenu(false)
  }

  function deleteEditedRect() {
    console.debug('deleteEditedRect')
    if (!editedRect) {
      console.error('editedRect is null!')
      return
    }

    const editedRectNode = layerRef.current?.children?.find(child => child.id() === editedRect?.id) as Konva.Rect
    if (!editedRectNode) {
      console.error('editedRectNode was not found!')
      return
    }
    editedRectNode.destroy()
    const updatedRects = rects.filter(child => child.id !== editedRect.id)
    setRects(updatedRects)
    setEditedRect(null)
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
    console.debug('{ addNewRect }')

    const newRect = createRectConfig(uid(), x, 1)
    setRects(rects.concat(newRect))

    setEditedRect(newRect)

    return newRect.id as string
  }

  function updateTransformer(editedRect: RectConfig | null) {
    console.debug('updateTransformer')
    console.debug('[updateTransformer] editedRect:', editedRect)

    const editedRectNode = layerRef?.current?.children?.find(child => child.id() === editedRect?.id) ?? null
    console.debug('[updateTransformer] editedRectNode:', editedRectNode)

    if (transformerRef.current?.nodes()[0] === editedRectNode) return
    transformerRef.current?.nodes(editedRectNode ? [editedRectNode] : [])

    setTransformerIsActive(transformerRef.current?.nodes().length ? true : false)
  }

  function handleStageMouseDown(e: KonvaEventObject<MouseEvent>) {
    console.warn('handleStageMouseDown')

    // Игнорируем нажатие ПКМ
    if (e.evt.button === 2) {
      return
    }

    // Если клик по сцене при открытом меню - закрываем меню
    if (showMenu) {
      setShowMenu(false)
      return
    }

    // Игнорируем клик на трансформер
    if (e.target.parent?.className === 'Transformer') return
    // Игнорируем клик на редактируемый блок
    if (transformerRef.current?.nodes()[0] === e.target) return

    if (e.target.className === 'Rect') {
      const editedRect = rects.find(child => child.id === e.target.id()) ?? null
      setEditedRect(editedRect)

      return
    }
    
    // 
    if (transformerIsActive) {
      setEditedRect(null)
      return
    }

    setCreatingNewRect(true)
    const pointer = stageRef.current?.getPointerPosition()
    if (!pointer || !stageRef.current) return
    const x = (pointer.x - stageRef.current.x()) / stageRef.current.scaleX()

    addNewRect(x)
  }

  function handleStageMouseUp() {
    console.warn('handleStageMouseUp')

    if (creatingNewRect) {
      setCreatingNewRect(false)
      setRectWasMoved(false)
      
      if (!rectWasMoved && editedRect?.width === 1) {
        // Если после клика rect не менялся, то удаляем
        deleteEditedRect()
        return
      }
      
      if (!editedRect) {
        console.error('editedRect is null')
        return
      }

      editedRect.scaleX = editedRect?.width
      editedRect.width = 1

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
    console.debug('handleMouseMove')

    if (!creatingNewRect || !editedRect || !stageRef.current) return
    // setRectWasMoved(true)

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
      editedRect.x = rect.x
    }
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
    console.debug('moveRect')

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

  function onStageContainerResize() {
    const scrollContainer = document.getElementById('scroll-container') as HTMLDivElement
    if (!scrollContainer) return
    const width = scrollContainer.clientWidth

    stageRef.current!.width(width)
    imageRef.current!.width(width)
  }

  function handleContextMenu(e: KonvaEventObject<PointerEvent>) {
    console.debug('handleContextMenu')
    
    const editedRect = rects.find(child => child.id === e.target.id()) ?? null
    setEditedRect(editedRect)

    const pointerPosition = stageRef.current?.getPointerPosition()
    if (!pointerPosition) {
      console.error('pointerPosition on stage was not found')
      return
    }

    setMenuOffset(pointerPosition)
    setShowMenu(true)
  }

  function handleWheel(e: KonvaEventObject<WheelEvent>) {
    e.evt.preventDefault()
    if (!stageRef.current) return
    
    const SCALE_BY = 1.045
    if (e.evt.ctrlKey) {
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

    const maxOffset = 0
    const minOffset = stageRef.current.width() * (1 - stageRef.current.scaleX())
    let newX = stageRef.current.x() - e.nativeEvent.deltaX
    newX = newX > maxOffset ? maxOffset : newX < minOffset ? minOffset : newX

    stageRef.current.x(newX)
  }

  useImperativeHandle(ref, () => ({
    zoomIn,
    zoomOut,
  }))

  useEffect(() => {
    window.addEventListener('resize', onStageContainerResize);
    onStageContainerResize();

    MarkupsApi.view(markupId)
      .then((payload) => {
        const { image: imageURL } = payload;
        const image = new Image();
        image.src = imageURL!;
        imageConfig.current = {
          image: image,
          width: INITIAL_STAGE_WIDTH,
          height: INITIAL_STAGE_HEIGHT,
        }
      })
      .catch(errorHandler);
  }, [])

  useEffect(() => updateTransformer(editedRect), [editedRect])

  return (
    <div
      id="scroll-container"
      style={{ overflow: 'auto', position: 'relative' }}
      onWheel={handleScroll}
      onContextMenu={(e) => {
        e.nativeEvent.preventDefault();
        e.nativeEvent.stopPropagation();
      }}
    >
      <Stage
        width={120}
        height={100}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          zIndex: 10,
        }}
      >
        <Layer>
          <Rect
            width={120}
            height={100}
            fill={'black'}
            opacity={0.8}
          />
          <KText
            y={0}
            text={'creatingNewRect'}
            fill={creatingNewRect ? 'lightgreen' : 'red'}
          />
          <KText
            y={15}
            text={'rectWasMoved'}
            fill={rectWasMoved ? 'lightgreen' : 'red'}
          />
          <KText
            y={30}
            text={'transformerIsActive'}
            fill={transformerIsActive ? 'lightgreen' : 'red'}
          />
          <KText
            y={45}
            text={'editedRect'}
            fill={editedRect ? 'lightgreen' : 'red'}
          />
          <KText
            y={60}
            text={`[ ${rects.map((r) => r.id).join(", ")} ]`}
            fill={editedRect ? 'lightgreen' : 'red'}
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
              <Rect {...rect} key={rect.id} onContextMenu={handleContextMenu} />
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
      {/* <div
        id="context-menu-container"
        style={{
          position: 'absolute',
          display: showMenu ? 'block' : 'none',
          top: menuOffset.y,
          left: menuOffset.x,
        }}
      >
        <Menu
          isOpen={showMenu}
        >
          <MenuList>
            <MenuItem onClick={deleteSelectedEntity}>Удалить</MenuItem>
          </MenuList>
        </Menu>
      </div> */}

      
      <Menu
        isOpen={showMenu}
      >
        <MenuList
          fontSize={'12px'}
          minWidth={'50px'}
          style={{
            position: 'absolute',
            display: showMenu ? 'block' : 'none',
            top: menuOffset.y,
            left: menuOffset.x,
          }}
        >
          <MenuItem onClick={deleteSelectedEntity}>Удалить</MenuItem>
        </MenuList>
      </Menu>
    </div>
  );
});

export default Edit;
