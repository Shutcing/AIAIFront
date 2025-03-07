import { useContext, useEffect, useState } from "react";
import "./Zero.css";
import { Animation } from "./AnimationClass.js";
import { Context } from "./Context.jsx";
import { Object as _Object } from "./Object.jsx";

import "./AnimationMenu.css";

export function AnimationMenu({ scale, currentObj }) {
  const {
    currentObjectId,
    setCurrentObjectId,
    animationObjects,
    setAnimationObjects,
    currentAnimationIndex,
    setcurrentAnimationIndex,
    isReadyToMove,
    setIsReadyToMove,
    animationTime,
  } = useContext(Context);

  const [isChoosePanelVisible, setisChoosePanelVisible] = useState(false);
  const [isOpacityToolsShow, setIsOpacityToolsShow] = useState(false);
  const [animationsVariants, setAnimationVariants] = useState([
    ["Движение", "linnear_move"],
    ["Прозрачность", "opacity"],
  ]);

  const handleSliderChange = (value) => {
    let newAnimationObjects = { ...animationObjects };
    newAnimationObjects[String(currentObjectId)][5] = Number(value);
    setAnimationObjects(newAnimationObjects);

    let objWrapper = document.querySelector(`#o${currentObjectId}`);
    objWrapper.style.opacity = `${value}`;
  };

  const showChoosePanel = () => {
    setisChoosePanelVisible(true);
  };

  const addNewAnimation = (e, animationType, animationTitle) => {
    if (currentAnimationIndex != null) {
      return;
    }
    if (animationType === "opacity") {
      setIsOpacityToolsShow(true);
    }

    setisChoosePanelVisible(false);
    let newAnimationObjects = { ...animationObjects };
    newAnimationObjects[String(currentObjectId)][2].push(
      new Animation(animationType, animationTitle, null, null)
    );
    setcurrentAnimationIndex(
      newAnimationObjects[String(currentObjectId)][2].length - 1
    );
    setAnimationObjects(newAnimationObjects);
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (
        !document.querySelector(".choosePanel__opacityTools") &&
        (e.target.classList.contains("cursor") ||
          e.target.classList.contains("play") ||
          e.target.classList.contains("timeline") ||
          e.target.classList.contains("timeline__container") ||
          (e.target.tagName.toLowerCase() === "img" &&
            !e.target.classList.contains("object")))
      ) {
        setCurrentObjectId(null);
      } else {
      }
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  });

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Enter") {
        setCurrentObjectId(null);
        setcurrentAnimationIndex(null);
        let newIsReadyToMove = isReadyToMove.map((x) => false);
        setIsReadyToMove(newIsReadyToMove);
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => window.removeEventListener("keydown", handleKeyPress);
  });

  const animationNotLayered = (variant) => {
    if (Object.keys(animationObjects).length === 0 || currentObjectId == null) {
      return false;
    }
    return (
      animationObjects[String(currentObjectId)][2]
        .filter((x) => x != null)
        .filter(
          (animation) =>
            animation.title === variant[0] &&
            animationTime < animation.time.end &&
            animationTime > animation.time.start
        ).length === 0
    );
  };

  useEffect(() => {
    if (currentObjectId == null) {
      setIsOpacityToolsShow(false);
    }
  }, [currentObjectId]);

  return (
    <>
      <div
        className="animationMenu"
        style={{
          display:
            currentObjectId == null && !isReadyToMove[Number(currentObjectId)]
              ? "none"
              : "flex",
          transform: `translate(0, ${currentObj.height / scale}px) scale(${
            1 / scale
          })`,
        }}
      >
        <ul
          className="addAnimationBlock__choosePanel choosePanel"
          style={{ display: "flex" }}
        >
          <div
            className="choosePanel__opacityTools"
            style={{ display: isOpacityToolsShow ? "flex" : "none" }}
          >
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={
                animationObjects[String(currentObjectId)]
                  ? Number(animationObjects[String(currentObjectId)][5])
                  : 0
              }
              onChange={(e) => handleSliderChange(e.target.value)}
              style={{ marginRight: "10px" }}
            />
            <span>
              {animationObjects[String(currentObjectId)]
                ? Math.round(
                    Number(animationObjects[String(currentObjectId)][5]) * 10
                  ) / 10
                : 0}
            </span>
          </div>
          {animationsVariants.map((variant, ind) => {
            if (animationNotLayered(variant)) {
              return (
                <li
                  key={ind}
                  className="choosePanel__item"
                  style={{ display: isOpacityToolsShow ? "none" : "flex" }}
                  onClick={(e) => addNewAnimation(e, variant[1], variant[0])}
                >
                  {variant[0]}
                </li>
              );
            }
          })}
          <li
            className="choosePanel__item"
            style={{
              background:
                isReadyToMove.filter((x) => x == true).length != 0
                  ? `var(--green-color)`
                  : `var(--color-two)`,
            }}
            onClick={() => {
              const event = new KeyboardEvent("keydown", {
                key: "Enter",
                code: "Enter",
                keyCode: 13, // Обратите внимание, что keyCode устарел, но все еще работает во многих браузерах
                which: 13, // Тоже устарел, использовать с осторожностью
                bubbles: true, // Это событие должно "пузыриться"
              });

              // Диспетчеризуем событие
              document.dispatchEvent(event);
            }}
          >
            {isReadyToMove.filter((x) => x == true).length != 0 ? "✔" : "✖"}
          </li>
        </ul>
      </div>
    </>
  );
}
