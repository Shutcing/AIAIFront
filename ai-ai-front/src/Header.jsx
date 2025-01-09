import { useContext, useState } from "react";
import "./Header.css";
import "./Zero.css";
import { Context } from "./Context.jsx";
import { getVideo, startRender, checkVideo } from "./api.js";

export function Header() {
  const {
    isAdd,
    setIsAdd,
    selectedImages,
    setSelectedImages,
    imgFiles,
    animationObjects,
    sceneColor,
  } = useContext(Context);

  const [currentTime, setCurrentTime] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const addPicture = () => {
    setIsAdd(!isAdd);
  };

  const save = () => {
    alert("Вы хотите сохранить проект");
  };

  const saveVideo = (byteArray) => {
    const videoBlob = new Blob([byteArray], { type: "video/mp4" });
    const videoUrl = URL.createObjectURL(videoBlob);
    const downloadLink = document.createElement("a");
    downloadLink.href = videoUrl;
    downloadLink.download = "video.mp4";
    downloadLink.click();
  };

  function convertAnimationObjectsToJson(animationObjects) {
    const k = 2;
    const getFormattedTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      return `${hours}:${minutes}:${seconds}`;
    };

    const rgbToArray = (rgbString) => {
      // Удаляем пробелы и символы "rgb(" и ")" из строки
      const rgbValues = rgbString
        .replace(/\s+/g, "") // Удаляем все пробелы
        .replace(/^rgb\(|\)$/g, "") // Убираем "rgb(" в начале и ")" в конце
        .split(","); // Разделяем строку по запятой

      // Преобразуем строковые компоненты в числа и возвращаем как массив
      return rgbValues.map(Number); // Преобразуем каждый элемент в число
    };

    const getWrapperStyles = (key) => {
      const element = document.querySelector(`#o${key}`).parentElement;
      const style = window.getComputedStyle(element);
      const transform = style.transform;

      const values = transform.match(/matrix.*\((.+)\)/)[1].split(", ");

      const translateX = parseFloat(values[4]);
      const translateY = parseFloat(values[5]);
      const scaleX = parseFloat(values[0]);
      return [translateX, translateY, scaleX];
    };

    const animationWindow = document.querySelector(".animationWindow");
    setCurrentTime(getFormattedTime());

    const json = {
      animated_images: [],
      name: `videoTime_${currentTime}`,
      duration: 0,
      shape: [
        animationWindow.clientWidth * k,
        animationWindow.clientHeight * k,
      ],
      background_color: rgbToArray(sceneColor),
      fps: 120,
    };

    let minStartTime = Infinity;
    let maxEndTime = -Infinity;

    for (const key in animationObjects) {
      const htmlObj = document
        .querySelector(`#o${key}`)
        .children[0].getBoundingClientRect();
      let [wrapperXOffset, wrapperYOffset, wrapperScale] =
        getWrapperStyles(key);
      const obj = animationObjects[key];
      const [timeStart, timeEnd] = obj[0];
      const [currentX, currentY] = obj[1];
      const currentOpacity = obj[5];

      minStartTime = Math.min(minStartTime, timeStart);
      maxEndTime = Math.max(
        maxEndTime,
        timeEnd,
        ...obj[2].map((animation) => animation.time.end)
      );

      const animatedImage = {
        name: obj[4],
        living_start: timeStart,
        living_end: 18.5 - timeEnd,
        params: {
          x: currentX,
          y: currentY,
          angle: 0,
          opacity: 255,
          scale_x: htmlObj.width * k,
          scale_y: htmlObj.height * k,
        },
        animations: obj[2]
          .filter((anim, i) => anim != null)
          .flatMap((animation) => {
            if (animation.type === "linnear_move") {
              return [
                {
                  param_name: "x",
                  start_time: animation.time.start,
                  end_time: animation.time.end,
                  start_point:
                    (animation.states.start[0] * wrapperScale +
                      wrapperXOffset) *
                    k,
                  end_point:
                    (animation.states.end[0] * wrapperScale + wrapperXOffset) *
                    k,
                },
                {
                  param_name: "y",
                  start_time: animation.time.start,
                  end_time: animation.time.end,
                  start_point:
                    (animation.states.start[1] * wrapperScale +
                      wrapperYOffset) *
                    k,
                  end_point:
                    (animation.states.end[1] * wrapperScale + wrapperYOffset) *
                    k,
                },
              ];
            } else if (animation.type === "opacity") {
              return [
                {
                  param_name: "opacity",
                  start_time: animation.time.start,
                  end_time: animation.time.end,
                  start_point: animation.states.start * 255,
                  end_point: animation.states.end * 255,
                },
              ];
            }
            return [];
          }),
      };

      json.animated_images.push(animatedImage);
    }

    json.duration = maxEndTime - minStartTime;

    return json;
  }

  const _export = async () => {
    setIsExporting(true);
    let json = convertAnimationObjectsToJson(animationObjects);
    await startRender(imgFiles, json);

    let isDownloading = false;

    let id = setInterval(async () => {
      let status = await checkVideo(`videoTime_${currentTime}`);
      if (status === "completed") {
        clearInterval(id);

        if (!isDownloading) {
          isDownloading = true;
          let byteArray = await getVideo(`videoTime_${currentTime}`);
          saveVideo(byteArray);
          setIsExporting(false);
        }
      }
    }, 500);
  };

  return (
    <>
      <header className="header">
        <div className="header__container">
          <div className="logo">
            <img src="./logo.png" alt="" />
          </div>
          <div className="saving">
            <div
              onClick={_export}
              className={`export button ${isExporting ? "exporting" : ""}`}
            >
              {isExporting ? "Экспортируется..." : "Экспорт"}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
