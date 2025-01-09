import { useContext, useEffect, useState, useCallback } from "react";
import { Context } from "./Context.jsx";
import "./PersonalLine.css";
import "./Zero.css";
import { SingleTimelineAnimation } from "./SingleTimelineAnimation.jsx";

export function PersonalLine({ marginLeft, name, id }) {
  const {
    animationObjects,
    setAnimationObjects,
    currentAnimationIndex,
    setcurrentAnimationIndex,
  } = useContext(Context);
  const [width, setWidth] = useState(window.screen.width);
  const timeStep = width * 0.05;
  const [cursorValues, setCursorValues] = useState({
    left: 0,
    right: timeStep,
  });
  const [dragging, setDragging] = useState({
    isDragging: false,
    side: null,
    startX: 0,
    initialValue: 0,
  });

  const updateWidth = useCallback(() => setWidth(window.innerWidth), []);

  useEffect(() => {
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [updateWidth]);

  const handleMouseDown = (e, side) => {
    setDragging({
      isDragging: true,
      side,
      startX: e.clientX,
      initialValue: cursorValues[side],
    });
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (!dragging.isDragging) return;

      const deltaX =
        dragging.side === "left"
          ? e.clientX - dragging.startX
          : dragging.startX - e.clientX;
      let newValue = dragging.initialValue + deltaX;

      newValue = Math.max(0, newValue);
      if (dragging.side === "right") {
        newValue = Math.max(timeStep, newValue);
      }
      if (dragging.side === "left") {
        newValue = Math.min(
          newValue,
          width * 0.96 - marginLeft - cursorValues.right - 1
        );
        animationObjects[String(id)][0][0] = newValue / timeStep;
      } else {
        newValue = Math.min(
          newValue,
          width * 0.96 - marginLeft - cursorValues.left - 1
        );
        animationObjects[String(id)][0][1] = (newValue + timeStep) / timeStep;
      }

      setCursorValues((prevValues) => ({
        ...prevValues,
        [dragging.side]: newValue,
      }));
    },
    [dragging, cursorValues, width]
  );

  const handleMouseUp = () => {
    setDragging({ isDragging: false, side: null, startX: 0, initialValue: 0 });
  };

  const findPersomalLineMarginTop = () => {
    if (id == 0) {
      return `2%`;
    }
    return `${
      document.querySelectorAll(`.personal-line`) &&
      document.querySelector(".holder__row") &&
      document.querySelectorAll(`.personal-line`)[id - 1]
        ? document
            .querySelectorAll(`.personal-line`)
            [id - 1].querySelectorAll(".holder__row").length *
          document.querySelector(".holder__row").clientHeight *
          1
        : 0
    }px`;
  };

  useEffect(() => {
    if (dragging.isDragging) {
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
  }, [dragging.isDragging, handleMouseMove]);

  return (
    <div
      className="timeline__personal personal-line"
      style={{
        marginTop: findPersomalLineMarginTop(),
      }}
    >
      {/* <div
        className="personal-line__line"
        style={{ margin: `0 0 0 ${marginLeft}px` }}
      ></div> */}
      <div
        className="personal-line__title"
        style={{ width: `${timeStep * 2}px` }}
      >
        {name}
      </div>
      <div
        className="personal-line__algebra"
        style={{ margin: `0 0 0 ${marginLeft - width * 0.04}px` }}
      >
        <div
          className="algebra__left"
          onMouseDown={(e) => handleMouseDown(e, "left")}
          style={{
            left: `${cursorValues.left}px`,
            height: `${
              document.querySelector(".holder__row") &&
              document.querySelector(".holder__row") &&
              document.querySelectorAll(`.personal-line`)[id]
                ? document
                    .querySelectorAll(`.personal-line`)
                    [id].querySelectorAll(".holder__row").length *
                  document.querySelector(".holder__row").clientHeight
                : 0
            }px`,
          }}
        ></div>
        <div className="algebra__holder holder">
          {[
            ...new Set(
              animationObjects[String(id)][2]
                .filter((anim, ind) => anim != null)
                .map((animation, ind) => animation.type)
            ),
          ].map((type, i) => {
            return (
              <div className="holder__row">
                {animationObjects[String(id)][2].map((animation, ind) => {
                  if (animation != null && animation.type == type) {
                    console.log(animationObjects[String(id)][2][ind]);
                    return (
                      <SingleTimelineAnimation
                        key={ind}
                        title={animation.title}
                        index={ind}
                        objectId={id}
                      ></SingleTimelineAnimation>
                    );
                  }
                })}
              </div>
            );
          })}

          {/* <div className="holder__row">
            {animationObjects[String(id)][2].map((animation, ind) => {
              if (animation.type == "opacity")
                return (
                  <SingleTimelineAnimation
                    key={ind}
                    title={animation.title}
                    index={ind}
                    objectId={id}
                  ></SingleTimelineAnimation>
                );
            })}
          </div> */}
        </div>
        <div
          className="algebra__right"
          onMouseDown={(e) => handleMouseDown(e, "right")}
          style={{
            right: `${cursorValues.right}px`,
            height: `${
              document.querySelector(".holder__row") &&
              document.querySelector(".holder__row").clientHeight &&
              document.querySelectorAll(`.personal-line`)[id]
                ? document
                    .querySelectorAll(`.personal-line`)
                    [id].querySelectorAll(".holder__row").length *
                  document.querySelector(".holder__row").clientHeight
                : 0
            }px`,
          }}
        ></div>
      </div>
    </div>
  );
}
