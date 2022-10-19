import Konva from "konva";

// https://konvajs.org/docs/sandbox/Canvas_Scrolling.html#:~:text=4.%20Emulate%20screen%20moving%20with%20transform.
export function useRepositionStage(stage: Konva.Stage, scrollContainer: HTMLElement | null) {
  if (scrollContainer === null) {
    console.warn('[useRepositionStage] scrollContainer was not provided (equals null)')
  }

  return () => {
    if (!scrollContainer) return

    var dx = scrollContainer.scrollLeft;
    var dy = scrollContainer.scrollTop;
    stage.container().style.transform =
      'translate(' + dx + 'px, ' + dy + 'px)';
    stage.x(-dx);
    stage.y(-dy);
  }
}