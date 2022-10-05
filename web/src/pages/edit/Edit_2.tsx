import Konva from "konva";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import { Stage, Layer, Image as KImage, Text as KText, Transformer, Rect } from "react-konva";
import { v4 as uuidv4 } from 'uuid';

interface IEdit {
  mapToLength: number;
  entities: [];
  imageUrl: string;
  currentTime: number;
}

interface KonvaObject {
  getNode: () => Konva.Node
}
interface QMenuInterface {
  show: (evt? : Record<string, unknown>) => void
  showing: boolean
}

export enum MarkupEntityState {
  /** Это состояние получают все новые сущности, которые еще не были загружены в БД */
  Created = 'Created',
  /** Это состояние получают все сущности, которые были загружены из базы и удалены */
  Deleted = 'Deleted',
  /** Это состояние получают все сущности, которые были загружены из базы и изменены */
  Edited = 'Edited',
  /** Это состояние получают все сущности, которые были загружены из базы */
  NotChanged = 'NotChanged',
}

export interface MarkupWidgetEntity {
  id: string,
  value: string,
  begin_time: number,
  end_time: number,
  state: MarkupEntityState,
}

// const Edit = ({ mapToLength, entities, imageUrl, currentTime }: IEdit) => {
const Edit = ({ mapToLength, entities, currentTime }: IEdit) => {

  const imageUrl = 'https://www.frolov-lib.ru/books/hi/ch03.files/image010.jpg';

  const SCROLLBAR_PADDING = 5
  const SLIDER_WIDTH = 100
  const SLIDER_HEIGHT = 10
  const SCROLLBAR_MIN_WIDTH = 30
  const SCALE_BY = 1.045
  const [rectBuffer, setRectBuffer] = useState<Konva.RectConfig | null>(null)
  const [rects, setRects] = useState<Konva.RectConfig[]>([])

  const [scaleParamsRef, setScaleParamsRef] = useState({
    currentScale: 1, // Масштаб изображения в процентах, по-умолчанию 1
    step: 0.5,
    maxScale: 10,
  })

  const textItems = useMemo(() => {
    if (!mapToLength) return []
    return rects.map((rect: Konva.RectConfig): Konva.TextConfig => {
      return {
        id: `${rect.id ? rect.id : ''}-${rect.name ? rect.name : ''}`,
        text: rect.name,
        x: rect.x,
        scaleX: 1 / scaleParamsRef.currentScale,
        width: (rect.scaleX as number) * scaleParamsRef.currentScale,
        height: rect.height,
        align: 'center',
        verticalAlign: 'middle',
        fontSize: 15,
        fill: 'red',
      }
    })
    // TODO deps
  }, [])
  const [currentTimePointerConfig, setCurrentTimePointerConfig] = useState<Konva.RectConfig | Record<string, unknown>>({})
  const [selectedRectId, setSelectedRectId] = useState<string | null>(null)
  const [copiedRectId, setCopiedRectId] = useState<string | null>(null)

  const stageRef = useRef<Konva.Stage>(null)
  const layerRef = useRef<Konva.Layer>(null)
  const scrollLayerRef = useRef<Konva.Layer>(null)
  const horizontalScrollBarRef = useRef<Konva.Rect>(null)
  const imageRef = useRef<Konva.Image>(null)
  const menuRef = useState<QMenuInterface | null>(null)
  const transformerRef = useRef<Konva.Transformer | null>(null)

  const stageConfig = useMemo(() => {
    if (!stageRef.current) return {}
    const container = document.getElementById('stage-container')
    return {
      container: container,
      width: container?.offsetWidth,
      height: container?.offsetHeight,
    }
    // TODO deps
  }, [])
  const [imageConfig, setImageConfig] = useState<Konva.ImageConfig>({ image: undefined })
  const horizontalScrollbarConfig = useMemo((): Konva.RectConfig => {
    return {
      width: SLIDER_WIDTH,
      height: SLIDER_HEIGHT,
      fill: 'yellow',
      x: SCROLLBAR_PADDING,
      y: (stageConfig.height as number) - SCROLLBAR_PADDING - 10,
      draggable: true,
      visible: false,
    }
  }, [])
  // const gen: IdGeneratorInterface = new IdGenerator(1) as IdGeneratorInterface
  const flag = {
    creatingNewRect: false,
    rectWasMoved: false,
    stretchingRight: true,
  }

  function emitEntitySelected() {
    console.debug('[MarkupWidget]::emitEntitySelected')
    const rect = rects.concat(rectBuffer ? [rectBuffer] : []).find((r: Konva.RectConfig) => r.id === selectedRectId)
    if (!rect) return

    // TODO cb
    // emit('entity-selected', rect.id)
  }
  function emitEntityUpdated() {
    console.debug('[MarkupWidget]::emitEntityUpdated')
    const rect = rects.concat(rectBuffer ? [rectBuffer] : []).find((r: Konva.RectConfig) => r.id === selectedRectId)
    if (!rect) return
    const rectX: number = rect.x ? rect.x : 0
    const rectScaleX: number = rect.scaleX ? rect.scaleX : 0

    // TODO emit
    // emit('entity-updated', {
    //   id: rect.id,
    //   begin_time: _mapLayerCoordinatesToSeconds(rectX),
    //   end_time: _mapLayerCoordinatesToSeconds(rectX + rectScaleX),
    // })
  }
  function emitEntityRemoved(id: string) {
    console.debug('[MarkupWidget]::emitEntityRemoved')
    // emit('entity-removed', id)
  }
  function markSelectionAsChanged() {
    console.debug('[MarkupWidget]::markSelectionAsChanged')
    if (selectedRectId) {
      const rect = rects.concat(rectBuffer ? [rectBuffer] : []).find((r: Konva.RectConfig) => r.id === selectedRectId)
      if (!rect) return
      rect.fill = 'pink'
    } else {
      console.warn('markSelectionAsChanged() не может быть выполнена, т.к. нет выделенного отрезка')
    }
  }
  function getSelection(): { id: string; begin_time: number; end_time: number; } | null {
    console.debug('[MarkupWidget]::getSelection')
    console.debug('selectedRectId:', selectedRectId)
    if (!selectedRectId) return null
    const rect = rects.concat(rectBuffer ? [rectBuffer] : []).find((r: Konva.RectConfig) => r.id === selectedRectId)
    if (!rect) return null
    return {
      id: rect.id as string,
      begin_time: _mapLayerCoordinatesToSeconds(rect.x as number),
      end_time: _mapLayerCoordinatesToSeconds((rect.x as number) + (rect.scaleX as number)),
    }
  }
  function resetSelection() {
    console.debug('[MarkupWidget]::resetSelection')
    setRectBuffer(null)
    setSelectedRectId(null)
    transformerRef.current!.nodes([])
  }
  function remapEntities() {
    console.debug('[MarkupWidget]::remapEntities(...)')
    setRects(_mapEntitiesToRects(entities))
  }
  /** Функции для преобразования ширины отрезка во временной интервал */
  function _mapLayerCoordinatesToSeconds(x: number): number {
    return x / layerRef.current!.width() * mapToLength
  }
  /** Функции для преобразования временного интервала в ширину в пикселях */
  function _mapSecondsToLayerCoordinates(t: number): number {
    return t / mapToLength * layerRef.current!.width()
  }
  function _mapEntitiesToRects(entities: MarkupWidgetEntity[]): Konva.RectConfig[] {
    console.debug('[MarkupWidget]::_mapEntitiesToRects(...)')
    console.debug('PARAMS:')
    console.debug('\tmapToLength=', mapToLength)
    console.debug('\tlayerWidth=', layerRef.current!.width())
    const container = document.getElementById('stage-container')
    const height = container ? container.offsetHeight : 1
    console.debug('\tcontainer=', container)
    console.debug('\theight=', height)
    return entities.map(entity =>
        __rect(
            entity.id,
            _mapSecondsToLayerCoordinates(entity.begin_time),
            _mapSecondsToLayerCoordinates(entity.end_time - entity.begin_time),
            entity.value,
            entity.state === MarkupEntityState.NotChanged ? 'lightblue' : undefined,
            height,
        )
    )
  }
  function _mapCurrentTime(currentTime: number): Konva.RectConfig {
    console.debug('[MarkupWidget]::_mapCurrentTime(...)')
    const container = document.getElementById('stage-container')
    const height = container ? container.offsetHeight : 1
    console.debug('\tcontainer=', container)
    console.debug('\theight=', height)
    return {
      id: 'currentTimePointer',
      x: _mapSecondsToLayerCoordinates(currentTime),
      scaleX: 1 / scaleParamsRef.currentScale,
      width: scaleParamsRef.currentScale,
      height: height,
      fill: 'yellow',
      draggable: false,
    }
  }
  /**                           */
  /** Внутренняя логика виджета */
  /**                           */
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
    const srcRect = rects.concat(rectBuffer ? [rectBuffer] : []).find((r: Konva.RectConfig) => r.id === rectId)
    if (!srcRect) return
    srcRect.x = rect.x()
    srcRect.scaleX = rect.width() * rect.scaleX()
    srcRect.width = 1
    emitEntityUpdated()
  }
  function handleStageMouseDown(e: { evt: MouseEvent, pointerId: number, target: Konva.Node }) {
    console.debug('[MarkupWidget]::handleStageMouseDown')
    // if (!menuRef || menuRef.showing) return
    if (e.target.getParent().className === 'Transformer') return
    if (e.target.id() === 'scrollBarSlider') return
    if (e.evt.button === 2) {
      // menuRef.show()
      return
    }
    const id = e.target.id()
    console.debug('target:', e.target)
    // const rect = rects.value.find((r: any) => r.id === id)
    const rect = rects.concat(rectBuffer ? [rectBuffer] : []).find((r: Konva.RectConfig) => r.id === id)
    if (selectedRectId) {
      setSelectedRectId(rect ? id : null)
      if (selectedRectId != null) {
        emitEntitySelected()
      }
    } else {
      if (rect) {
        setSelectedRectId(id)
        emitEntitySelected()
      } else {
        flag.creatingNewRect = true
        const oldScaleX = layerRef.current!.scaleX()
        const pointer = stageRef.current!.getPointerPosition()
        if (!pointer) return
        const x = (pointer.x - layerRef.current!.x()) / oldScaleX
        setSelectedRectId(addNewRect(x))
        markSelectionAsChanged()
        console.debug('created new rect with id:', selectedRectId)
        console.debug('layer.children:', layerRef.current!.children)
      }
    }
    updateTransformer()
  }
  function updateTransformer() {
    const selectedNode = layerRef.current!.findOne((node: Konva.Node) => node.id() === selectedRectId)
    if (selectedNode === transformerRef.current!.nodes()[0]) return
    transformerRef.current!.nodes(selectedNode ? [selectedNode] : [] )
  }
  function handleStageMouseUp() {
    console.debug('[MarkupWidget]::handleStageMouseUp()')
    if (flag.creatingNewRect) {
      if (!flag.rectWasMoved) {
        // rects.value.pop()
        setRectBuffer(null)
        setSelectedRectId(null)
        flag.creatingNewRect = false
        // emit('reset-selection')
        return
      }
      flag.creatingNewRect = false
      flag.rectWasMoved = false

      const width = rectBuffer?.width
      if (!rectBuffer) return
      setRectBuffer({...rectBuffer, width: 1, scaleX: width})
      updateTransformer()
      emitEntitySelected()
    } else {
      if (flag.rectWasMoved && selectedRectId !== null) {
        emitEntityUpdated()
      }
      flag.rectWasMoved = false
      if (selectedRectId == null) {
        // emit('reset-selection')
      }
    }
  }
  function __rect(id: string, x: number, width: number, text: string, fillColor = 'yellow', height?: number): Konva.RectConfig {
    return {
      id: id,
      x: x,
      width: 1,
      scaleX: width,
      name: text,
      height: height ? height : layerRef.current!.height(),
      fill: fillColor,
      opacity: 0.2,
      draggable: true,
    }
  }
  function addNewRect(x: number): string {
    const newRect = __rect(uuidv4(), x, 1, '')
    // rects.value.push(newRect)
    setRectBuffer(newRect)
    return newRect.id as string
  }
  function copyRect(srcId: string, x: number): string {
    const srcRect = rects.find(rect => rect.id === srcId)
    const newRect = Object.assign({}, srcRect)
    newRect.id = uuidv4()
    newRect.x = x
    // rects.value.push(newRect)
    setRectBuffer(newRect)
    return newRect.id
  }
  function handleMouseMove() {
    console.debug('handleMouseMove')

    if (!selectedRectId) return
    if (!flag.creatingNewRect) return
    flag.rectWasMoved = true
    const rect = rectBuffer
    const pointer = stageRef.current!.getPointerPosition()
    if (!rect || !pointer) return
    const mouseX = (pointer.x - layerRef.current!.x()) / layerRef.current!.scaleX()
    const rectX = rect.x ? rect.x : 0
    const rectWidth = rect.width ? rect.width : 0
    const rect_left = rectX
    const rect_right = rectX + rectWidth
    if (mouseX > rect_right) {
      if (flag.stretchingRight) {
        rect.width = mouseX - rectX
      } else {
        rect.width = mouseX - rect_right
        rect.x = rect_right
        flag.stretchingRight = true
      }
    } else if (mouseX < rect_left) {
      if (!flag.stretchingRight) {
        rect.width = rect_right - mouseX
        rect.x = mouseX
      } else {
        flag.stretchingRight = false
        rect.width = rect_left - mouseX
        rect.x = mouseX
      }
    } else {
      if (flag.stretchingRight) {
        rect.width = mouseX - rectX
      } else {
        rect.width = rect_right - mouseX
        rect.x = mouseX
      }
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
    const srcRect = rects.concat(rectBuffer ? [rectBuffer] : []).find((r: Konva.RectConfig) => r.id === rectId)
    if (!srcRect) return
    srcRect.x = newPosX
    srcRect.y = newPosY
  }
  function handleDragMove (e: { target: Konva.Rect }) {
    const rect = rects.concat(rectBuffer ? [rectBuffer] : []).find((r: Konva.RectConfig) => r.id === e.target.id())
    if (rect) {
      moveRect(e.target)
      flag.rectWasMoved = true
    }
  }
  function handleHorizontalScroll (e: { target: Konva.Rect }) {
    const stageWidth = stageRef.current!.width()
    e.target.x(Math.max(
        Math.min(e.target.x(), stageWidth - e.target.width() - SCROLLBAR_PADDING),
        SCROLLBAR_PADDING
    ))
    e.target.y(stageRef.current!.height() - SCROLLBAR_PADDING - 10)
    const availableWidth = stageWidth - SCROLLBAR_PADDING * 2 - horizontalScrollBarNode.width()
    const delta = (e.target.x() - SCROLLBAR_PADDING) / availableWidth
    layerRef.current!.x(-(layerRef.current!.width() * layerRef.current!.scaleX() - stageWidth) * delta)
    stageRef.current!.batchDraw()
  }
  function handleWheel(e: { evt: WheelEvent }) {
    if (e.evt.ctrlKey) {
      const oldScaleX = layerRef.current!.scaleX()
      let newScale = e.evt.deltaY < 0 ? oldScaleX * SCALE_BY : oldScaleX / SCALE_BY
      if (Math.abs(newScale - 1) < 1e-10) newScale = 1
      const pointer = stageRef.current!.getPointerPosition()
      if (!pointer) return
      const mousePointToX = (pointer.x - layerRef.current!.x()) / oldScaleX
      const offset = pointer.x - mousePointToX * newScale
      zoom(offset, newScale, true)
    } else {
      scroll(e)
    }
  }
  function zoom(offset: number, newScale: number, setCurrentScale = false) {
    if (imageRef.current!.width() * newScale < stageRef.current!.width()) return
    let x = offset
    const layerWidth = layerRef.current!.width() * newScale
    if (layerWidth < stageRef.current!.width()) {
      x = (stageRef.current!.width() - layerWidth) / 2
    } else {
      const minX = -(layerWidth - stageRef.current!.width())
      x = Math.max(minX, Math.min(x, 0))
    }
    layerRef.current!.scaleX(newScale)
    layerRef.current!.x(x)
    layerRef.current!.batchDraw()
    updateHorizontalScrollBar()
    if (setCurrentScale) {
      setScaleParamsRef({...scaleParamsRef, currentScale: newScale})
    }
  }
  function scroll(e: { evt: WheelEvent }) {
    const dx = e.evt.deltaX
    const layerWidth = layerRef.current!.width() * layerRef.current!.scaleX()
    const minX = -(layerWidth - stageRef.current!.width())
    const maxX = 0
    const x = Math.max(minX, Math.min(layerRef.current!.x() - dx, maxX))
    layerRef.current!.x(x)
    layerRef.current!.batchDraw()
    updateHorizontalScrollBar()
  }
  function updateHorizontalScrollBar() {
    const scaleX = layerRef.current!.scaleX()
    let newHSBwidth = SLIDER_WIDTH / scaleX
    if (newHSBwidth < SCROLLBAR_MIN_WIDTH) newHSBwidth = SCROLLBAR_MIN_WIDTH
    horizontalScrollBarNode.width(newHSBwidth)
    const layerWidth = layerRef.current!.width() * layerRef.current!.scaleX()
    if (layerWidth === stageRef.current!.width()) {
      horizontalScrollBarNode.visible(false)
      scrolllayerRef.current!.batchDraw()
      return
    } else {
      horizontalScrollBarNode.visible(true)
    }
    const availableWidth = stageRef.current!.width() - SCROLLBAR_PADDING * 2 - newHSBwidth
    const hx =
        (layerRef.current!.x() / (-layerWidth + stageRef.current!.width())) * availableWidth + SCROLLBAR_PADDING
    horizontalScrollBarNode.x(hx)
    scrolllayerRef.current!.batchDraw()
  }
  function onMenuItemSelect(option: string) {
    switch(option) {
      case 'Remove': {
        const removedEntityId = selectedRectId
        if (copiedRectId === selectedRectId) setCopiedRectId(null)
        setSelectedRectId(null)
        updateTransformer()
        if (rectBuffer && rectBuffer.id === removedEntityId) {
          setRectBuffer(null)
        } else {
          emitEntityRemoved(removedEntityId as string)
        }
        break
      }
      case 'Copy': {
        setCopiedRectId(selectedRectId)
        break
      }
      case 'Paste': {
        const oldScaleX = layerRef.current!.scaleX()
        const pointer = stageRef.current!.getPointerPosition()
        if (!pointer) return
        const x = (pointer.x - layerRef.current!.x()) / oldScaleX
        const newRectId = copyRect(copiedRectId as string, x)
        setSelectedRectId(newRectId)
        updateTransformer()
        markSelectionAsChanged()
        break
      }
      default: {
        console.warn(`{ onMenuItemSelect }\noption '${option}' was not found`)
      }
    }
  }
  function onStageContainerResize(size: {width: number, height: number}) {
    if (!stageRef.current) return
    stageRef.current!.size(size)
    setScaleParamsRef({...scaleParamsRef, currentScale: 1})
    setImageConfig({...imageConfig, width: layerRef.current!.width(), height: layerRef.current!.height()})

    remapEntities()
    stageRef.current!.draw()
  }
  function setImage(imageUrl: string) {
    console.debug('[MarkupWidget]::setImage(...)')
    console.debug('imageUrl:\n', imageUrl)
    layerRef.current!.scale({ x: 1, y: 1 })
    layerRef.current!.x(0)
    layerRef.current!.size({ width: stageRef.current!.width(), height: stageRef.current!.height() })
    const image = new window.Image()
    image.src = imageUrl
    image.onload = () => {
      setImageConfig({...imageConfig, image, width: layerRef.current!.width(), height: layerRef.current!.height()})
    }
  }

  useCallback(() => {
    const currentScale = layerRef.current!.scaleX()
    if (Math.abs(currentScale - scaleParamsRef.currentScale) < 1e-10) return
    let layerOffset = layerRef.current!.x()
    if (isNaN(layerOffset) || layerOffset === 0) {
      const offset = (layerRef.current!.width() * layerRef.current!.scaleX() - stageRef.current!.width()) / 2
      zoom(offset, scaleParamsRef.currentScale)
      return
    }
    const pointerX = layerOffset / (layerRef.current!.width() * layerRef.current!.scaleX() - stageRef.current!.width()) * stageRef.current!.width() * -1
    const offset = pointerX - pointerX * scaleParamsRef.currentScale
    zoom(offset, scaleParamsRef.currentScale)
    scrolllayerRef.current!.batchDraw()
  }, [scaleParamsRef])

  useCallback(() => {
    if (imageUrl) {
      setImage(imageUrl)
    }
  }, [imageUrl])

  useCallback(() => {
    setRects(_mapEntitiesToRects(entities))
  }, [mapToLength, entities])

  useCallback(() => {
    setCurrentTimePointerConfig(_mapCurrentTime(currentTime))
  }, [currentTime])

  useEffect(() => {
    if (imageUrl) setImage(imageUrl)
  }, []);


  return (
    <div>
      <div
        id="stage-container"
        // пока вбил руками 600х300, вообще надо из пропсов брать (?)
        style={{ width: '600px', height: '300px', marginBottom: '20px' }}
      >
        {/* <q-resize-observer @resize="onStageContainerResize" /> */}
      </div>
      <div>
        <Stage
          ref={stageRef}
          {...stageConfig}
          onMouseDown={handleStageMouseDown}
          onMouseUp={handleStageMouseUp}
          onWheel={handleWheel}
        >
          <Layer
            ref={layerRef}
            onMouseMove={handleMouseMove}
          >
            <KImage
              ref={imageRef}
              {...imageConfig}
            />
            <Rect
              key={'currentTimePointer'}
              {...currentTimePointerConfig}
            />
            {
              textItems.map(textConfig => (
                <KText
                  key={textConfig.id}
                  {...textConfig}
                />
              ))
            }
            {
              rects.concat(rectBuffer ? [rectBuffer] : []).map(rectConfig => (
                <Rect
                  key={rectConfig.id}
                  {...rectConfig}
                  onTransformEnd={handleTransformEnd}
                  onDragMove={handleDragMove}
                />
              ))
            }
            <Transformer ref={transformerRef} rotateEnabled={false} enabledAnchors={['middle-left', 'middle-right']} />
          </Layer>
          <Layer ref={scrollLayerRef}>
            <Rect
              id={'scrollBarSlider'}
              ref={horizontalScrollBarRef}
              {...horizontalScrollbarConfig}
              onDragMove={handleHorizontalScroll}
            />
          </Layer>
        </Stage>
      </div>
    </div>
  )
}

export default Edit;
