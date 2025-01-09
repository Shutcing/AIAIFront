import "./Main.css";
import "./Zero.css";
import { useContext, useEffect, useState } from "react";
import { Context } from "./Context.jsx";
import { Scene } from "./Scene.jsx";

export function Main() {
  const {
    isAdd,
    setIsAdd,
    selectedImages,
    setSelectedImages,
    animationObjects,
    addAnimationObjects,
    setAnimationObjects,
    addIsReadyToMove,
    imgFiles,
    setImgFiles,
    sceneColor,
    setSceneColor,
  } = useContext(Context);

  // Cостояние для показа/скрытия уведомления
  const [showNotification, setShowNotification] = useState(true);

  const addPicture = () => {
    setIsAdd(!isAdd);
  };

  const openFilePicker = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        const imageUrl = URL.createObjectURL(file);

        const tempImg = new Image();
        tempImg.onload = () => {
          const imgW = tempImg.width;
          const imgH = tempImg.height;

          setSelectedImages((prevImages) => [...prevImages, imageUrl]);
          setImgFiles((prevImages) => [...prevImages, file]);
          addIsReadyToMove(false);

          addAnimationObjects(
            String(Object.keys(animationObjects).length),
            file.name,
            imgW,
            imgH
          );
        };
        tempImg.src = imageUrl;
      }
    };
    input.click();
  };

  useEffect(() => {
    if (isAdd) {
      openFilePicker();
      setIsAdd(!isAdd);
    }
  }, [isAdd]);

  const changeSceneColor = async (e) => {
    let color = await openColorPicker(e);
    setSceneColor(color);
  };

  const openColorPicker = async (e) => {
    return await new Promise((resolve) => {
      const colorInput = document.createElement("input");
      colorInput.type = "color";

      colorInput.addEventListener("change", () => {
        const hexColor = colorInput.value;
        const rgbColor = hexToRgb(hexColor);
        resolve(rgbColor);
      });

      colorInput.click();
    });
  };

  function hexToRgb(hex) {
    hex = hex.replace(/^#/, "");
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgb(${r}, ${g}, ${b})`;
  }

  return (
    <div className="main">
      {/** Уведомление, которое появляется при загрузке страницы */}
      {showNotification && (
        <div className="notification">
          <div
            className="notification__close"
            onClick={() => setShowNotification(false)}
          >
            ✕
          </div>
          <div className="notification__content">
            <p>После добавления анимации, нажимайте Enter</p>
            <p>Чтобы снять выделение с объекта, нажмите Enter :)</p>
          </div>
        </div>
      )}

      <div className="main__container">
        <div className="main__left">
          <div className="sceneColor">
            <div className="sceneColor__title">Цвет фона:</div>
            <div
              className="sceneColor__color"
              onClick={changeSceneColor}
              style={{
                background: `${sceneColor}`,
              }}
            ></div>
          </div>
          <div className="layers" style={{ display: "flex" }}>
            <div className="layers__title">Объекты</div>
            <div className="layers__sep" />
            <div className="addPicture">
              <div className="addPicture__text">Добавить картинку</div>
              <div onClick={addPicture} className="addPicture__add">
                +
              </div>
            </div>
            <div className="layers__box">
              {selectedImages.map((layerTitle, ind) => (
                <div className="layers__layer layer" key={ind}>
                  <div className="layer__icon">
                    <img src="./ellipse.svg" alt="" />
                  </div>
                  <div className="layer__title">object {ind}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="main__right">
          <Scene selectedImages={selectedImages}></Scene>
        </div>
      </div>
    </div>
  );
}
