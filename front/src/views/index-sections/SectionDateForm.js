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
import DarkMode from "components/DarkMode";
import DuduMode from "components/Dudu";

const ROW_TYPE = ["-", "⭐", "◇", "👉"];
const NATURES = [ "Bashful", "Docile", "Hardy", "Serious", "Quirky", "Bold", "Modest", "Calm", "Timid", "Lonely", "Mild", "Gentle", "Hasty", "Adamant", "Impish", "Careful", "Jolly", "Naughty", "Lax", "Rash", "Naive", "Brave", "Relaxed", "Quiet", "Sassy" ];

const {locations} = Configs.data;
const { nests, names } = Configs;
console.log(nests);

const den_names = []; //Map?
nests.forEach(nest => {
  const name = locations[nest.location];
  den_names[nest.normal] = name;
  den_names[nest.rare] = name;
});

var IV31 = [];
while(IV31.length < 31) IV31.push(IV31.length);

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
      squareOnly: false,
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
      var date = calculatedDate.clone();
      date = date.add(frame, "days");

      return date.format("DD/MM/YYYY");
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

  asSeed(seed) {
    if(seed && seed.indexOf("0x") == 0) {
      return seed.replace("0x", "");
    }
    return seed;
  }

  calculate() {
    const { seed, infinityMode, squareOnly, switchDate, use_den_conf, input_stats } = this.state;
    var pokemon_configuration = use_den_conf ? use_den_conf.pokemon : null;

    const ivs = input_stats ? this.recalculateIVS(input_stats) : undefined;
    
    try {
      const timestamp = moment().valueOf();
      this.new_calculus = timestamp;
      const pokemon = new PokemonFrame(this.asSeed(seed), 0);
      const results = [];
  
      var limit = infinityMode ? (squareOnly ? 5 : 10) : 1;

      const canceled = () => this.new_calculus != timestamp;
      const done = () => limit == 0;

      const step = (remaining_steps) => {
        const current_found = results.length;
        while(!canceled() && remaining_steps > 0 && !done()) {
          pokemon.advanceFrame(1);
          const result = pokemon.getShinyState(pokemon_configuration);
          var valid = result.shiny != SHINY.NONE;
          if(squareOnly) valid = valid && result.shiny == SHINY.SQUARE;
          if(valid) limit --;
    
          console.log("use_den_conf", {result, pokemon_configuration});
          result.row_type = result.shiny;
          if(input_stats) {
            const {hp, atk, def, spa, spd, spe} = result;
            var same_ivs = true;
            if(hp !== ivs.hp) same_ivs = false;
            if(atk !== ivs.atk) same_ivs = false;
            if(def !== ivs.def) same_ivs = false;
            if(spa !== ivs.spa) same_ivs = false;
            if(spd !== ivs.spd) same_ivs = false;
            if(spe !== ivs.spe) same_ivs = false;

            console.log("iv match ? ", { same_ivs, calculated: {hp, atk, def, spa, spd, spe}, ivs });
            if(same_ivs && !valid) {
              result.row_type = "iv";
              valid = true;
            }
           }
 
          valid && results.push(result);
          remaining_steps --;
        }

        if(canceled()) {
          console.log("canceled");
        } else if(done()) {
          this.setState({progressLimit: limit, progressStep: results.length, results, calculatedDate: switchDate ? switchDate.clone(): undefined});
        } else {
          if(results.length != current_found) {
            this.setState({progressLimit: limit, progressStep: results.length});
          }
          setTimeout(() => step(50), 1);
        }
      }

      this.setState({progressLimit: limit, progressStep: 0, results, calculatedDate: switchDate ? switchDate.clone(): undefined});
      step(50);
    } catch(e) {
      console.error(e);
      this.setState({error: "Error while calculating the Pokémon info", results: [], calculatedDate: undefined});
    }
  }

  filterMon(show_extend) {
    const {pokemonIndex, filter_game} = this.state;
    this._setFilterAndMon(show_extend, pokemonIndex || 1, filter_game);
  }

  filterPokemonIndex(pokemonIndex) {
    const {filter_game} = this.state;
    this._setFilterAndMon(true, pokemonIndex, filter_game);
  }

  filterGameIndex(filter_game) {
    const {pokemonIndex} = this.state;
    this._setFilterAndMon(true, pokemonIndex, filter_game);
  }

  setFilteredPokemonConfiguration(filtered_configuration_index) {
    const {found_dens, show_extend} = this.state;
    if(show_extend && filtered_configuration_index < found_dens.length) {
      const use_den_conf = found_dens[filtered_configuration_index];
      this.setState({use_den_conf})
    } else {
      this.setState({use_den_conf: undefined})
    }
  }

  loadEvent(game, name) {
    return this.dataProvider.load_event(name)
    .then(events => events.filter(event => {
      console.log("matching game ?", event.game+" "+game)
      return event.game == game
    }))
    .then(events => events.map(event => ({...event, name}) ));
  }

  loadEvents(game) {
    return this.dataProvider.load_events()
    .then(events => Promise.all(events.map(event => this.loadEvent(game, event))))
    .then(events => events.flat())
  }

  _setFilterAndMon(show_extend, pokemonIndex, filter_game) {
    this.setState({show_extend, pokemonIndex,filter_game});
    if(!show_extend) return;

    Promise.all([
      this.dataProvider.load_nests(),
      this.loadEvents(filter_game)
    ])
    .then(([loaded_nests, loaded_events]) => {

      var found_dens = [];
      const list = loaded_nests.find(({game}) => game == filter_game)
      if(list) {
        const { nests } = list;
        console.log(nests);

        nests.forEach(({nestId, pokemons}) => {
          pokemons.filter(p => p.species() == pokemonIndex).forEach(pokemon => found_dens.push({nestId, pokemon}));
        });
      }

      if(loaded_events) {
        loaded_events.forEach(({name, pokemons}) => {
          pokemons.filter(p => p.species() == pokemonIndex).forEach(pokemon => found_dens.push({name, pokemon}));
        });
      }

      this.setState({found_dens, use_den_conf: found_dens.length > 0 ? found_dens[0]:undefined});
    });
  }

  foundDenToString(found_den) {
    const { pokemon, nestId, name } = found_den;
    var { MinRank, MaxRank } = (pokemon.data||{MinRank: 0, MaxRank: 0});
    const rank = MinRank == MaxRank ? (MinRank+1) : `${MinRank+1}-${MaxRank+1}`;
    const gmax = pokemon.isGigantamax() ? "G " : " ";

    if(name) return `${names[pokemon.species()]} ${gmax}${rank}\u2605(${name})`
    return `${names[pokemon.species()]} ${gmax}${rank}\u2605(${den_names[nestId]})`
  }

  toRowType(type) {
    if(type == "iv") return ROW_TYPE[3];
    switch(type) {
      case SHINY.STAR: return ROW_TYPE[1];
      case SHINY.SQUARE: return ROW_TYPE[2];
      default: return "";
    }
  }

  dismiss() {
    this.setState({error: undefined});
  }

  componentDidMount() {
    DarkMode.instance.addListener("dark_mode", this.onDarkMode);
    DuduMode.instance.addListener("dudu", this.onDuduMode);
    DuduMode.instance.addListener("dudu_list", this.onDudus);
  }

  componentWillUnmount() {
    DarkMode.instance.removeListener("dark_mode", this.onDarkMode);
    DuduMode.instance.removeListener("dudu", this.onDuduMode);
    DuduMode.instance.removeListener("dudu_list", this.onDudus);
  }

  onDarkMode = (isOn) => this.setState({darkMode: isOn ? "section-dark" : ""});
  onDuduMode = (isOn) => this.setState({isDuduMode: isOn });
  onDudus = (dudus) => this.setState({dudus});

  setSelectedStat(name, value) {
    var { use_den_conf, input_stats } = this.state;

    if(!input_stats) input_stats = {nature: 1, level: 0, hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0};
    input_stats[name] = value;

    this.setState({input_stats: {...input_stats}});
  }

  recalculateIVS(input_stats) {
    var { use_den_conf, input_stats } = this.state;
    if(!use_den_conf || !input_stats) return undefined;
    const array = ["hp", "atk", "def", "spa", "spd", "spe"];

    const stats = array.map(v => input_stats[v]);

    const calc = new CalcIVS(use_den_conf.pokemon.species(), input_stats.level, input_stats.nature || 1, stats);
    const result = {};
    const calculated = calc.calc();
    console.log({calculated, stats});
    calculated.forEach((value, index) => result[array[index]] = value);

    return result;
  }

  showCalculateIV(name) {
    const ivs = this.recalculateIVS();
    if(!ivs) return undefined;
    return ivs[name];
  }

  render() {
    const {found_dens, show_extend, dudus, isDuduMode, darkMode, results, error, progressStep, progressLimit} = this.state;
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
                  <h2>Seed shiny finder</h2>
                </div>
              </Col>
              <Col>
                <div id="dark_mode">
                  <p>
                    <span className="note">Dark Mode</span>
                  </p>
                  <label>
                    <Switch
                      onChange={(e, isOn) => DarkMode.instance.setDarkMode(isOn)}
                      defaultValue={darkMode && darkMode.length > 0}
                      onColor="primary"
                      offColor="primary"
                    />
                  </label>
                </div>
              </Col>
            </Row>
            <Row>
              <Col sm="12" md="12" lg="6">
                <Row>
                  <Col sm="12" md="12" lg="12">
                  <div id="buttons">
                    <div className="title">
                      <h3>
                        Seed Checker Configuration <br />
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

                      {show_extend && <Row>
                        <Col sm="12" md="12" lg="12">
                          <div id="filter_title">
                            <p><span className="note">Filter to find frame back</span></p>
                          </div>
                        </Col>
                        <Col sm="12" md="6" lg="6">
                          <FormGroup>
                            <Input type="select" name="select" onChange={event => this.filterPokemonIndex(event.target.selectedIndex + 1)}>
                              {
                                names.filter((name, i) => i > 0).map((name, index) => <option value={index+1}>{`#${index+1} ${name}`}</option> )
                              }
                            </Input>
                          </FormGroup>
                        </Col>
                        <Col sm="12" md="6" lg="6">
                          <FormGroup>
                            <Input type="select" name="select" onChange={event => this.filterGameIndex(event.target.selectedIndex + 1)}>
                              <option>Sword</option>
                              <option>Shield</option>
                            </Input>
                          </FormGroup>
                        </Col>
                        <Col sm="12" md="12" lg="12">
                          <FormGroup>
                            <Input type="select" name="select" onChange={event => this.setFilteredPokemonConfiguration(event.target.selectedIndex)}>
                              {
                                found_dens.map(found_den => <option>{this.foundDenToString(found_den)}</option>)
                              }
                            </Input>
                          </FormGroup>
                        </Col>

                        <Col sm="12" md="12" lg="12">
                          <div id="filter_title">
                            <p><span className="note">Caught Pokémon at current frame 's Stats</span></p>
                          </div>
                        </Col>
                        {
                          ["LEVEL", "HP", "ATK", "DEF", "SPA", "SPD", "SPE"].map(value => {
                            return (
                              <Col sm="2">
                                <FormGroup>
                                  <div id="filter_title">
                                    <p><span className="note">{value}</span></p>
                                  </div>
                                  <Input type="number" min={-1} max={9000} onChange={event => this.setSelectedStat(value.toLowerCase(), parseInt(event.target.value))}/>
                                </FormGroup>
                                { this.showCalculateIV(value.toLowerCase()) }
                              </Col>);
                          })
                        }
                        <Col sm="12" md="3" lg="3">
                          <FormGroup>
                            <div id="filter_title">
                              <p><span className="note">Nature</span></p>
                            </div>
                            <Input type="select" name="select" id="pokemon_filter" onChange={event => this.setSelectedStat("nature", event.target.selectedIndex + 1)}>
                              { NATURES.map(nature => <option>{nature}</option>) }
                            </Input>
                          </FormGroup>
                        </Col>
                      </Row>}

                      <Row>
                        <Col>
                          <div id="switches">
                            <p>
                              <span className="note">Find frame</span>
                            </p>
                            <label>
                              <Switch
                                onChange={(e, isOn) => this.filterMon(isOn)}
                                defaultValue={false}
                                onColor="primary"
                                offColor="primary"
                              />
                            </label>
                          </div>
                        </Col>
                        <Col>
                          <div id="switches">
                            <p>
                              <span className="note">Infinity</span>
                            </p>
                            <label>
                              <Switch
                                onChange={(e, isOn) => this.toInfinity(isOn)}
                                defaultValue={true}
                                onColor="primary"
                                offColor="primary"
                              />
                            </label>
                          </div>
                        </Col>
                        <Col>
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
                        <Col>
                          <Button color="success" type="button" onClick={() => this.calculate()}>
                            GO !
                          </Button>
                        </Col>
                      </Row>
                    </div>
                  </Col>

                  <Col sm="12" md="12" lg="12">
                    <div id="buttons">
                      <div className="title">
                        <h3>
                          Results <br />
                        </h3>
                      </div>
                    </div>
                    <Row>
                      <Col>
                        <Progress
                          max={progressLimit}
                          value={progressStep}
                          barClassName="progress-bar-success"
                        />
                      </Col>
                    </Row>
                    <Row  sm="12" md="12" lg="12">
                      <Col sm="12" md="12" lg="12">
                        {
                          ((results||[]).length > 0) &&
                          (<Table striped bordered hover>
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Type</th>
                              <th>Infos</th>
                              <th>DD/MM/YYYY</th>
                            </tr>
                          </thead>
                          <tbody>
                          {
                            (results||[]).map((result, index) => {
                              const { current, hp, atk, def, spa, spd, spe } = result;
                              const { frame, seed } = current;
                              console.log(result.current);

                              var ivs = "";
                              if(hp || atk || def || spa || spd || spe) {
                                ivs = `${hp}/${atk}/${def}/${spa}/${spd}/${spe}`
                              }

                              return (<tr>
                                <td className="colorable">
                                  #{frame}
                                </td>
                                <td className="colorable">
                                  {this.toRowType(result.row_type)}
                                </td>
                                <td className="colorable">
                                  {seed.toString(16)}<br />{ivs}
                                </td>
                                <td className="colorable">
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
              </Col>

              <Col sm="12" md="6" lg="6">
                <Row>
                  <Col sm="12" md="12" lg="12">
                  <div id="buttons">
                    <div className="title">
                      <h3>
                        Dudu's Configuration <br />
                      </h3>
                    </div>
                      <Row>
                        <Col>
                          <div id="others">
                            <p>
                              <span className="note">Dudu</span>
                            </p>
                            <label>
                              <Switch
                                onChange={(e, isOn) => DuduMode.instance.setDuduMode(isOn)}
                                defaultValue={isDuduMode}
                                onColor="primary"
                                offColor="primary"
                              />
                            </label>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  </Col>

                  {
                    isDuduMode &&
                    (<>
                    <Col sm="12" md="6" lg="6">
                      <div id="buttons">
                        <div className="title">
                          <h3>
                            Dudu's real time <br />
                          </h3>
                        </div>
                      </div>
                      <Row  sm="12" md="12" lg="12">
                        <Col sm="12" md="12" lg="12">
                          <Table striped bordered hover>
                            <thead>
                              <tr>
                                <th>OT</th>
                                <th>Pokémon</th>
                                <th>Seed</th>
                              </tr>
                            </thead>
                            <tbody>
                            {
                              dudus.map((dudu, index) => {

                                return (<tr>
                                  <td className="colorable">
                                    {dudu.trainer}
                                  </td>
                                  <td className="colorable">
                                    {dudu.pokemon}
                                  </td>
                                  <td className="colorable">
                                    {dudu.seed}
                                  </td>
                                </tr>);
                              })
                            }
                            </tbody>
                          </Table>
                        </Col>
                      </Row>
                    </Col>
                    </>)
                  }
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
