import { Menu, MenuItem, MenuList } from "@chakra-ui/menu";
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { RectConfig } from "konva/lib/shapes/Rect";
import { EntityDto } from "models/markup";
import {
  BaseSyntheticEvent,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  Stage,
  Layer,
  Image as KImage,
  Text as KText,
  Transformer,
  Rect,
} from "react-konva";
import { createEmptyImage } from "./composables/createEmptyImage";
import {
  mapEntityDtoToRectConfig,
  mapRectConfigToEntityDto,
  mapStagePositionToTime,
  mapTimeToStagePosition,
} from "./composables/mapper";

interface IEdit {
  width?: number;
  entities: EntityDto[];
  imageURL: string | undefined;
  currentTime: number;
  audioDuration: number | null;

  onEntityRemoved: (id: string) => void;
  onEntityCreated: (entity: { beginTime: number; endTime: number }) => void;
  onEntityUpdated: (entity: {
    id: string;
    beginTime: number;
    endTime: number;
  }) => void;
  onEntitySelected: (id: string | null, rightClick?: boolean) => void;
  onPointerPositionChanged: (time: number) => void;
}

let INITIAL_STAGE_WIDTH = 1082;
const INITIAL_STAGE_HEIGHT = 200;

const Edit = forwardRef(
  (
    {
      width,
      entities,
      imageURL,
      currentTime = 0,
      audioDuration,
      onEntityCreated,
      onEntityUpdated,
      onEntityRemoved,
      onEntitySelected,
      onPointerPositionChanged,
    }: IEdit,
    ref
  ) => {
    let [creatingNewRect, setCreatingNewRect] = useState<boolean>(false);
    let [rectWasMoved, setRectWasMoved] = useState<boolean>(false);
    let rectWasChanged = false;
    let [stretchingRight, setStretchingRight] = useState<boolean>(false);
    let [transformerIsActive, setTransformerIsActive] =
      useState<boolean>(false);
    let [showMenu, setShowMenu] = useState<boolean>(false);
    let [menuOffset, setMenuOffset] = useState<{ x: number; y: number }>({
      x: 0,
      y: 0,
    });

    const stageRef = useRef<Konva.Stage>(null);
    const layerRef = useRef<Konva.Layer>(null);
    const imageRef = useRef<Konva.Image>(null);
    const transformerRef = useRef<Konva.Transformer>(null);
    const imageConfig = useRef<Konva.ImageConfig>({
      image: createEmptyImage(),
      width: INITIAL_STAGE_WIDTH,
      height: INITIAL_STAGE_HEIGHT,
    });
    const stageConfig = useRef<Konva.StageConfig>({
      container: "scroll-container",
      width: INITIAL_STAGE_WIDTH,
      height: INITIAL_STAGE_HEIGHT,
    });
    const [currentTimePointerPosition, setCurrentTimePointerPosition] =
      useState(0);

    const [rects, setRects] = useState<Konva.RectConfig[]>([]);
    const [editedRect, setEditedRect] = useState<Konva.RectConfig | null>(null);

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
      console.debug("deleteSelectedEntity");

      if (editedRect?.id) {
        console.debug(
          "[Edit] calling onEntityRemoved for rect with id:",
          editedRect.id
        );
        onEntityRemoved(editedRect.id);
        setEditedRect(null);
        onEntitySelected(null);
      }

      setShowMenu(false);
    }

    function deleteEditedRect() {
      console.debug("deleteEditedRect");
      if (!editedRect) {
        console.error("editedRect is null!");
        return;
      }

      const editedRectNode = layerRef.current?.children?.find(
        (child) => child.id() === editedRect?.id
      ) as Konva.Rect;
      const x = editedRect.x ?? 0;
      if (!editedRectNode) {
        console.error("editedRectNode was not found!");
        return;
      }
      editedRectNode.destroy();
      const updatedRects = rects.filter((child) => child.id !== editedRect.id);
      setRects(updatedRects);
      setEditedRect(null);
      onEntitySelected(null);
      onPointerPositionChanged(
        mapStagePositionToTime(x, audioDuration!, stageRef.current?.width()!)
      );
    }

    function createRectConfig(
      x: number,
      width: number,
      text: string = "",
      fillColor = "yellow"
    ): Konva.RectConfig {
      return {
        id: "new",
        x: x,
        width: 1,
        scaleX: width,
        name: text,
        height: layerRef.current?.height(),
        fill: fillColor,
        opacity: 0.2,
        draggable: true,
      };
    }

    function addNewRect(x: number): string {
      console.debug("{ addNewRect }");

      const newRect = createRectConfig(x, 1);
      setRects(rects.concat(newRect));

      setEditedRect(newRect);

      return newRect.id as string;
    }

    function updateTransformer(editedRect: RectConfig | null) {
      console.debug("updateTransformer");
      console.debug("[updateTransformer] editedRect:", editedRect);

      const editedRectNode =
        layerRef?.current?.children?.find(
          (child) => child.id() === editedRect?.id
        ) ?? null;
      console.debug("[updateTransformer] editedRectNode:", editedRectNode);

      if (transformerRef.current?.nodes()[0] === editedRectNode) return;
      transformerRef.current?.nodes(editedRectNode ? [editedRectNode] : []);

      setTransformerIsActive(
        transformerRef.current?.nodes().length ? true : false
      );
    }

    // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
    /** Сущности из props.entities преобразуются в фигуры канваса */
    function mapEntitiesToRects() {
      const stageWidth = stageRef.current?.width();
      const stageHeight = stageRef.current?.height();
      if (stageWidth && stageHeight && audioDuration) {
        const editedRectId = editedRect?.id;
        const rects = entities.map((entity) =>
          mapEntityDtoToRectConfig(
            entity,
            audioDuration,
            stageWidth,
            stageHeight
          )
        );
        setRects(rects);
        if (editedRectId && editedRectId !== "new") {
          const rect = rects.find((r) => r.id === editedRectId) ?? null;
          setEditedRect(rect);
        }
      }
    }

    /********************** */

    // ОБРАБОТЧИКИ СОБЫТЫЙ //
    function handleStageMouseDown(e: KonvaEventObject<MouseEvent>) {
      console.debug("handleStageMouseDown");

      // Игнорируем нажатие ПКМ
      if (e.evt.button === 2) {
        return;
      }

      // Если клик по сцене при открытом меню - закрываем меню
      if (showMenu) {
        setShowMenu(false);
        return;
      }

      // Игнорируем клик на трансформер
      if (e.target.parent?.className === "Transformer") return;
      // Игнорируем клик на редактируемый блок
      if (transformerRef.current?.nodes()[0] === e.target) return;

      // Обрабатываем клики по прямоугольникам, кроме ползунка
      if (
        e.target.className === "Rect" &&
        e.target.id() !== "currentTimePointer"
      ) {
        const editedRect =
          rects.find((child) => child.id === e.target.id()) ?? null;
        setEditedRect(editedRect);
        return;
      }

      setCreatingNewRect(true);
      const pointer = stageRef.current?.getPointerPosition();
      if (!pointer || !stageRef.current) return;
      const x = (pointer.x - stageRef.current.x()) / stageRef.current.scaleX();

      addNewRect(x);
    }

    function handleStageMouseUp(e: KonvaEventObject<MouseEvent>) {
      console.debug("handleStageMouseUp");

      if (e.evt.button === 2) {
        return;
      }

      if (creatingNewRect) {
        setCreatingNewRect(false);
        setRectWasMoved(false);

        if (!rectWasMoved && editedRect?.width === 1) {
          // Если после клика rect не менялся, то удаляем
          deleteEditedRect();
          return;
        }

        if (!editedRect) {
          console.error("editedRect is null");
          return;
        }

        editedRect.scaleX = editedRect?.width;
        editedRect.width = 1;

        onEntityCreated(
          mapRectConfigToEntityDto(
            editedRect,
            audioDuration!,
            stageRef.current!.width()
          )
        );
        setEditedRect(null);
        onEntitySelected(null);
      } else {
        if (rectWasMoved && editedRect !== null) {
          onEntityUpdated(
            mapRectConfigToEntityDto(
              editedRect,
              audioDuration!,
              stageRef.current!.width()
            )
          );
          setRectWasMoved(false);
          return;
        }
        setRectWasMoved(false);

        if (rectWasChanged) {
          rectWasChanged = false;
          return;
        }

        if (transformerRef.current?.nodes()[0] === e.target) {
          onEntitySelected(editedRect?.id ?? null);
          return;
        }

        if (
          e.target.className === "Rect" &&
          e.target.id() !== "currentTimePointer"
        ) {
          onEntitySelected(editedRect?.id ?? null);
          return;
        }

        if (transformerIsActive) {
          setEditedRect(null);
          onEntitySelected(null);
          return;
        }
      }
    }

    function handleMouseMove(e: any) {
      // console.debug('handleMouseMove')

      if (!creatingNewRect || !editedRect || !stageRef.current) return;
      // setRectWasMoved(true)

      const editedRectNode =
        layerRef?.current?.children?.find(
          (child) => child.id() === editedRect?.id
        ) ?? null;
      if (!editedRectNode) return;

      const rect = {
        x: editedRectNode.x(),
        width: editedRectNode.width(),
      };

      const pointer = stageRef.current.getPointerPosition();
      if (!rect || !pointer) return;
      const mouseX =
        (pointer.x - stageRef.current.x()) / stageRef.current.scaleX();
      const rectX = rect.x ? rect.x : 0;
      const rectWidth = rect.width ? rect.width : 0;
      const rect_left = rectX;
      const rect_right = rectX + rectWidth;
      if (mouseX > rect_right) {
        if (stretchingRight) {
          rect.width = mouseX - rectX;
        } else {
          rect.width = mouseX - rect_right;
          rect.x = rect_right;
          setStretchingRight(true);
        }
      } else if (mouseX < rect_left) {
        if (!stretchingRight) {
          rect.width = rect_right - mouseX;
          rect.x = mouseX;
        } else {
          setStretchingRight(false);
          rect.width = rect_left - mouseX;
          rect.x = mouseX;
        }
      } else {
        if (stretchingRight) {
          rect.width = mouseX - rectX;
        } else {
          rect.width = rect_right - mouseX;
          rect.x = mouseX;
        }
      }

      if (rect.x) {
        editedRect.x = rect.x;
      }
      editedRect.width = rect.width;

      /** */
      const curRect = rects.find((rect) => rect.id === editedRect.id) ?? null;
      if (!curRect) {
        console.error("curRect is null");
        return;
      }

      if (rect.x) {
        curRect.x = editedRect.x;
      }
      curRect.width = editedRect.width;

      setRects(rects.filter((r) => r.id !== curRect.id).concat([curRect]));
      /** */
    }

    function handleTransformEnd(e: KonvaEventObject<Event>) {
      console.debug("handleTransformEnd");

      const rect = e.target;
      if (rect.x() < 0) {
        rect.scaleX((rect.width() * rect.scaleX() + rect.x()) / rect.width());
        rect.x(0);
      }
      if (
        rect.x() + rect.width() * rect.scaleX() >
        layerRef.current!.width() * layerRef.current!.scaleX()
      ) {
        rect.scaleX(
          (layerRef.current!.width() * layerRef.current!.scaleX() - rect.x()) /
            rect.width()
        );
      }
      const rectId = (rect.attrs as { id: string }).id;
      const srcRect = rects.find((r: Konva.RectConfig) => r.id === rectId);
      if (!srcRect) return;
      srcRect.x = rect.x();
      srcRect.scaleX = rect.width() * rect.scaleX();
      srcRect.width = 1;

      // Если изменяем существующую сущность - вызываем обновление
      if (rectId === "new") return;
      onEntityUpdated(
        mapRectConfigToEntityDto(
          srcRect,
          audioDuration!,
          stageRef.current!.width()
        )
      );
      rectWasChanged = true;
    }

    function handleDragMove(e: KonvaEventObject<DragEvent>) {
      const transformer = e.target as unknown as Konva.Transformer;
      const rect = transformer.nodes()[0] as Konva.Rect;
      // const rect = rects.find((r: Konva.RectConfig) => r.id === e.target.id())
      if (rect) {
        moveRect(rect);
        setRectWasMoved(true);
      }
    }

    function moveRect(rect: Konva.Rect) {
      console.debug("moveRect");

      const layerWidth = layerRef.current!.width() * layerRef.current!.scaleX();
      const layerHeight =
        layerRef.current!.height() * layerRef.current!.scaleY();
      const newPosX =
        rect.x() < 0
          ? 0
          : rect.x() + rect.width() * rect.scaleX() > layerWidth
          ? layerWidth - rect.width() * rect.scaleX()
          : rect.x();
      const newPosY =
        rect.y() < 0
          ? 0
          : rect.y() + rect.height() > layerHeight
          ? layerHeight - rect.height()
          : rect.y();
      rect.position({ x: newPosX, y: newPosY });
      const rectId = (rect.attrs as { id: string }).id;
      const srcRect = rects.find((r: Konva.RectConfig) => r.id === rectId);
      if (!srcRect) return;
      srcRect.x = newPosX;
      srcRect.y = newPosY;
    }

    function setStageWidth(width?: number) {
      const newWidth = width ?? INITIAL_STAGE_WIDTH;
      stageRef.current!.width(newWidth);
      imageRef.current!.width(newWidth);
    }

    function handleContextMenu(e: KonvaEventObject<PointerEvent>) {
      console.debug("handleContextMenu");

      const editedRect =
        rects.find((child) => child.id === e.target.id()) ?? null;
      setEditedRect(editedRect);
      onEntitySelected(editedRect?.id ?? null, true);

      const pointerPosition = stageRef.current?.getPointerPosition();
      if (!pointerPosition) {
        console.error("pointerPosition on stage was not found");
        return;
      }

      setMenuOffset(pointerPosition);
      setShowMenu(true);
    }

    function handleWheel(e: KonvaEventObject<WheelEvent>) {
      e.evt.preventDefault();
      if (!stageRef.current) return;

      const SCALE_BY = 1.045;
      if (e.evt.ctrlKey) {
        const oldScaleX = stageRef.current.scaleX();
        let newScale =
          e.evt.deltaY < 0 ? oldScaleX * SCALE_BY : oldScaleX / SCALE_BY;
        if (Math.abs(newScale - 1) < 1e-10) newScale = 1;

        zoom(newScale);
      }
    }

    function zoom(newScale: number, position?: number) {
      if (!stageRef.current) return;

      const oldScaleX = stageRef.current.scaleX();
      const pointer = position
        ? position
        : stageRef.current.getPointerPosition()?.x ??
          stageRef.current.width() / 2;
      const oldStagePos = pointer - stageRef.current.x();

      const newWidth = INITIAL_STAGE_WIDTH * newScale;
      if (newWidth < INITIAL_STAGE_WIDTH) {
        newScale = 1;
      }

      const newStagePos = (oldStagePos / oldScaleX) * newScale;
      let newScrollLeft = newStagePos - pointer;

      const stageWidth = stageRef.current.width();

      /**
       * stageWidth * newScale - newScrollLeft < stageWidth
       * =>
       * newScrollLeft/stageWidth > newScale - 1
       */
      if (newScrollLeft / stageWidth > newScale - 1) {
        newScrollLeft = stageWidth * (newScale - 1);
      }
      if (newScrollLeft < 0) {
        newScrollLeft = 0;
      }

      stageRef.current!.scaleX(newScale);
      stageRef.current!.x(-newScrollLeft);
    }

    function handleScroll(e: BaseSyntheticEvent<WheelEvent>) {
      if (!stageRef.current || !e.nativeEvent.deltaX) return;

      const maxOffset = 0;
      const minOffset =
        stageRef.current.width() * (1 - stageRef.current.scaleX());
      let newX = stageRef.current.x() - e.nativeEvent.deltaX;
      newX = newX > maxOffset ? maxOffset : newX < minOffset ? minOffset : newX;

      stageRef.current.x(newX);
    }
    /********************** */
    useEffect(() => setStageWidth(width), [width]);

    useEffect(() => {
      if (imageURL) (imageConfig.current.image as HTMLImageElement).src = imageURL;
    }, [imageURL]);

    useEffect(() => {
      updateTransformer(editedRect);
    }, [editedRect]);

    useEffect(() => {
      const stageWidth = stageRef.current?.width();
      if (stageWidth && audioDuration) {
        setCurrentTimePointerPosition(
          mapTimeToStagePosition(currentTime, audioDuration, stageWidth)
        );
      }
    }, [currentTime, audioDuration]);

    useEffect(mapEntitiesToRects, [width, audioDuration, entities]);

    useImperativeHandle(ref, () => ({
      zoomIn,
      zoomOut,
    }));

    return (
      <div
        id="scroll-container"
        style={{ overflow: "auto", position: "relative" }}
        onWheel={handleScroll}
        onContextMenu={(e) => {
          e.nativeEvent.preventDefault();
          e.nativeEvent.stopPropagation();
        }}
      >
        {/* <Stage
          width={120}
          height={100}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            zIndex: 10,
          }}
        >
          <Layer>
            <Rect width={120} height={100} fill={"black"} opacity={0.8} />
            <KText
              y={0}
              text={"creatingNewRect"}
              fill={creatingNewRect ? "lightgreen" : "red"}
            />
            <KText
              y={15}
              text={"rectWasMoved"}
              fill={rectWasMoved ? "lightgreen" : "red"}
            />
            <KText
              y={30}
              text={"transformerIsActive"}
              fill={transformerIsActive ? "lightgreen" : "red"}
            />
            <KText
              y={45}
              text={"editedRect"}
              fill={editedRect ? "lightgreen" : "red"}
            />
            <KText
              y={60}
              text={`[ ${rects.map((r) => r.id).join(", ")} ]`}
              fill={editedRect ? "lightgreen" : "red"}
            />
          </Layer>
        </Stage> */}
        <Stage
          ref={stageRef}
          {...stageConfig.current}
          onMouseDown={handleStageMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleStageMouseUp}
          onWheel={handleWheel}
        >
          <Layer ref={layerRef}>
            <KImage ref={imageRef} {...imageConfig.current} />
            <Rect
              key="currentTimePointer"
              id="currentTimePointer"
              visible={currentTime > 0}
              x={currentTimePointerPosition}
              width={1}
              scaleX={1 / (stageRef.current?.scaleX() ?? 1)}
              height={stageRef.current?.height()}
              fill={"red"}
            />
            {rects.map((rect) => (
              <Rect {...rect} key={rect.id} onContextMenu={handleContextMenu} />
            ))}
            <Transformer
              ref={transformerRef}
              rotateEnabled={false}
              enabledAnchors={["middle-left", "middle-right"]}
              onDragMove={handleDragMove}
              onTransformEnd={handleTransformEnd}
            />
          </Layer>
        </Stage>
        <Menu isOpen={showMenu}>
          <MenuList
            fontSize={"12px"}
            minWidth={"50px"}
            style={{
              position: "absolute",
              display: showMenu ? "block" : "none",
              top: menuOffset.y,
              left: menuOffset.x,
            }}
          >
            <MenuItem onClick={deleteSelectedEntity}>Удалить</MenuItem>
          </MenuList>
        </Menu>
      </div>
    );
  }
);

export default Edit;
