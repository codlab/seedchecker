import React from "react";

import SectionDateForm from "views/index-sections/SectionDateForm.js";
import ExamplesNavbar from "components/Navbars/ExamplesNavbar";

function Index() {
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
        <SectionDateForm />
      </div>
    </>
  );
}

export default Index;
