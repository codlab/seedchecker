import React, { Component } from "react";
import Switch from "react-bootstrap-switch";
import ReactDatetime from "react-datetime";
import classnames from "classnames";

import PokemonFrame, {Configs, SHINY, OnlineDataProvider, Game, CalcIVS} from "libseedchecker";
/*

    SWORD = 1,
    SHIELD = 2
*/
import moment from "moment";

import {
  Button,
  FormGroup,
  Input,
  InputGroupAddon,
  InputGroupText,
  Progress,
  InputGroup,
  Label,
  Container,
  Table,
  Modal,
  Row,
  Col
} from "reactstrap";
import DarkMode from "../../components/DarkMode";
import DuduMode from "../../components/Dudu";

class SectionButtons extends Component {

  constructor(props) {
    super(props);
    const isOn = DarkMode.instance.state;
    this.state = {
      isDuduMode: DuduMode.instance.isDuduMode(),
      dudus: [],
      darkMode: isOn ? "section-dark" : "",
      results:[],
      infinityMode: true,
      shinyType: SHINY.STAR,
      isHA: false,
      progressLimit: 0,
      progressStep: 0,
      show_extend: false,
      pokemonIndex: undefined,
      filter_game: Game.SWORD,
      found_dens: [],
      use_den_conf: undefined
    };

    this.dataProvider = new OnlineDataProvider();
  }

  componentDidMount() {
    DarkMode.instance.addListener("dark_mode", this.onDarkMode);
  }

  componentWillUnmount() {
    DarkMode.instance.removeListener("dark_mode", this.onDarkMode);
  }

  onDarkMode = (isOn) => this.setState({darkMode: isOn ? "section-dark" : ""});

  render() {
    const { error, darkMode } = this.state;
    const showModal = error && error.length > 0;

    console.log("footer", showModal);
    return (
      <>
        <Modal isOpen={showModal} toggle={() => this.dismiss()}>
          <div className="modal-header">
            <button
              aria-label="Close"
              className="close"
              type="button"
              onClick={() => this.dismiss()}
            >
              <span aria-hidden={true}>×</span>
            </button>
            <h5
              className="modal-title text-center"
              id="exampleModalLabel"
            >
              An error occured
            </h5>
          </div>
          <div className="modal-body">{error}</div>
          <div className="modal-footer">
            <div className="left-side">
            </div>
            <div className="right-side">
              <Button className="btn-link" color="danger" type="button" onClick={() => this.dismiss()}>
                OK
              </Button>
            </div>
          </div>
        </Modal>
        
        <div className={classnames("section", "section-buttons", darkMode)}>
          <Container>
            <Row>
              <Col sm="8" md="8" lg="8">
                <div className="title">
                  <h2>Arduino</h2>
                </div>
              </Col>
            </Row>
            <Row>
              <Col sm="12" md="6" lg="6">
                <Row>
                  <Col sm="12" md="12" lg="12">
                  <div id="buttons">
                    <div className="title">
                      <h3>
                        Download Arduino<br />
                      </h3>
                    </div>
                      <Row>
                        <Col>
                          <Button color="success" type="button" onClick={() => this.download()}>
                            Download AutoLoto (WIP)
                          </Button>
                        </Col>
                      </Row>
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Container>
        </div>
      </>
    );
  }
}

export default SectionButtons;
