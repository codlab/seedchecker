import React from "react";

import SectionArduino from "./index-sections/SectionArduino.js";
import ExamplesNavbar from "../components/Navbars/ExamplesNavbar";

function Arduino() {
  document.documentElement.classList.remove("nav-open");
  React.useEffect(() => {
    document.body.classList.add("index");
    return function cleanup() {
      document.body.classList.remove("index");
    };
  });
  return (
    <>
      <ExamplesNavbar />
      <div className="main">
        <SectionArduino />
      </div>
    </>
  );
}

export default Arduino;
