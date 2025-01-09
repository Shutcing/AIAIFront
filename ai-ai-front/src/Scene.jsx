import "./Scene.css";
import "./Zero.css";
import { useContext, useState, useRef, useCallback } from "react";
import { AnimationMenu } from "./AnimationMenu.jsx";
import { Context } from "./Context.jsx";
import { Object as _Object } from "./Object.jsx";

export function Scene({ selectedImages }) {
  const {
    animationObjects,
    setAnimationObjects,
    currentObjectId,
    setCurrentObjectId,
    sceneColor,
    setSceneColor,
  } = useContext(Context);
  const [scale, setScale] = useState(1);
  const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [isDraggingObject, setIsDraggingObject] = useState(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const cameraStart = useRef({ x: 0, y: 0 });
  const offsetStart = useRef({ x: 0, y: 0 });

  const handleWheel = useCallback(
    (e) => {
      const isCtrlZoom = e.ctrlKey;
      const zoomIntensity = 0.01;

      if (isCtrlZoom) {
        const rect = e.target.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const newScale = Math.min(
          Math.max(scale - e.deltaY * zoomIntensity * 0.1, 0.1),
          3
        );

        setCameraOffset((prev) => ({
          x: mouseX - ((mouseX - prev.x) / scale) * newScale,
          y: mouseY - ((mouseY - prev.y) / scale) * newScale,
        }));
        setScale(newScale);
      } else {
        setCameraOffset((prev) => ({
          x: prev.x - e.deltaX / scale,
          y: prev.y - e.deltaY / scale,
        }));
      }
    },
    [scale]
  );

  const handleMouseDownObject = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    if (animationObjects[String(index)]) {
      setIsDraggingObject(index);
      const object = animationObjects[String(index)];
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
      };
      offsetStart.current = {
        x: object[1][0],
        y: object[1][1],
      };
    }
  };

  const handleMouseDownCanvas = (e) => {
    if (e.detail === 2) {
      setIsDraggingCanvas(true);
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
      };
      cameraStart.current = { ...cameraOffset };
    }
  };

  const handleMouseMove = (e) => {
    if (isDraggingObject !== null) {
      const newAnimationObjects = { ...animationObjects };
      const currentObject = newAnimationObjects[String(isDraggingObject)];

      if (currentObject) {
        currentObject[1] = [
          offsetStart.current.x + (e.clientX - dragStart.current.x) / scale,
          offsetStart.current.y + (e.clientY - dragStart.current.y) / scale,
        ];
        setAnimationObjects(newAnimationObjects);
      }
    } else if (isDraggingCanvas) {
      setCameraOffset({
        x: cameraStart.current.x + (e.clientX - dragStart.current.x) / scale,
        y: cameraStart.current.y + (e.clientY - dragStart.current.y) / scale,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDraggingCanvas(false);
    setIsDraggingObject(null);
  };

  const setCurrentObjectIdNull = (e) => {
    if (
      !document.querySelector(".choosePanel__opacityTools") &&
      e.target.className != "object" &&
      e.target.className != "choosePanel__item"
    ) {
      setCurrentObjectId(null);
    }
  };

  return (
    <div
      className="animationWindow"
      onWheel={handleWheel}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseDown={handleMouseDownCanvas}
      onClick={setCurrentObjectIdNull}
      style={{
        cursor:
          isDraggingObject !== null || isDraggingCanvas ? "grabbing" : "grab",
        overflow: "hidden",
        position: "relative",
        background: `${sceneColor}`,
      }}
    >
      <div
        className="animationWindowWrapper"
        style={{
          transform: `translate(${cameraOffset.x}px, ${cameraOffset.y}px) scale(${scale})`,
          transformOrigin: "0 0",
        }}
      >
        {selectedImages.map((image, index) => {
          return (
            <>
              <div
                key={index}
                className="sceneContent"
                id={`o${index}`}
                style={{
                  transform: `translate(${
                    animationObjects[String(index)]?.[1]?.[0] || 0
                  }px, ${animationObjects[String(index)]?.[1]?.[1] || 0}px)`,
                  transformOrigin: "0 0",
                  position: "absolute",
                }}
                onMouseDown={(e) => handleMouseDownObject(e, index)}
              >
                <_Object index={index} src={image}></_Object>
              </div>
            </>
          );
        })}
        <div
          className="sceneContent"
          style={{
            transform: `translate(${
              animationObjects[String(currentObjectId)]?.[1]?.[0] || 0
            }px, ${
              animationObjects[String(currentObjectId)]?.[1]?.[1] || 0
            }px)`,
            transformOrigin: "0 0",
            position: "absolute",
          }}
        >
          <AnimationMenu
            scale={scale}
            currentObj={
              document.querySelector(`#o${currentObjectId}`) != null
                ? document
                    .querySelector(`#o${currentObjectId}`)
                    .children[0].getBoundingClientRect()
                : { width: 0, height: 0 }
            }
          ></AnimationMenu>
        </div>
      </div>
    </div>
  );
}
