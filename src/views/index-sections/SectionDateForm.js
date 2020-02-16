import React, { Component } from "react";
import Switch from "react-bootstrap-switch";
import ReactDatetime from "react-datetime";

import PokemonFrame, {SHINY} from "libseedchecker";

import {
  Button,
  FormGroup,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Container,
  Table,
  Modal,
  Row,
  Col
} from "reactstrap";

const SHINY_TYPE = ["-", "☆", "◇"];

class SectionButtons extends Component {

  constructor(props) {
    super(props);
    this.state = {results:[], infinityMode: false, squareOnly: false};
  }

  setSeed(seed) {
    this.setState({seed});
  }

  switchDate(date) {
    if(date.toDate) {
      this.setState({switchDate: date});
    } else {
      console.log("invalid date");
    }
  }

  toDateFrame(frame) {
    const { calculatedDate } = this.state;
    if(calculatedDate) {
      const added = calculatedDate.add(frame, "days");

      return added.format("DD/MM/YYYY");
    }
    return "";
  }

  toInfinity(infinityMode) {
    this.setState({infinityMode});
  }

  toSquare(squareOnly) {
    console.log(squareOnly);
    this.setState({squareOnly});
  }

  calculate() {
    const { seed, infinityMode, squareOnly, switchDate } = this.state;
    try {
      const pokemon = new PokemonFrame(seed, 0);
      const results = [];
  
      const limit = squareOnly ? 5 : 50;
  
      while((infinityMode && results.length < limit) || (!infinityMode && results.length == 0)) {
        pokemon.advanceFrame(1);
        const result = pokemon.getShinyState();
        var valid = result.shiny != SHINY.NONE;
        if(squareOnly) valid = valid && result.shiny == SHINY.SQUARE;
  
        valid && results.push(result);
      }
  
      this.setState({results, calculatedDate: switchDate});
    } catch(e) {
      this.setState({error: "Error while calculating the Pokémon info", results: [], calculatedDate: undefined});
    }
  }

  toShiny(type) {
    switch(type) {
      case SHINY.STAR: return SHINY_TYPE[1];
      case SHINY.SQUARE: return SHINY_TYPE[2];
      default: return "";
    }
  }

  dismiss() {
    this.setState({error: undefined});
  }

  render() {
    const {results, error} = this.state;
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
        
        <div className="section section-buttons">
          <Container>
            <div className="title">
              <h2>Seed shiny finder</h2>
            </div>
            <Row>
              <Col sm="12" md="6" lg="6">
              <div id="buttons">
                <div className="title">
                  <h3>
                    Configuration <br />
                  </h3>
                </div>
                  <Row>
                    <Col sm="12" md="12" lg="12">
                      <FormGroup>
                        <InputGroup className="date" id="datetimepicker">
                          <ReactDatetime
                            onChange={(value) => this.switchDate(value)}
                            inputProps={{
                              placeholder: "Select your switch date"
                            }}
                          />
                          <InputGroupAddon addonType="append">
                            <InputGroupText>
                              <span className="glyphicon glyphicon-calendar">
                                <i aria-hidden={true} className="fa fa-calendar" />
                              </span>
                            </InputGroupText>
                          </InputGroupAddon>
                        </InputGroup>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm="12" md="12" lg="12">
                      <FormGroup>
                        <Input placeholder="Your Pokémon seed" type="text"
                          onChange={event => this.setSeed(event.target.value)}/>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm="6" md="4" lg="4">
                      <div id="switches">
                        <p>
                          <span className="note">Infinity</span>
                        </p>
                        <label>
                          <Switch
                            onChange={(e, isOn) => this.toInfinity(isOn)}
                            defaultValue={false}
                            onColor="primary"
                            offColor="primary"
                          />
                        </label>
                      </div>
                    </Col>
                    <Col sm="6" md="4" lg="4">
                      <div id="switches">
                        <p>
                          <span className="note">Square</span>
                        </p>
                        <label>
                          <Switch
                            onChange={(e, isOn) => this.toSquare(isOn)}
                            defaultValue={false}
                            onColor="primary"
                            offColor="primary"
                          />
                        </label>
                      </div>
                    </Col>
                    <Col sm="6" md="4" lg="4">
                      <Button color="success" type="button" onClick={() => this.calculate()}>
                        GO !
                      </Button>
                    </Col>
                  </Row>
                </div>
              </Col>

              <Col sm="12" md="6" lg="6">
                <div id="buttons">
                  <div className="title">
                    <h3>
                      Results <br />
                    </h3>
                  </div>
                </div>
                <Row  sm="12" md="12" lg="12">
                  <Col sm="12" md="12" lg="12">
                    {
                      ((results||[]).length > 0) &&
                      (<Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Type</th>
                          <th>Seed</th>
                          <th>DD/MM/YYYY</th>
                        </tr>
                      </thead>
                      <tbody>
                      {
                        (results||[]).map((result, index) => {
                          const { frame, seed } = result.current;
                          console.log(seed);

                          return (<tr>
                            <td>
                              #{frame}
                            </td>
                            <td>
                              {this.toShiny(result.shiny)}
                            </td>
                            <td>
                              {seed.toString(16)}
                            </td>
                            <td>
                              {this.toDateFrame(frame)}
                            </td>
                          </tr>);
                        })
                      }
                      </tbody>
                      </Table>)
                    }
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
