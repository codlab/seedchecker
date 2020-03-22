import React from "react";
import { Link } from "react-router-dom";
import classnames from "classnames";

import {
  Collapse,
  NavbarBrand,
  Navbar,
  NavItem,
  NavLink,
  Nav,
  Container
} from "reactstrap";
import DarkMode from "../DarkMode";

const DARK = [];
DARK[true] = "navbar-dark";
DARK[false] = "";

function ExamplesNavbar() {
  const currentDarkMode = !!DarkMode.instance.state;
  const [navbarColor, setNavbarColor] = React.useState("");
  const [darkMode, setDarkMode] = React.useState(DARK[currentDarkMode]);
  const [navbarCollapse, setNavbarCollapse] = React.useState(false);

  const toggleNavbarCollapse = () => {
    setNavbarCollapse(!navbarCollapse);
    document.documentElement.classList.toggle("nav-open");
  };

  React.useEffect(() => {
    const changeDarkMode = (state) => {
      if (state) {
        setDarkMode(DARK[true]);
      } else {
        setDarkMode(DARK[false]);
      }
    };

    DarkMode.instance.addListener("dark_mode", changeDarkMode);

    return function cleanup() {
      DarkMode.instance.removeListener("dark_mode", changeDarkMode);
    };
  });

  React.useEffect(() => {
    const updateNavbarColor = () => {
      if (
        document.documentElement.scrollTop > 299 ||
        document.body.scrollTop > 299
      ) {
        setNavbarColor("");
      } else if (
        document.documentElement.scrollTop < 300 ||
        document.body.scrollTop < 300
      ) {
        setNavbarColor("");
      }
    };

    window.addEventListener("scroll", updateNavbarColor);

    return function cleanup() {
      window.removeEventListener("scroll", updateNavbarColor);
    };
  });
  return (
    <Navbar
      className={classnames("fixed-top", navbarColor, darkMode)}
      color-on-scroll="300"
      expand="lg"
    >
      <Container>
        <div className="navbar-translate">
          <NavbarBrand
            data-placement="bottom"
            to="/index"
            target="_blank"
            title="Coded by Creative Tim"
            tag={Link}
          >
            Pokémon Tools
          </NavbarBrand>
          <button
            aria-expanded={navbarCollapse}
            className={classnames("navbar-toggler navbar-toggler", {
              toggled: navbarCollapse
            })}
            onClick={toggleNavbarCollapse}
          >
            <span className="navbar-toggler-bar bar1" />
            <span className="navbar-toggler-bar bar2" />
            <span className="navbar-toggler-bar bar3" />
          </button>
        </div>
        <Collapse
          className="justify-content-end"
          navbar
          isOpen={navbarCollapse}
        >
          <Nav navbar>
            <NavItem>
              <NavLink
                data-placement="bottom"
                href="index"
                title="Follow me on Twitter"
              >
                <i className="fa fa-star" />
                Shiny and Dudu
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                data-placement="bottom"
                href="arduino"
                title="Follow me on Twitter"
              >
                <i className="fa fa-gamepad" />
                Arduino
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                data-placement="bottom"
                href="https://wiki.pokectr.com"
                target="_blank"
                title="Follow me on Twitter"
              >
                <i className="fa fa-book" />
                Wiki
              </NavLink>
            </NavItem>

            <NavItem>
              <NavLink
                data-placement="bottom"
                href="https://twitter.com/codlab"
                target="_blank"
                title="Follow me on Twitter"
              >
                <i className="fa fa-twitter" />
                <p className="d-lg-none">Twitter</p>
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                data-placement="bottom"
                href="https://www.instagram.com/codlabtech"
                target="_blank"
                title="Follow me on Instagram"
              >
                <i className="fa fa-instagram" />
                <p className="d-lg-none">codlabtech</p>
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                data-placement="bottom"
                href="https://www.github.com/codlab/seedchecker"
                target="_blank"
                title="GitHub"
              >
                <i className="fa fa-github" />
                <p className="d-lg-none">GitHub</p>
              </NavLink>
            </NavItem>
          </Nav>
        </Collapse>
      </Container>
    </Navbar>
  );
}

export default ExamplesNavbar;
