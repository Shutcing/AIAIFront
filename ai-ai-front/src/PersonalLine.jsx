import { useContext, useEffect, useState, useCallback, useRef } from "react";
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

  // cursorValues.left — пиксельный отступ слева (для левого ползунка)
  // cursorValues.right — пиксельный отступ справа (для правого ползунка)
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

  // ============ ЛОГИКА ДЛЯ DRAG ============

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

      // Определяем, куда тянем: левый или правый ползунок
      const isLeft = dragging.side === "left";
      // deltaX - насколько мы сместили мышь
      const deltaX = isLeft
        ? e.clientX - dragging.startX
        : dragging.startX - e.clientX;

      let newValue = dragging.initialValue + deltaX;

      // Не даём вылезти за границы (минимум 0)
      newValue = Math.max(0, newValue);

      if (!isLeft) {
        // Для правого ползунка
        // Минимальная позиция — timeStep, чтоб не пересекалось с левым
        newValue = Math.max(timeStep, newValue);
      }

      // Учитываем максимальную ширину
      if (isLeft) {
        newValue = Math.min(
          newValue,
          width * 0.96 - marginLeft - cursorValues.right - 1
        );
        // Записываем в animationObjects время старта
        animationObjects[String(id)][0][0] = newValue / timeStep;
      } else {
        newValue = Math.min(
          newValue,
          width * 0.96 - marginLeft - cursorValues.left - 1
        );
        // Записываем в animationObjects время конца
        animationObjects[String(id)][0][1] = (newValue + timeStep) / timeStep;
      }

      // Ставим в стейт новые пиксельные значения
      setCursorValues((prevValues) => ({
        ...prevValues,
        [dragging.side]: newValue,
      }));
    },
    [dragging, cursorValues, width, marginLeft, animationObjects, id, timeStep]
  );

  const handleMouseUp = () => {
    setDragging({ isDragging: false, side: null, startX: 0, initialValue: 0 });
  };

  // ============ ЛОГИКА &laquo;СВЕРКИ&raquo; В СОСТОЯНИИ ПОКОЯ ============

  // Храним ссылку на setInterval, чтобы очищать его при повторном вызове.
  const idleCheckInterval = useRef(null);

  useEffect(() => {
    // Если сейчас НЕ тянут ползунок, запускаем каждую секунду &laquo;сверку&raquo; позиций
    if (!dragging.isDragging) {
      idleCheckInterval.current = setInterval(() => {
        if (!animationObjects[String(id)]) return;

        // В animationObjects: leftTime = animationObjects[id][0][0]
        //                    rightTime = animationObjects[id][0][1]
        const leftTime = animationObjects[String(id)][0][0] || 0;
        const rightTime = animationObjects[String(id)][0][1] || 1;

        // Переводим &laquo;логическое&raquo; время в пиксельный оффсет
        const idealLeft = leftTime * timeStep;
        // Для правого ползунка у нас formula: endTime = (rightPx + timeStep)/timeStep
        // => rightPx = endTime * timeStep - timeStep
        const idealRight = rightTime * timeStep - timeStep;

        // Если вдруг кол-во ползунков поменялось, проверяем что нет drag и т.д.
        // Если наши текущие cursorValues отличаются, синхронизируем
        setCursorValues((prev) => {
          // Можно добавить какую-то &laquo;погрешность&raquo;,
          // но по условию задачи мы просто ставим точно то же значение
          if (prev.left !== idealLeft || prev.right !== idealRight) {
            return {
              left: idealLeft >= 0 ? idealLeft : 0,
              right: idealRight >= 0 ? idealRight : 0,
            };
          }
          return prev;
        });
      }, 1000);
    } else {
      // Если начали тянуть — убиваем интервал
      if (idleCheckInterval.current) {
        clearInterval(idleCheckInterval.current);
        idleCheckInterval.current = null;
      }
    }

    return () => {
      if (idleCheckInterval.current) {
        clearInterval(idleCheckInterval.current);
        idleCheckInterval.current = null;
      }
    };
  }, [
    dragging.isDragging,
    animationObjects,
    id,
    timeStep,
    // Можно добавить marginLeft, если он влияет на вычисления (но обычно нет).
  ]);

  // ============ ПОДКЛЮЧАЕМ MOUSEMOVE / MOUSEUP ============

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

  // ============ ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ДЛЯ MARGIN-TOP ============

  const findPersomalLineMarginTop = () => {
    if (id === 0) {
      return `2%`;
    }
    // Далее поиск высоты предыдущих personal-line
    // (ваш код не меняем, чтоб ничего не &laquo;сломать&raquo;)
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

  // ============ РЕНДЕР ============

  return (
    <div
      className="timeline__personal personal-line"
      style={{
        marginTop: findPersomalLineMarginTop(),
      }}
    >
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
        {/* ЛЕВАЯ &laquo;алгебра&raquo; */}
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

        {/* СРЕДНЯЯ ОБЛАСТЬ (holder) */}
        <div className="algebra__holder holder">
          {[
            ...new Set(
              animationObjects[String(id)][2]
                .filter((anim) => anim != null)
                .map((animation) => animation.type)
            ),
          ].map((type, i) => {
            return (
              <div className="holder__row" key={i}>
                {animationObjects[String(id)][2].map((animation, ind) => {
                  if (animation != null && animation.type === type) {
                    return (
                      <SingleTimelineAnimation
                        key={ind}
                        title={animation.title}
                        index={ind}
                        objectId={id}
                      ></SingleTimelineAnimation>
                    );
                  }
                  return null;
                })}
              </div>
            );
          })}
        </div>

        {/* ПРАВАЯ &laquo;алгебра&raquo; */}
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
