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

  const chooseThisAnimation = () => {
    setcurrentAnimationIndex(thisIndex);
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
      }
    } catch {}
  }, [animationObjects]);

  return (
    <>
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
    </>
  );
}
