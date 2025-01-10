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
    setCurrentObjectId,
    animationTime,
    setAnimationTime,
  } = useContext(Context);

  // Cостояние для показа/скрытия уведомления
  const [showNotification, setShowNotification] = useState(true);

  // Индекс элемента, который мы начинаем "тащить" (drag)
  const [dragIndex, setDragIndex] = useState(null);

  // Функция, которая вызывается по клику на "Добавить картинку"
  const addPicture = () => {
    setIsAdd(!isAdd);
  };

  function removeNumberSubstrings(inputString) {
    // Регулярное выражение для поиска подстрок в формате "(число)"
    const regex = /\(\d+\)/g;

    // Заменяем все найденные подстроки на пустую строку
    return inputString.replace(regex, "").trim(); // Удаляем лишние пробелы в начале и конце
  }

  // Функция, которая создаёт input для выбора файла
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

          // Проверка, нет ли уже файла с таким именем
          const existingNames = imgFiles.map((f) => f.name);
          if (existingNames.includes(file.name)) {
            // Количество дублей (сколько раз именно такое имя уже встречалось)
            const duplicatesCount = existingNames.filter(
              (_name) => removeNumberSubstrings(_name) === file.name
            ).length;

            // Генерируем новое имя, например: "img.png (1)"
            const newFileName = `${file.name}(${duplicatesCount})`;

            // Создаём новый объект File c новым именем
            const renamedFile = new File([file], newFileName, {
              type: file.type,
              lastModified: file.lastModified,
            });

            setImgFiles((prev) => [...prev, renamedFile]);
            addIsReadyToMove(false);

            addAnimationObjects(
              String(Object.keys(animationObjects).length),
              newFileName,
              imgW,
              imgH
            );
          } else {
            // Если имя не конфликтует, добавляем исходный file
            setImgFiles((prevImages) => [...prevImages, file]);
            addIsReadyToMove(false);

            addAnimationObjects(
              String(Object.keys(animationObjects).length),
              file.name,
              imgW,
              imgH
            );
          }
        };
        tempImg.src = imageUrl;
      }
    };
    input.click();
  };

  // Если нажали "Добавить картинку", сразу открываем диалог выбора файла
  useEffect(() => {
    if (isAdd) {
      openFilePicker();
      setIsAdd(!isAdd);
    }
  }, [isAdd]);

  // Функция для изменения цвета сцены
  const changeSceneColor = async (e) => {
    let color = await openColorPicker(e);
    setSceneColor(color);
  };

  // Создаём input type="color" и ждём, когда пользователь выберет цвет
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

  // Хелпер для перевода hex в rgb
  function hexToRgb(hex) {
    hex = hex.replace(/^#/, "");
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgb(${r}, ${g}, ${b})`;
  }

  /**
   * Ниже — логика для drag-and-drop:
   * 1. onDragStart: запоминаем индекс элемента, который "тащим".
   * 2. onDrop: переставляем элемент с dragIndex на dropIndex (и в selectedImages, и в animationObjects).
   */
  const handleDragStart = (e, index) => {
    setDragIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) {
      return;
    }
    reorderItems(dragIndex, dropIndex);
    setDragIndex(null);
  };

  const makeObjectCurrent = (ind) => {
    let objWrapper = document.querySelector(`#o${ind}`);
    if (objWrapper) {
      objWrapper.querySelector("img").click();
    }
  };

  // Функция, переставляющая элементы в обеих структурах (selectedImages и animationObjects)
  const reorderItems = async (fromIndex, toIndex) => {
    // 1. Переставим картинки (selectedImages).
    const newSelectedImages = [...selectedImages];
    const [movedImage] = newSelectedImages.splice(fromIndex, 1);
    newSelectedImages.splice(toIndex, 0, movedImage);

    // 2. Переставим объекты в animationObjects, сохраняя соответствие по индексам.
    //    Поскольку animationObjects — это объект с ключами "0", "1", "2", ...
    //    для удобства сделаем массив ключей, переставим их, а потом соберём обратно в объект.
    const keys = Object.keys(animationObjects).sort(
      (a, b) => Number(a) - Number(b)
    );
    const [movedKey] = keys.splice(fromIndex, 1);
    keys.splice(toIndex, 0, movedKey);

    // Формируем новый объект:
    const newAnimationObjects = {};
    keys.forEach((key, i) => {
      animationObjects[key][5] = 1;
      newAnimationObjects[String(i)] = animationObjects[key];
    });

    let objects = document.querySelectorAll(".sceneContent");
    if (objects) {
      for (let object of objects) {
        object.style.opacity = 1;
      }
      setSelectedImages(newSelectedImages);
      setAnimationObjects(newAnimationObjects);
    }
  };

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
                <div
                  className="layers__layer layer"
                  key={ind}
                  draggable
                  onClick={() => makeObjectCurrent(ind)}
                  onDragStart={(e) => handleDragStart(e, ind)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, ind)}
                >
                  <div className="layer__icon">
                    <img src="./ellipse.svg" alt="" />
                  </div>
                  <div className="layer__title">{animationObjects[ind][4]}</div>
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
