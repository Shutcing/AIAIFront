import { useContext, useEffect, useState } from "react";
import { Context } from "./Context.jsx";
import "./Timeline.css";
import { PersonalLine } from "./PersonalLine";
import "./Zero.css";

export function Timeline() {
  const {
    isAdd,
    setIsAdd,
    selectedImages,
    setSelectedImages,
    isPlaying,
    setIsPlaying,
    animationObjects,
    animationId,
    setAnimationId,
    animationTime,
    setAnimationTime,
  } = useContext(Context);

  const timeDots = [];
  const WIDTH = window.screen.width;
  const timeStep = WIDTH * 0.05;
  for (let i = 0; i < 100; i++) {
    timeDots.push(
      <div
        className="timeDot"
        key={i}
        style={{
          padding: `${WIDTH * 0.003}px`,
          margin: `0 ${timeStep - WIDTH * 0.006}px 0 0`,
        }}
      ></div>
    );
  }
  const [cursorValue, setCursorValue] = useState(-WIDTH * 0.0125 + 5);
  const [isDragging, setIsDragging] = useState(false); // Отслеживание состояния перетаскивания
  const [startX, setStartX] = useState(0); // Начальная позиция мыши
  const [initialCursorValue, setInitialCursorValue] = useState(0); // Начальное значение

  function roundTo(num, decimals) {
    const factor = Math.pow(10, decimals);
    return Math.round(num * factor) / factor;
  }

  // Начало перетаскивания
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.clientX); // Сохраняем начальную позицию мыши
    setInitialCursorValue(cursorValue); // Сохраняем текущее значение cursorValue
  };

  // Перемещение курсора
  const handleMouseMove = (e) => {
    if (!isDragging) {
      return;
    }

    // Разница в позициях мыши
    const deltaX = e.clientX - startX;

    // Обновляем значение cursorValue на основе deltaX
    let newValue = initialCursorValue + deltaX;
    setAnimationTime(Math.max((newValue + WIDTH * 0.0125 - 5) / timeStep, 0));
    newValue = newValue >= -WIDTH * 0.0125 + 5 ? newValue : -WIDTH * 0.0125 + 5;
    setCursorValue(newValue);
  };

  // Завершение перетаскивания
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const toggleAnimation = (e) => {
    if (isPlaying) {
      setIsPlaying(false);
      clearInterval(animationId);
    } else {
      setIsPlaying(true);
      for (let key of Object.keys(animationObjects)) {
        let objectAnimation = animationObjects[key][2][0];
        if (objectAnimation.states) {
          let x = objectAnimation.states.start[0];
          let y = objectAnimation.states.start[1];

          let objWrapper = document.querySelector(`#o${key}`);
          objWrapper.style.transform = `translate(${x}px, ${y}px)`;
        }
      }

      let x = -WIDTH * 0.0125 + 5;
      let id = setInterval(() => {
        setCursorValue(x);
        setAnimationTime(Math.max((x + WIDTH * 0.0125 - 5) / timeStep, 0));
        x += timeStep / 100;
      }, 10);
      setAnimationId(id);
    }
  };

  return (
    <div className="timeline">
      <div className="timeline__container">
        <div className="timeline__play">
          <div className="play" onClick={toggleAnimation}>
            <img
              src={isPlaying ? "./playSquare.svg" : "./playTriangle.svg"}
              alt=""
            />
          </div>
        </div>
        <div
          className="timeline__line"
          style={{
            margin: `0 0 0 ${timeStep}px`,
          }}
        >
          <div
            className="timeline__cursor cursor"
            onMouseDown={handleMouseDown}
            style={{ left: `${cursorValue}px` }}
          >
            <div className="cursor__value">
              {((cursorValue + WIDTH * 0.0125 - 5) / timeStep).toFixed(2)}
            </div>
            <div className="cursor__dash"></div>
          </div>
          {timeDots}
        </div>
        <div className="timeline__box">
          {selectedImages.map((layerTitle, ind) => (
            <PersonalLine
              key={ind}
              id={ind}
              marginLeft={timeStep}
              name={`object ${ind}`}
            ></PersonalLine>
          ))}
        </div>
      </div>
    </div>
  );
}
