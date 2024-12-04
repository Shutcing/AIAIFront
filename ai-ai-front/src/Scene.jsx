import "./Scene.css";
import "./Zero.css";
import { useContext, useState, useRef, useCallback } from "react";
import { Context } from "./Context.jsx";
import { Object as _Object } from "./Object.jsx";

export function Scene({ selectedImages }) {
  const {
    animationObjects,
    setAnimationObjects,
    currentObjectId,
    setCurrentObjectId,
  } = useContext(Context);
  const [scale, setScale] = useState(1); // Масштаб
  const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 }); // Смещение "камеры"
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false); // Холст перетаскивается
  const [isDraggingObject, setIsDraggingObject] = useState(null); // Индекс объекта, который сейчас перетаскивается
  const dragStart = useRef({ x: 0, y: 0 }); // Координаты начала перетаскивания
  const cameraStart = useRef({ x: 0, y: 0 }); // Начальная позиция "камеры"
  const offsetStart = useRef({ x: 0, y: 0 }); // Начальные координаты объекта

  // Обработчик масштабирования
  const handleWheel = useCallback(
    (e) => {
      // try {
      //   e.preventDefault();
      // } catch {}

      const isCtrlZoom = e.ctrlKey; // Проверяем, используется ли Ctrl + колесико
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

  // Начало перетаскивания объекта
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

  // Начало перетаскивания холста
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

  // Перетаскивание
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

  // Окончание перетаскивания
  const handleMouseUp = () => {
    setIsDraggingCanvas(false);
    setIsDraggingObject(null);
  };

  const setCurrentObjectIdNull = (e) => {
    console.log(e.target);
    if (e.target.className != "object") {
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
      </div>
    </div>
  );
}
