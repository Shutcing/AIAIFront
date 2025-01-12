import { useContext, useEffect, useState, useCallback } from "react";
import { Context } from "./Context.jsx";
import "./SingleTimelineAnimation.css";
import "./Zero.css";

export function SingleTimelineAnimation({ title, index, objectId }) {
  const WIDTH = window.screen.width;
  const timeStep = WIDTH * 0.05;
  const [thisIndex, setThisIndex] = useState(index);
  const {
    currentAnimationIndex,
    setcurrentAnimationIndex,
    animationObjects,
    setAnimationObjects,
    isReadyToMove,
  } = useContext(Context);

  const findMarginLeft = () => {
    let _thisWrapper = document.querySelector(
      `#animation${index}and${animationObjects[String(objectId)][4]
        .replace(".", "")
        .replace("(", "")
        .replace(" ", "")
        .replace(")", "")}`
    );
    if (_thisWrapper) {
      let _this = _thisWrapper.querySelector(".holder__animation");
      let thisStyles = getComputedStyle(_this);
      let left = Number(thisStyles.left.replace("px", ""));
      return left;
    }
    return 0;
  };

  const findAnimationWidth = () => {
    let _thisWrapper = document.querySelector(
      `#animation${index}and${animationObjects[String(objectId)][4]
        .replace(".", "")
        .replace(" ", "")
        .replace("(", "")
        .replace(")", "")}`
    );
    console.log(_thisWrapper);
    if (_thisWrapper) {
      let _this = _thisWrapper.querySelector(".holder__animation");
      let thisStyles = getComputedStyle(_this);
      let width = Number(thisStyles.width.replace("px", ""));
      return width;
    }
    return 1;
  };

  const [width, setWidth] = useState(findAnimationWidth());
  const [marginLeft, setMarginLeft] = useState(findMarginLeft());
  const [isDeletePanelShow, setIsDeletePanelShow] = useState(false);

  const deleteAnimation = (event) => {
    let objWrapper = document.querySelector(`#o${objectId}`);
    objWrapper.style.opacity = 1;
    let newAnimationObjects = { ...animationObjects };
    newAnimationObjects[String(objectId)][2] = newAnimationObjects[
      String(objectId)
    ][2].map((anim, i) => {
      if (i == index) {
        return null;
      } else {
        return anim;
      }
    });
    setcurrentAnimationIndex(null);
    setAnimationObjects(newAnimationObjects);
    // setWidthAndMarginTop();
  };

  const chooseThisAnimation = () => {
    if (isReadyToMove.filter((x) => x == true).length == 0) {
      setIsDeletePanelShow(!isDeletePanelShow);
    }
  };

  const setWidthAndMarginTop = () => {
    setWidth(
      (animationObjects[String(objectId)][2][index].time.end -
        animationObjects[String(objectId)][2][index].time.start) *
        timeStep
    );
    setMarginLeft(
      animationObjects[String(objectId)][2][index].time.start * timeStep
    );
  };

  useEffect(() => {
    try {
      if (index == currentAnimationIndex && isReadyToMove[objectId]) {
        setWidthAndMarginTop();
      }
    } catch {}
  }, [animationObjects]);

  return (
    <div
      id={`animation${index}and${animationObjects[String(objectId)][4]
        .replace(".", "")
        .replace("(", "")
        .replace(" ", "")
        .replace(")", "")}`}
    >
      <div
        className="holder__delete"
        onClick={deleteAnimation}
        style={{
          display: isDeletePanelShow ? "flex" : "none",
          transform: `translate(${marginLeft}px,  -70%)`,
        }}
      >
        Удалить
      </div>
      <div
        onClick={chooseThisAnimation}
        style={{
          width: `${width}px`,
          left: `${marginLeft}px`,
        }}
        className="holder__animation"
      >
        {title}
      </div>
    </div>
  );
}
