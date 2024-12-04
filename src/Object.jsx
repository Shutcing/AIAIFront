import "./Object.css";
import "./Zero.css";
import { useContext, useEffect, useState, useCallback } from "react";
import { Context } from "./Context.jsx";

export function Object({ index, src }) {
  const {
    animationTime,
    animationObjects,
    setAnimationObjects,
    currentObjectId,
    setCurrentObjectId,
    currentAnimationIndex,
    setcurrentAnimationIndex,
    isReadyToMove,
    isPlaying,
    setIsReadyToMove,
  } = useContext(Context);
  const [width, setWidth] = useState(window.screen.width);

  const updateWidth = useCallback(() => setWidth(window.innerWidth), []);

  useEffect(() => {
    let objWrapper = document.querySelector(`#o${index}`);
    if (
      !objWrapper ||
      !animationObjects[String(index)][2] ||
      currentAnimationIndex != null
    )
      return;

    // Проверяем, есть ли анимации
    let animations = animationObjects[String(index)][2];
    animations.sort((a, b) => a.time.start - b.time.start); // Сортируем по времени начала

    for (let animation of animations) {
      const { start, end } = animation.states;
      const { start: timeStart, end: timeEnd } = animation.time;

      if (animationTime >= timeStart && animationTime <= timeEnd) {
        // Вычисляем процент выполнения анимации
        const progress = (animationTime - timeStart) / (timeEnd - timeStart);

        // Вычисляем текущие координаты на основе прогресса
        const currentX = start[0] + progress * (end[0] - start[0]);
        const currentY = start[1] + progress * (end[1] - start[1]);

        // Применяем координаты к объекту
        objWrapper.style.transform = `translate(${currentX}px, ${currentY}px)`;
        break; // Прерываем цикл, так как нашли активную анимацию
      }

      // Если время вне диапазона анимации
      if (animationTime < timeStart) {
        objWrapper.style.transform = `translate(${start[0]}px, ${start[1]}px)`;
        break;
      } else if (animationTime > timeEnd) {
        objWrapper.style.transform = `translate(${end[0]}px, ${end[1]}px)`;
      }
    }
  }, [animationTime, animationObjects]);

  useEffect(() => {
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [updateWidth]);

  const chooseObject = () => {
    setCurrentObjectId(index);
  };

  useEffect(() => {
    let objWrapper = document.querySelector(`#o${index}`);
    if (!objWrapper) return;

    if (isPlaying) {
      let animations = [...animationObjects[String(index)][2]];

      // Сортируем анимации по времени начала
      animations.sort((a, b) => a.time.start - b.time.start);

      animations.forEach((animation) => {
        const { start, end } = animation.states;
        const duration = animation.time.end - animation.time.start;

        setTimeout(() => {
          const anim = objWrapper.animate(
            [
              { transform: `translate(${start[0]}px, ${start[1]}px)` },
              { transform: `translate(${end[0]}px, ${end[1]}px)` },
            ],
            {
              duration: duration * 1000, // Длительность анимации
              easing: "linear",
            }
          );

          // Устанавливаем состояние объекта после завершения анимации
          anim.onfinish = () => {
            objWrapper.style.transform = `translate(${end[0]}px, ${end[1]}px)`;
          };
        }, animation.time.start * 1000); // Задержка в миллисекундах
      });
    } else {
      try {
        // Если воспроизведение остановлено, сбрасываем анимации
        objWrapper.getAnimations().forEach((anim) => anim.cancel());
        const { start } = animationObjects[String(index)][2][0].states || [
          0, 0,
        ];
        objWrapper.style.transform = `translate(${start[0]}px, ${start[1]}px)`;
      } catch {}
    }
  }, [isPlaying]);

  // useEffect(() => {
  //   const handleClick = (e) => {
  //     if (
  //       !e.target.classList.contains("object") &&
  //       !e.target.classList.contains("cursor") &&
  //       !e.target.classList.contains("choosePanel__item") &&
  //       !e.target.classList.contains("cursor__value")
  //     ) {
  //       console.log(e.target);

  //     }
  //   };

  //   document.addEventListener("click", handleClick);

  //   return () => {
  //     document.removeEventListener("click", handleClick);
  //   };
  // });

  useEffect(() => {
    if (
      currentAnimationIndex != null &&
      currentObjectId == index &&
      !isReadyToMove[index]
    ) {
      let animation = animationObjects[String(index)][2][currentAnimationIndex];

      if (animation.type == "linnear_move") {
        let newAnimationObjects = { ...animationObjects };
        newAnimationObjects[String(index)][2][
          currentAnimationIndex
        ].states.start = [...animationObjects[String(index)][1]];
        newAnimationObjects[String(index)][2][
          currentAnimationIndex
        ].time.start = animationTime;

        newAnimationObjects[String(index)][2][
          currentAnimationIndex
        ].states.end = [...animationObjects[String(index)][1]];
        newAnimationObjects[String(index)][2][currentAnimationIndex].time.end =
          animationTime;
        setAnimationObjects(newAnimationObjects);
        let newIsReadyToMove = isReadyToMove.map((x, ind) =>
          ind == index ? true : x
        );
        setIsReadyToMove(newIsReadyToMove);
      }

      console.log(animationObjects);
    }
  }, [currentAnimationIndex]);

  useEffect(() => {
    let currentX;
    let currentY;
    let aX;
    let aY;
    if (
      isReadyToMove[index] &&
      animationObjects[String(index)][2][currentAnimationIndex]
    ) {
      currentX = animationObjects[String(index)][1][0];
      currentY = animationObjects[String(index)][1][1];
      aX =
        animationObjects[String(index)][2][currentAnimationIndex].states.end[0];
      aY =
        animationObjects[String(index)][2][currentAnimationIndex].states.end[1];
      console.log(currentX, currentY, aX, aY);
    }
    if (isReadyToMove[index] && (currentX != aX || currentY != aY)) {
      let newAnimationObjects = { ...animationObjects };
      newAnimationObjects[String(index)][2][currentAnimationIndex].states.end =
        [...animationObjects[String(index)][1]];
      newAnimationObjects[String(index)][2][currentAnimationIndex].time.end =
        animationTime;
      setAnimationObjects(newAnimationObjects);
      console.log(animationObjects);
    }
  }, [animationObjects]);

  useEffect(() => {
    console.log(animationTime);
  }, [animationTime]);

  return (
    <>
      <img
        onClick={chooseObject}
        src={src}
        style={{
          display:
            animationTime < animationObjects[String(index)][0][0] ||
            animationTime > 18.5 - animationObjects[String(index)][0][1]
              ? "none"
              : "block",
        }}
        alt={`Выбранное изображение ${index + 1}`}
        className="object"
      />
    </>
  );
}
