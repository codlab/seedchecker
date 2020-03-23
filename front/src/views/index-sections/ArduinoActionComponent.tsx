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
import { ArduinoActions, ArduinoAction } from "../../arduino/ArduinoAction";

export interface ArduinoActionProps {
  action: ArduinoAction
}

export default class ArduinoActionComponent extends Component<ArduinoActionProps> {

  constructor(props: ArduinoActionProps) {
    super(props);
    const isOn = DarkMode.instance.state;
    this.state = { };
  }

  componentDidMount() {
    DarkMode.instance.addListener("dark_mode", this.onDarkMode);
  }

  componentWillUnmount() {
    DarkMode.instance.removeListener("dark_mode", this.onDarkMode);
  }

  onDarkMode = (isOn: boolean) => this.setState({darkMode: isOn ? "section-dark" : ""});

  download = async () => {
    const response = await fetch('/arduino/compile?action=auto_loto&architecture=atmega16u2&day_to_skip=1')
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    // the filename you want
    a.download = "auto_loto.hex";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private setParam(name: string, value: number) {
    console.log(`${name} := ${value}`);
  }

  render() {
    const { action } = this.props;

    return (
      <Col sm="12" md="4" lg="4">
        <Row>
          <Col sm="12" md="12" lg="12">
          <div id="buttons">
            <div className="title">
              <h3>
                {action.folder} <br />
              </h3>
            </div>
              <Row>
                {
                    (action.params || []).map(param => {
                      const { name } = param;
                      return (
                        <Col sm="12">
                          <FormGroup>
                            <div>
                              <p><span className="note">{param.name}</span></p>
                            </div>
                            <Input defaultValue={0} type="number" min={-1} max={25500000} onChange={event => this.setParam(name, parseInt(event.target.value))}/>
                          </FormGroup>
                        </Col>);
                    })
                  }
                <Col>
                  <Button color="success" type="button" onClick={() => this.download()}>
                    Download
                  </Button>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </Col>
    );
  }
}