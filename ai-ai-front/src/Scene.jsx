import "./Scene.css";
import "./Zero.css";
import { useContext, useState, useRef, useCallback, useEffect } from "react";
import { AnimationMenu } from "./AnimationMenu.jsx";
import { Context } from "./Context.jsx";
import { Object as _Object } from "./Object.jsx";

export function Scene({ selectedImages }) {
  const {
    animationObjects,
    setAnimationObjects,
    currentObjectId,
    setCurrentObjectId,
    setSelectedImages,
    sceneColor,
    setSceneColor,
    addIsReadyToMove,
    imgFiles,
    setImgFiles,
    // Возможно у вас есть еще поля, не удаляйте их!
  } = useContext(Context);

  const [scale, setScale] = useState(1);
  const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [isDraggingObject, setIsDraggingObject] = useState(null);

  // Сюда сохраним &laquo;скопированный объект&raquo; (и ссылка на его картинку)
  const [copiedObject, setCopiedObject] = useState(null);

  const dragStart = useRef({ x: 0, y: 0 });
  const cameraStart = useRef({ x: 0, y: 0 });
  const offsetStart = useRef({ x: 0, y: 0 });

  /**
   * ============ ZOOM / PANNING ЛОГИКА ============
   */
  const handleWheel = useCallback(
    (e) => {
      const isCtrlZoom = e.ctrlKey;
      const zoomIntensity = 0.01;

      if (isCtrlZoom) {
        // Масштабирование (zoom in/out) вокруг точки, где находится курсор
        const rect = e.target.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const newScale = Math.min(
          Math.max(scale - e.deltaY * zoomIntensity * 0.1, 0.1),
          3
        );

        // При зуме сцены корректируем cameraOffset так, чтобы &laquo;визуально&raquo; зум происходил под курсором
        setCameraOffset((prev) => ({
          x: mouseX - ((mouseX - prev.x) / scale) * newScale,
          y: mouseY - ((mouseY - prev.y) / scale) * newScale,
        }));
        setScale(newScale);
      } else {
        // Горизонтальная/вертикальная прокрутка (перемещение камеры)
        // Убираем деление на scale, чтобы панорамирование ощущалось одинаково при любом масштабе
        setCameraOffset((prev) => ({
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY,
        }));
      }
    },
    [scale]
  );

  const handleMouseDownCanvas = (e) => {
    // Двойной клик => перемещение всей сцены (panning)
    if (e.detail === 2) {
      setIsDraggingCanvas(true);
      dragStart.current = { x: e.clientX, y: e.clientY };
      cameraStart.current = { ...cameraOffset };
    }
  };

  const handleMouseMove = (e) => {
    // Перетаскиваем объект
    if (isDraggingObject !== null) {
      const newAnimationObjects = { ...animationObjects };
      const currentObject = newAnimationObjects[String(isDraggingObject)];

      if (currentObject) {
        // Объекты живут в &laquo;логических&raquo; координатах, поэтому делим дельту мыши на scale
        currentObject[1] = [
          offsetStart.current.x + (e.clientX - dragStart.current.x) / scale,
          offsetStart.current.y + (e.clientY - dragStart.current.y) / scale,
        ];
        setAnimationObjects(newAnimationObjects);
      }
    }
    // Перетаскиваем камеру
    else if (isDraggingCanvas) {
      // Здесь убираем деление на scale, чтобы панорамировать с одинаковой скоростью
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setCameraOffset({
        x: cameraStart.current.x + dx,
        y: cameraStart.current.y + dy,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDraggingCanvas(false);
    setIsDraggingObject(null);
  };

  /**
   * ============ ПЕРЕМЕЩЕНИЕ КОНКРЕТНОГО ОБЪЕКТА (drag'n'drop) ============
   */
  const handleMouseDownObject = (e, index) => {
    e.preventDefault();
    e.stopPropagation();

    if (animationObjects[String(index)]) {
      setIsDraggingObject(index);
      const object = animationObjects[String(index)];
      dragStart.current = { x: e.clientX, y: e.clientY };
      offsetStart.current = { x: object[1][0], y: object[1][1] };
    }
  };

  /**
   * ============ СНЯТИЕ ВЫДЕЛЕНИЯ КЛИКОМ ПО ПУСТОМУ МЕСТУ ============
   */
  const setCurrentObjectIdNull = (e) => {
    if (
      !document.querySelector(".choosePanel__opacityTools") &&
      e.target.className !== "object" &&
      e.target.className !== "choosePanel__item"
    ) {
      setCurrentObjectId(null);
    }
  };

  /**
   * ============ ГЛОБАЛЬНАЯ ОБРАБОТКА CTRL+C / CTRL+V ============
   * Копируем &laquo;текущий объект&raquo; по currentObjectId, вставляем как новый.
   */
  function updateString(inputString) {
    function removeNumberSubstrings(input) {
      // Регулярное выражение для удаления подстрок в формате "(число)"
      const regex = /\(\d+\)$/; // Находит строки, заканчивающиеся на "(число)"
      return input.replace(regex, "").trim();
    }

    // Поиск дубликатов
    const baseName = removeNumberSubstrings(inputString);

    const existingFiles = imgFiles
      .map((f) => f.name)
      .filter((name) => removeNumberSubstrings(name) === baseName);

    // Определяем новый номер дубликата
    const newNumber = existingFiles.length + 1;

    // Создаём новое имя файла
    const newFileName = `${baseName}(${newNumber})`;

    // Создаём объект файла с новым именем
    const renamedFile = new File(
      [
        /* содержимое файла */
      ],
      newFileName,
      {
        type: "image/png", // Укажите правильный MIME-тип
        lastModified: Date.now(),
      }
    );

    // Обновляем состояние imgFiles
    setImgFiles((prev) => [...prev, renamedFile]);

    return newFileName;
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl + C
      if (e.ctrlKey && e.key === "c") {
        if (currentObjectId != null) {
          const originalObj = animationObjects[String(currentObjectId)];
          if (originalObj) {
            let copiedArr = [...originalObj];
            if (copiedArr[0]) copiedArr[0] = [...copiedArr[0]];
            if (copiedArr[1]) copiedArr[1] = [...copiedArr[1]];
            if (copiedArr[2]) copiedArr[2] = [];
            if (copiedArr[3]) copiedArr[3] = 0;
            if (copiedArr[4]) copiedArr[4] = updateString(copiedArr[4]);
            if (copiedArr[5]) copiedArr[5] = 1;

            setCopiedObject({
              imageUrl: selectedImages[currentObjectId],
              data: copiedArr,
            });
          }
        }
      }

      // Ctrl + V
      if (e.ctrlKey && e.key === "v") {
        if (copiedObject) {
          const newIndex = Object.keys(animationObjects).length;
          const newImages = [...selectedImages];
          newImages.push(copiedObject.imageUrl);

          let newData = [...copiedObject.data];
          newData[1] = [
            copiedObject.data[1][0] + 30, // смещение X
            copiedObject.data[1][1] + 30, // смещение Y
          ];

          const newAnimationObjects = { ...animationObjects };
          newAnimationObjects[String(newIndex)] = newData;

          setAnimationObjects(newAnimationObjects);
          setCurrentObjectId(newIndex);
          setSelectedImages(newImages);
          addIsReadyToMove(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    animationObjects,
    selectedImages,
    currentObjectId,
    copiedObject,
    setAnimationObjects,
    setSelectedImages,
    setCurrentObjectId,
  ]);

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
        background: sceneColor,
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
          );
        })}

        {/* Отдельно отрисовываем AnimationMenu для текущего объекта */}
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
          />
        </div>
      </div>
    </div>
  );
}
