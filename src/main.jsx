import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Wrapper } from "./Wrapper.jsx";
import { Provider } from "./Context.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider>
      <Wrapper></Wrapper>
    </Provider>
  </StrictMode>
);
