import "./Main.css";
import "./Zero.css";
import { useContext, useEffect, useState } from "react";
import { Context } from "./Context.jsx";
import { AnimationMenu } from "./AnimationMenu.jsx";
import { Object as _Object } from "./Object.jsx";
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
    currentObjectId,
    addIsReadyToMove,
    imgFiles,
    setImgFiles,
  } = useContext(Context);
  const layers = [];

  // Открытие проводника файлов и сохранение изображения
  const openFilePicker = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        const imageUrl = URL.createObjectURL(file);
        setSelectedImages((prevImages) => [...prevImages, imageUrl]);
        setImgFiles((prevImages) => [...prevImages, file]);
        addIsReadyToMove(false);
        addAnimationObjects(
          String(Object.keys(animationObjects).length),
          file.name
        ); // Добавляем новое изображение к массиву
        console.log(animationObjects);
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

  return (
    <div className="main">
      <div className="main__container">
        <div className="main__left">
          <div
            className="layers"
            style={{ display: currentObjectId == null ? "flex" : "none" }}
          >
            <div className="layers__title">Canvas</div>
            <div className="layers__sep" />
            <div className="layers__box">
              {selectedImages.map((layerTitle, ind) => (
                <div className="layers__layer layer" key={ind}>
                  <div className="layer__icon">
                    <img src="./Star.svg" alt="" />
                  </div>
                  <div className="layer__title">object {ind}</div>
                </div>
              ))}
            </div>
          </div>

          <AnimationMenu></AnimationMenu>
        </div>
        <div className="main__right">
          <Scene selectedImages={selectedImages}></Scene>
        </div>
      </div>
    </div>
  );
}
