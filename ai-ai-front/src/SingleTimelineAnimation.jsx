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

  const [width, setWidth] = useState(1);
  const [marginLeft, setMarginLeft] = useState(0);
  const [isDeletePanelShow, setIsDeletePanelShow] = useState(false);

  const deleteAnimation = (event) => {
    let newAnimationObjects = { ...animationObjects };
    newAnimationObjects[String(objectId)][2] = newAnimationObjects[
      String(objectId)
    ][2].filter((_, i) => i != index);
    console.log(newAnimationObjects);
    setcurrentAnimationIndex(null);
    setAnimationObjects(newAnimationObjects);
  };

  const chooseThisAnimation = () => {
    setIsDeletePanelShow(!isDeletePanelShow);
  };

  useEffect(() => {
    try {
      if (index == currentAnimationIndex && isReadyToMove[objectId]) {
        setWidth(
          (animationObjects[String(objectId)][2][currentAnimationIndex].time
            .end -
            animationObjects[String(objectId)][2][currentAnimationIndex].time
              .start) *
            timeStep
        );
        setMarginLeft(
          animationObjects[String(objectId)][2][currentAnimationIndex].time
            .start * timeStep
        );
      } else {
        console.log(index, currentAnimationIndex, isReadyToMove[objectId]);
        console.log(isReadyToMove);
      }
    } catch {}
  }, [animationObjects]);

  return (
    <div id={`animation${index}and${objectId}`}>
      <div
        className="holder__delete"
        onClick={deleteAnimation}
        style={{
          display: isDeletePanelShow ? "flex" : "none",
          transform: `translate(100%,  -70%)`,
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
