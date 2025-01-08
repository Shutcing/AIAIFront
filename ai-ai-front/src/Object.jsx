import "./Object.css";
import "./Zero.css";
import { useContext, useEffect, useState, useCallback, useRef } from "react";
import { Context } from "./Context.jsx";

export function Object({ index, src }) {
  const {
    animationTime,
    setAnimationTime,
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

  const [draggingDot, setDraggingDot] = useState(null);

  const initialRect = useRef({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    mouseX: 0,
    mouseY: 0,
  });

  const handleMouseDownDot = (e, dotName) => {
    e.preventDefault();
    e.stopPropagation();

    setDraggingDot(dotName);

    initialRect.current = {
      x: animationObjects[String(index)][1][0],
      y: animationObjects[String(index)][1][1],
      width: animationObjects[String(index)][6],
      height: animationObjects[String(index)][7],
      mouseX: e.clientX,
      mouseY: e.clientY,
    };
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!draggingDot) return;

      const {
        x,
        y,
        width: startW,
        height: startH,
        mouseX,
        mouseY,
      } = initialRect.current;

      const dx = e.clientX - mouseX;
      const dy = e.clientY - mouseY;

      let newX = x;
      let newY = y;
      let newW = startW;
      let newH = startH;

      switch (draggingDot) {
        case "topLeft":
          newX = x + dx;
          newY = y + dy;
          newW = startW - dx;
          newH = startH - dy;
          break;

        case "topRight":
          newY = y + dy;
          newW = startW + dx;
          newH = startH - dy;
          break;

        case "bottomLeft":
          newX = x + dx;
          newW = startW - dx;
          newH = startH + dy;
          break;

        case "bottomRight":
          newW = startW + dx;
          newH = startH + dy;
          break;

        default:
          break;
      }

      if (newW < 5) {
        newW = 5;
      }
      if (newH < 5) {
        newH = 5;
      }

      const newAnimationObjects = { ...animationObjects };
      newAnimationObjects[String(index)][1][0] = newX;
      newAnimationObjects[String(index)][1][1] = newY;
      newAnimationObjects[String(index)][6] = newW;
      newAnimationObjects[String(index)][7] = newH;

      setAnimationObjects(newAnimationObjects);
    };

    const onMouseUp = () => {
      if (draggingDot) {
        setDraggingDot(null);
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [draggingDot, animationObjects, setAnimationObjects, index]);

  const updateWidth = useCallback(() => setWidth(window.innerWidth), []);

  useEffect(() => {
    let objWrapper = document.querySelector(`#o${index}`);
    if (!objWrapper || !animationObjects[String(index)][2]) {
      console.log(
        objWrapper,
        animationObjects[String(index)][2],
        currentAnimationIndex
      );
      return;
    }

    let animations = animationObjects[String(index)][2];
    animations.sort((a, b) => a.time.start - b.time.start);

    for (let animation of animations) {
      const { start, end } = animation.states;
      const { start: timeStart, end: timeEnd } = animation.time;

      if (animationTime >= timeStart && animationTime <= timeEnd) {
        const progress = (animationTime - timeStart) / (timeEnd - timeStart);

        if (animation.type === "linnear_move") {
          const currentX = start[0] + progress * (end[0] - start[0]);
          const currentY = start[1] + progress * (end[1] - start[1]);
          objWrapper.style.transform = `translate(${currentX}px, ${currentY}px)`;
          animationObjects[String(index)][1][0] = currentX;
          animationObjects[String(index)][1][1] = currentY;
        } else if (animation.type === "opacity") {
          const currentOpacity = start + progress * (end - start);
          objWrapper.style.opacity = currentOpacity;
          animationObjects[String(index)][5] = currentOpacity;
        }
      }

      if (animationTime < timeStart) {
        if (animation.type === "linnear_move") {
          objWrapper.style.transform = `translate(${start[0]}px, ${start[1]}px)`;
        } else if (animation.type === "opacity") {
          objWrapper.style.opacity = start;
        }
      } else if (animationTime > timeEnd) {
        if (animation.type === "linnear_move") {
          objWrapper.style.transform = `translate(${end[0]}px, ${end[1]}px)`;
        } else if (animation.type === "opacity") {
          objWrapper.style.opacity = end;
        }
      }
    }
  }, [animationTime]);

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
      animations.sort((a, b) => a.time.start - b.time.start);

      animations.forEach((animation) => {
        const { start, end } = animation.states;
        const duration = animation.time.end - animation.time.start;

        setTimeout(() => {
          if (animation.type === "linnear_move") {
            const anim = objWrapper.animate(
              [
                { transform: `translate(${start[0]}px, ${start[1]}px)` },
                { transform: `translate(${end[0]}px, ${end[1]}px)` },
              ],
              {
                duration: duration * 1000,
                easing: "linear",
              }
            );
            anim.onfinish = () => {
              objWrapper.style.transform = `translate(${end[0]}px, ${end[1]}px)`;
            };
          } else if (animation.type === "opacity") {
            const anim = objWrapper.animate(
              [{ opacity: start }, { opacity: end }],
              {
                duration: duration * 1000,
                easing: "linear",
              }
            );
            anim.onfinish = () => {
              objWrapper.style.opacity = end;
            };
          }
        }, animation.time.start * 1000);
      });
    } else {
      try {
        objWrapper.getAnimations().forEach((anim) => anim.cancel());
        setTimeout(() => {
          setAnimationTime(animationTime);
        }, 100);
        const firstAnimation = animationObjects[String(index)][2][0];
        if (firstAnimation) {
          const { start } = firstAnimation.states;
          if (firstAnimation.type === "linnear_move") {
            objWrapper.style.transform = `translate(${start[0]}px, ${start[1]}px)`;
          } else if (firstAnimation.type === "opacity") {
            objWrapper.style.opacity = start;
          }
        }
      } catch {}
    }
  }, [isPlaying]);

  useEffect(() => {
    if (
      currentAnimationIndex != null &&
      currentObjectId == index &&
      !isReadyToMove[index]
    ) {
      let animation = animationObjects[String(index)][2][currentAnimationIndex];

      if (animation.type === "linnear_move") {
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
      } else if (animation.type === "opacity") {
        let newAnimationObjects = { ...animationObjects };
        newAnimationObjects[String(index)][2][
          currentAnimationIndex
        ].states.start = animationObjects[String(index)][5];
        newAnimationObjects[String(index)][2][
          currentAnimationIndex
        ].time.start = animationTime;

        newAnimationObjects[String(index)][2][
          currentAnimationIndex
        ].states.end = animationObjects[String(index)][5];
        newAnimationObjects[String(index)][2][currentAnimationIndex].time.end =
          animationTime;
        setAnimationObjects(newAnimationObjects);
      }

      let newIsReadyToMove = isReadyToMove.map((x, ind) =>
        ind === index ? true : x
      );
      setIsReadyToMove(newIsReadyToMove);

      console.log(animationObjects);
    }
  }, [currentAnimationIndex]);

  useEffect(() => {
    let currentX;
    let currentY;
    let aX;
    let aY;
    let a;
    let currentOpacity;
    if (
      isReadyToMove[index] &&
      animationObjects[String(index)][2][currentAnimationIndex]
    ) {
      if (
        animationObjects[String(index)][2][currentAnimationIndex]["type"] ===
        "linnear_move"
      ) {
        currentX = animationObjects[String(index)][1][0];
        currentY = animationObjects[String(index)][1][1];
        aX =
          animationObjects[String(index)][2][currentAnimationIndex].states
            .end[0];
        aY =
          animationObjects[String(index)][2][currentAnimationIndex].states
            .end[1];
        console.log(currentX, currentY, aX, aY);
        if (isReadyToMove[index] && (currentX !== aX || currentY !== aY)) {
          let newAnimationObjects = { ...animationObjects };
          newAnimationObjects[String(index)][2][
            currentAnimationIndex
          ].states.end = [...animationObjects[String(index)][1]];
          newAnimationObjects[String(index)][2][
            currentAnimationIndex
          ].time.end = animationTime;
          setAnimationObjects(newAnimationObjects);
          console.log(animationObjects);
        }
      } else if (
        animationObjects[String(index)][2][currentAnimationIndex]["type"] ===
        "opacity"
      ) {
        currentOpacity = animationObjects[String(index)][5];
        a =
          animationObjects[String(index)][2][currentAnimationIndex].states.end;
        if (isReadyToMove[index] && currentOpacity !== a) {
          let newAnimationObjects = { ...animationObjects };
          newAnimationObjects[String(index)][2][
            currentAnimationIndex
          ].states.end = animationObjects[String(index)][5];
          newAnimationObjects[String(index)][2][
            currentAnimationIndex
          ].time.end = animationTime;
          setAnimationObjects(newAnimationObjects);
          console.log(animationObjects);
        }
      }
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
          width: `${animationObjects[String(index)][6]}px`,
          height: `${animationObjects[String(index)][7]}px`,
        }}
        alt={`Выбранное изображение ${index + 1}`}
        className="object"
      />

      <div
        className="object__dotsWrapper"
        style={{
          width: `${animationObjects[String(index)][6]}px`,
          height: `${animationObjects[String(index)][7]}px`,
          position: "relative",
        }}
      >
        <div
          className="dotTopLeft object__sizeDot"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            cursor: "nw-resize",
          }}
          onMouseDown={(e) => handleMouseDownDot(e, "topLeft")}
        />
        <div
          className="dotTopRight object__sizeDot"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            cursor: "ne-resize",
          }}
          onMouseDown={(e) => handleMouseDownDot(e, "topRight")}
        />

        <div
          className="dotBottomLeft object__sizeDot"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            cursor: "sw-resize",
          }}
          onMouseDown={(e) => handleMouseDownDot(e, "bottomLeft")}
        />

        <div
          className="dotBottomRight object__sizeDot"
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            cursor: "se-resize",
          }}
          onMouseDown={(e) => handleMouseDownDot(e, "bottomRight")}
        />
      </div>
    </>
  );
}
