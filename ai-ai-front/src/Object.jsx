import "./Object.css";
import "./Zero.css";
import { useContext, useEffect, useState, useCallback } from "react";
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

  const updateWidth = useCallback(() => setWidth(window.innerWidth), []);

  useEffect(() => {
    let objWrapper = document.querySelector(`#o${index}`);
    if (
      !objWrapper ||
      !animationObjects[String(index)][2] ||
      currentAnimationIndex != null
    )
      return;

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
        break;
      }

      if (animationTime < timeStart) {
        if (animation.type === "linnear_move") {
          objWrapper.style.transform = `translate(${start[0]}px, ${start[1]}px)`;
        } else if (animation.type === "opacity") {
          objWrapper.style.opacity = start;
        }
        break;
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
        // const firstAnimation = animationObjects[String(index)][2][0];
        // if (firstAnimation) {
        //   const { start } = firstAnimation.states;
        //   if (firstAnimation.type === "linnear_move") {
        //     objWrapper.style.transform = `translate(${start[0]}px, ${start[1]}px)`;
        //   } else if (firstAnimation.type === "opacity") {
        //     objWrapper.style.opacity = start;
        //   }
        // }
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
      } else if (animation.type == "opacity") {
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
        ind == index ? true : x
      );
      setIsReadyToMove(newIsReadyToMove);

      console.log(animationObjects);
    } else {
      console.log(currentAnimationIndex);
      console.log(currentObjectId, index);
      console.log(isReadyToMove);
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
        animationObjects[String(index)][2][currentAnimationIndex]["type"] ==
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
        if (isReadyToMove[index] && (currentX != aX || currentY != aY)) {
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
        animationObjects[String(index)][2][currentAnimationIndex]["type"] ==
        "opacity"
      ) {
        currentOpacity = animationObjects[String(index)][5];
        a =
          animationObjects[String(index)][2][currentAnimationIndex].states.end;
        if (isReadyToMove[index] && currentOpacity != a) {
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
        }}
        alt={`Выбранное изображение ${index + 1}`}
        className="object"
      />
    </>
  );
}
