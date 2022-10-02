import { useAtom } from "jotai";
import Konva from "konva";
import { ImageConfig } from "konva/lib/shapes/Image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Stage, Image, Layer } from "react-konva";
import useImage from "use-image";

const Edit = () => {
  function handleClick(arg: any) {

  }

  const imageURL = 'https://www.frolov-lib.ru/books/hi/ch03.files/image010.jpg';
  const [image] = useImage(imageURL);

  useEffect(() => {
    const stageWidth = window.innerWidth - 64;
    const stageHeight = 500;

    var stage = new Konva.Stage({
      container: 'container',
      width: stageWidth,
      height: stageHeight,
    });

    var layer = new Konva.Layer();
    stage.add(layer);

    var bg = new Konva.Image({
      image: image,
      width: 3000,
      height: 500,
    });

    layer.add(bg);

    var scrollContainer = document.getElementById('scroll-container');
    function repositionStage() {
      if (!scrollContainer) return

      var dx = scrollContainer.scrollLeft;
      var dy = scrollContainer.scrollTop;
      stage.container().style.transform =
        'translate(' + dx + 'px, ' + dy + 'px)';
      stage.x(-dx);
      stage.y(-dy);
    }
    scrollContainer?.addEventListener('scroll', repositionStage);
    repositionStage();
  }, []);


  return (
    // <Stage ref={stageRef} width={stageWidth} height={stageHeight}>
    //   <Layer
    //     ref={layerRef}
    //     onClick={ handleClick }
    //   >
    //     <Image
    //       ref={imageRef}
    //       image={imageConfig.current.image}
    //       width={imageWidth}
    //       height={imageHeight}
    //     />
    //   </Layer>
    // </Stage>

    <div
      id="scroll-container"
      style={{
        width: 'calc(100% - 64px)',
        height: '500px',
        overflow: 'auto',
        margin: '10px',
        border: '1px solid grey',
      }}
    >
      <div id="large-container" style={{ width: '3000px', height: '500px', overflow: 'hidden' }}>
        <div id="container"></div>
      </div>
    </div>
  );
};

export default Edit;
