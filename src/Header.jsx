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
  } = useContext(Context);

  const [isDownload, setIsDownload] = useState(false);

  const addPicture = () => {
    setIsAdd(!isAdd);
  };

  const save = () => {
    alert("Вы хотите сохранить проект");
  };

  const saveVideo = (byteArray) => {
    if (!isDownload) {
      const videoBlob = new Blob([byteArray], { type: "video/mp4" });
      const videoUrl = URL.createObjectURL(videoBlob);
      const downloadLink = document.createElement("a");
      downloadLink.href = videoUrl;
      downloadLink.download = "video.mp4";
      downloadLink.click();
      setIsDownload(true);
      setTimeout(() => {
        setIsDownload(false);
      }, 3000);
    }
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

    const json = {
      animated_images: [],
      name: "test4",
      duration: 0,
      shape: [
        animationWindow.clientWidth * k,
        animationWindow.clientHeight * k,
      ],
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

      // Обновляем минимальное и максимальное время
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
        animations: obj[2].flatMap((animation) => {
          if (animation.type === "linnear_move") {
            return [
              {
                param_name: "x",
                start_time: animation.time.start,
                end_time: animation.time.end,
                start_point:
                  (animation.states.start[0] * wrapperScale + wrapperXOffset) *
                  k, // x координата
                end_point:
                  (animation.states.end[0] * wrapperScale + wrapperXOffset) * k, // x координата
              },
              {
                param_name: "y",
                start_time: animation.time.start,
                end_time: animation.time.end,
                start_point:
                  (animation.states.start[1] * wrapperScale + wrapperYOffset) *
                  k, // y координата
                end_point:
                  (animation.states.end[1] * wrapperScale + wrapperYOffset) * k, // y координата
              },
            ];
          }
          return []; // Если тип анимации не "linear_move", пропускаем
        }),
      };

      json.animated_images.push(animatedImage);
    }

    // Устанавливаем правильное значение для duration
    json.duration = maxEndTime - minStartTime;

    return json;
  }

  const _export = async () => {
    let json = convertAnimationObjectsToJson(animationObjects);
    console.log(json);
    await startRender(imgFiles, json);
    setTimeout(() => {
      let id = setInterval(async () => {
        let status = await checkVideo("test4");
        if (status == "completed") {
          clearInterval(id);
          let byteArray = await getVideo("test4");
          saveVideo(byteArray);
        }
      }, 2000);
    }, 2000);
  };

  return (
    <>
      <header className="header">
        <div className="header__container">
          <div className="addPicture">
            <div className="addPicture__text">Добавить картинку</div>
            <div onClick={addPicture} className="addPicture__add">
              +
            </div>
          </div>
          <div className="saving">
            <div onClick={save} className="save button">
              Сохранить
            </div>
            <div onClick={_export} className="export button">
              Скачать
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
