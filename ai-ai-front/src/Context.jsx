import { createContext, useEffect, useState } from "react";

export const Context = createContext();

export const Provider = ({ children }) => {
  const [isAdd, setIsAdd] = useState(false);
  const [sceneColor, setSceneColor] = useState("#f5f5f5");
  const [selectedImages, setSelectedImages] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationId, setAnimationId] = useState(0);
  const [animationTime, setAnimationTime] = useState(0);
  const [animationObjects, setAnimationObjects] = useState({});
  const [currentObjectId, setCurrentObjectId] = useState(null);
  const [currentAnimationIndex, setcurrentAnimationIndex] = useState(null);
  const [isReadyToMove, setIsReadyToMove] = useState([]);
  const [imgFiles, setImgFiles] = useState([]);

  const addAnimationObjects = (newObject, name, width, height) =>
    setAnimationObjects((prev) => ({
      ...prev,
      [newObject]: [
        [0, 0], // time: start, end
        [0, 0], // cuurrent-coord: x, y
        [],
        0, //summTimelineBlocksDistance
        name,
        1, //opacity,
        width,
        height,
      ],
    }));

  const addIsReadyToMove = (x) => setIsReadyToMove((prev) => [...prev, x]);

  return (
    <Context.Provider
      value={{
        isAdd,
        setIsAdd,
        selectedImages,
        setSelectedImages,
        isPlaying,
        setIsPlaying,
        animationId,
        setAnimationId,
        animationTime,
        setAnimationTime,
        animationObjects,
        addAnimationObjects,
        setAnimationObjects,
        currentObjectId,
        setCurrentObjectId,
        currentAnimationIndex,
        setcurrentAnimationIndex,
        isReadyToMove,
        setIsReadyToMove,
        addIsReadyToMove,
        imgFiles,
        setImgFiles,
        sceneColor,
        setSceneColor,
      }}
    >
      {children}
    </Context.Provider>
  );
};
