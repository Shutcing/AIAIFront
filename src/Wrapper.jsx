import "./Wrapper.css";
import "./Zero.css";
import { useEffect, useCallback } from "react";
import { Header } from "./Header.jsx";
import { Main } from "./MyMain.jsx";
import { Timeline } from "./Timeline.jsx";

export function Wrapper() {
  const handleWheel = useCallback((e) => {
    e.preventDefault();
  }, []);

  useEffect(() => {
    const wrapper = document.querySelector(".wrapper");
    const wheelHandler = (e) => {
      handleWheel(e);
    };

    wrapper.addEventListener("wheel", wheelHandler, { passive: false });

    return () => {
      wrapper.removeEventListener("wheel", wheelHandler);
    };
  }, [handleWheel]);

  return (
    <>
      <div className="wrapper">
        <Header />
        <Main />
        <Timeline />
      </div>
    </>
  );
}
