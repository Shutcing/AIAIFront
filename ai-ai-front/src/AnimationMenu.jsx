import { useContext, useEffect, useState } from "react";
import "./Zero.css";
import { Animation } from "./AnimationClass.js";
import { Context } from "./Context.jsx";
import { Object as _Object } from "./Object.jsx";

import "./AnimationMenu.css";

export function AnimationMenu() {
  const {
    currentObjectId,
    setCurrentObjectId,
    animationObjects,
    setAnimationObjects,
    currentAnimationIndex,
    setcurrentAnimationIndex,
    isReadyToMove,
    setIsReadyToMove,
  } = useContext(Context);
  const [isChoosePanelVisible, setisChoosePanelVisible] = useState(false);
  // const [inputValue, setInputValue] = useState("");

  const showChoosePanel = () => {
    setisChoosePanelVisible(true);
  };

  const addNewAnimation = (e, animationType, animationTitle) => {
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
        !e.target.classList.contains("button") &&
        !e.target.classList.contains("choosePanel__item")
      ) {
        setisChoosePanelVisible(false);
      }
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  });

  // const handleChange = (e) => {
  //   setInputValue(e.target.value)
  // }

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key == "Enter") {
        setcurrentAnimationIndex(null);
        let newIsReadyToMove = isReadyToMove.map((x) => false);
        setIsReadyToMove(newIsReadyToMove);
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => window.removeEventListener("keydown", handleKeyPress);
  });

  return (
    <>
      <div
        className="animationMenu"
        style={{ display: currentObjectId == null ? "none" : "flex" }}
      >
        <div className="animationMenu__title">Анимации</div>
        <div className="animationMenu__sep"></div>
        <div className="animationMenu__box">
          {Object.keys(animationObjects).map((key, ind) => {
            if (key == currentObjectId) {
              let animation = animationObjects[key][2][currentAnimationIndex];
              if (animation) {
                return (
                  <div className="button" key={ind}>
                    {animation.title}
                  </div>
                );
              }
            }
          })}
        </div>

        <div className="animationMenu__addAnimationBlock addAnimationBlock">
          <ul
            className="addAnimationBlock__choosePanel choosePanel"
            style={{ display: isChoosePanelVisible ? "flex" : "none" }}
          >
            <li
              className="choosePanel__item"
              onClick={(e) => addNewAnimation(e, "linnear_move", "Движение")}
            >
              движение
            </li>

            <li
              className="choosePanel__item"
              onClick={(e) => addNewAnimation(e, "opacity", "Прозрачность")}
            >
              Прозрачность
            </li>
          </ul>
          <div
            className="addAnimationBlock__addButton button"
            onClick={showChoosePanel}
          >
            Добавить
          </div>
        </div>
      </div>
    </>
  );
}
