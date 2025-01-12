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

  const getFormattedTime = () => {
    const min = 10000;
    const max = 99999;
    const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomNum;
  };

  const [currentTime, setCurrentTime] = useState(getFormattedTime());
  const [isExporting, setIsExporting] = useState(false);
  const [isLessonOpen, setIsLessonOpen] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const videoData = [
    { title: "Изменение фона", src: "фон.mp4" },
    { title: "Добавление изображений", src: "add.mp4" },
    { title: "Добавление анимаций", src: "Добавление анимаций.mp4" },
    { title: "Управление анимациями", src: "Управление анимациями.mp4" },
    { title: "Скачать анимацию в .mp4", src: "Экспорт.mp4" },
  ];

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

    const rgbToArray = (rgbString) => {
      const rgbValues = rgbString
        .replace(/\s+/g, "")
        .replace(/^rgb\(|\)$/g, "")
        .split(",");
      return rgbValues.map(Number);
    };

    const animationWindow = document.querySelector(".animationWindow");

    const animationWindowWrapper = document.querySelector(
      ".animationWindowWrapper"
    );
    const matrixValues = getComputedStyle(animationWindowWrapper)
      .transform.match(/-?[\d\.]+/g)
      ?.map(Number) || [1, 0, 0, 1, 0, 0];

    const sceneScaleX = matrixValues[0];
    const sceneScaleY = matrixValues[3];
    const sceneOffsetX = matrixValues[4];
    const sceneOffsetY = matrixValues[5];

    const json = {
      animated_images: [],
      name: `videoTime_${currentTime}`,
      duration: 0,
      shape: [
        animationWindow.clientWidth * k,
        animationWindow.clientHeight * k,
      ],
      background_color: rgbToArray(sceneColor),
      fps: 24,
    };

    let minStartTime = Infinity;
    let maxEndTime = -Infinity;

    for (const key in animationObjects) {
      const htmlObj = document
        .querySelector(`#o${key}`)
        .children[0].getBoundingClientRect();

      const obj = animationObjects[key];
      const [timeStart, timeEnd] = obj[0];
      const [objX, objY] = obj[1];
      const currentOpacity = obj[5];

      let finalObjX = sceneOffsetX + objX * sceneScaleX;
      let finalObjY = sceneOffsetY + objY * sceneScaleY;

      const motionAnimations = obj[2].filter(
        (animation) => animation && animation.type === "linnear_move"
      );

      if (motionAnimations.length > 0) {
        const firstMotion = motionAnimations[0];
        const { start } = firstMotion.states;

        finalObjX = sceneOffsetX + start[0] * sceneScaleX;
        finalObjY = sceneOffsetY + start[1] * sceneScaleY;
      }

      minStartTime = Math.min(minStartTime, timeStart);
      maxEndTime = Math.max(
        maxEndTime,
        timeEnd,
        ...obj[2]
          .filter((x) => x != null)
          .map((animation) => animation.time.end)
      );

      function removeNumberSubstrings(inputString) {
        const regex = /\s*\(\d+\)\s*/g;
        return inputString.replace(regex, " ").trim().replace(" ", "");
      }

      const animatedImage = {
        name: removeNumberSubstrings(obj[4]),
        living_start: timeStart,
        living_end: 18.5 - timeEnd,
        params: {
          x: finalObjX * k,
          y: finalObjY * k,
          angle: 0,
          opacity: 255,
          scale_x: htmlObj.width * k,
          scale_y: htmlObj.height * k,
        },
        animations: obj[2]
          .filter((anim) => anim != null)
          .flatMap((animation) => {
            if (animation.type === "linnear_move") {
              const { start, end } = animation.states;
              const { start: startTime, end: endTime } = animation.time;

              const startX = sceneOffsetX + start[0] * sceneScaleX;
              const endX = sceneOffsetX + end[0] * sceneScaleX;
              const startY = sceneOffsetY + start[1] * sceneScaleY;
              const endY = sceneOffsetY + end[1] * sceneScaleY;

              return [
                {
                  param_name: "x",
                  start_time: startTime,
                  end_time: endTime,
                  start_point: startX * k,
                  end_point: endX * k,
                },
                {
                  param_name: "y",
                  start_time: startTime,
                  end_time: endTime,
                  start_point: startY * k,
                  end_point: endY * k,
                },
              ];
            } else if (animation.type === "opacity") {
              const { start, end } = animation.states;
              const { start: startTime, end: endTime } = animation.time;

              return [
                {
                  param_name: "opacity",
                  start_time: startTime,
                  end_time: endTime,
                  start_point: start * 255,
                  end_point: end * 255,
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

  const viewLesson = () => {
    setIsLessonOpen(true);
  };

  const closeLesson = () => {
    setIsLessonOpen(false);
  };

  const previousVideo = () => {
    setCurrentVideoIndex(
      (prevIndex) => (prevIndex - 1 + videoData.length) % videoData.length
    );
  };

  const nextVideo = () => {
    setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videoData.length);
  };

  const _export = async () => {
    if (isExporting) {
      return;
    }
    if (Object.values(animationObjects).length == 0) {
      alert("Сначала добавьте анимацию!");
      return;
    }
    setIsExporting(true);
    let json = convertAnimationObjectsToJson(animationObjects);
    if (json.duration == 0) {
      alert("Анимация должна длиться дольше, чем 0 секунд!");
      setIsExporting(false);
      return;
    }
    console.log(json);
    console.log(
      imgFiles.filter((x) => !x.name.includes("(")),
      json
    );

    await startRender(
      imgFiles.filter((x) => !x.name.includes("(")),
      json
    );

    let isDownloading = false;
    let ID = setInterval(async () => {
      let status = await checkVideo(`videoTime_${currentTime}`);
      console.log(status);
      if (status === "completed") {
        clearInterval(ID);
        if (!isDownloading) {
          isDownloading = true;
          let byteArray = await getVideo(`videoTime_${currentTime}`);
          saveVideo(byteArray);
          setIsExporting(false);
        }
      } else if (status == "failed") {
        clearInterval(ID);
        alert("Произошла ошибка. Попробуйте ещё раз");
      }
    }, 1000);
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
            <div onClick={viewLesson} className={`button`}>
              Обучение
            </div>
          </div>
        </div>
      </header>
      {isLessonOpen && (
        <div className="lessonModal">
          <div className="lessonModal__content">
            <div className="lessonModal__close" onClick={closeLesson}>
              <div style={{ width: "20px", height: "20px", fontSize: "50px" }}>
                ⨯
              </div>
            </div>
            <div className="lessonModal__video">
              <h3>{videoData[currentVideoIndex].title}</h3>
              <video
                key={videoData[currentVideoIndex].src}
                width="60%"
                controls
              >
                <source
                  src={videoData[currentVideoIndex].src}
                  type="video/mp4"
                ></source>
              </video>
            </div>
            <div className="lessonModal__controls">
              <button onClick={previousVideo}>◀</button>
              <button onClick={nextVideo}>▶</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
