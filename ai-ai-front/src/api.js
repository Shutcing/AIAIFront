import axios from "axios";

const BASE_URL = "http://130.193.42.188:8000";

export const startRender = async (files, renderData) => {
  const formData = new FormData();
  files.forEach((f) => {
    formData.append("files", f);
  });
  formData.append("data", JSON.stringify(renderData));

  try {
    const response = await axios.post(`${BASE_URL}/render_wa`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Ошибка при отправке запроса /render_wa:",
      error.response || error.message
    );
    throw error;
  }
};

export const getVideo = async (videoName) => {
  try {
    const response = await axios.get(`${BASE_URL}/video_wa/${videoName}`, {
      responseType: "arraybuffer",
    });
    return response.data;
  } catch (error) {
    console.error("Ошибка при запросе видео:", error.response || error.message);
    throw error;
  }
};

export const checkVideo = async (videoName) => {
  try {
    const response = await axios.get(`${BASE_URL}/check_video/${videoName}`);
    return response.data;
  } catch (error) {
    console.error(
      "Ошибка при запросе статуса:",
      error.response || error.message
    );
    throw error;
  }
};
