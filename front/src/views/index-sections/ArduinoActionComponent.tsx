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
import { t } from "../../arduino/ArduinoTranslations";

export interface ArduinoActionProps {
  action: ArduinoAction,
  architecture: string
}

export default class ArduinoActionComponent extends Component<ArduinoActionProps> {

  _holder: Map<string, string> = new Map();

  constructor(props: ArduinoActionProps) {
    super(props);
    this.state = { };

    (this.props.action.params || []).forEach(param => this._holder.set(param.name, ""+param.min || "0") );
  }

  download = async () => {
    const { action, architecture } = this.props;
    const params = (this.props.action.params || []).map(param => param.name+"="+(this._holder.get(param.name) || "0") );

    const endpoint = `/arduino/compile?action=${action}&architecture=${architecture}&${params.join('&')}`;
    const response = await fetch(endpoint);

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;

    a.download = `${action.folder}.hex`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  }

  render() {
    const { action } = this.props;

    return (
      <Col sm="12" md="4" lg="4">
        <div id="buttons">
          <div className="title">
            <h3>
              {t(action.folder)} <br />
            </h3>
          </div>
          <Row>
            { (action.params || []).map(param => {
                const { name } = param;
                return (
                  <Col sm="4">
                    <FormGroup>
                      <div>
                        <p><span className="note">{t(param.name)}</span></p>
                      </div>
                      {
                        (param.type && param.type == "boolean") ?
                        <Input type="select" name="select" id="pokemon_filter" onChange={event => this._holder.set(name, event.target.value)}>
                          <option value="0">false</option><option value="1">true</option>
                        </Input>
                        : <Input defaultValue={param.min || 0} type="number" min={param.min || 0} max={param.max || 25500000} onChange={event => this._holder.set(name, event.target.value)}/>
                      }
                    </FormGroup>
                  </Col>);
              })
            }
            <Col sm="12">
              <Button color="success" type="button" onClick={() => this.download()}>
                Download
              </Button>
            </Col>
          </Row>
        </div>
      </Col>
    );
  }
}