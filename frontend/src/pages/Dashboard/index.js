import React, { useContext, useState, useEffect } from "react";

import Paper from "@material-ui/core/Paper";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";
import FormHelperText from "@material-ui/core/FormHelperText";
import Typography from "@material-ui/core/Typography";
import { Button } from "@material-ui/core";

import SpeedIcon from "@material-ui/icons/Speed";
import GroupIcon from "@material-ui/icons/Group";
import AssignmentIcon from "@material-ui/icons/Assignment";
import PersonIcon from "@material-ui/icons/Person";
import CallIcon from "@material-ui/icons/Call";
import RecordVoiceOverIcon from "@material-ui/icons/RecordVoiceOver";
import GroupAddIcon from "@material-ui/icons/GroupAdd";
import HourglassEmptyIcon from "@material-ui/icons/HourglassEmpty";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import ForumIcon from "@material-ui/icons/Forum";
import FilterListIcon from "@material-ui/icons/FilterList";
import ClearIcon from "@material-ui/icons/Clear";
import SendIcon from '@material-ui/icons/Send';
import MessageIcon from '@material-ui/icons/Message';
import AccessAlarmIcon from '@material-ui/icons/AccessAlarm';
import TimerIcon from '@material-ui/icons/Timer';
import HeadsetMicOutlinedIcon from '@material-ui/icons/HeadsetMicOutlined';
import LibraryAddCheckOutlinedIcon from '@material-ui/icons/LibraryAddCheckOutlined';

import { makeStyles } from "@material-ui/core/styles";
import { grey, blue } from "@material-ui/core/colors";
import { toast } from "react-toastify";

import Chart from "./Chart";
import ButtonWithSpinner from "../../components/ButtonWithSpinner";

import CardCounter from "../../components/Dashboard/CardCounter";
import TableAttendantsStatus from "../../components/Dashboard/TableAttendantsStatus";
import { isArray } from "lodash";

import { AuthContext } from "../../context/Auth/AuthContext";

import useDashboard from "../../hooks/useDashboard";
import useTickets from "../../hooks/useTickets";
import useUsers from "../../hooks/useUsers";
import useContacts from "../../hooks/useContacts";
import useMessages from "../../hooks/useMessages";
import { ChatsUser } from "./ChartsUser"

import Filters from "./Filters";
import { isEmpty } from "lodash";
import moment from "moment";
import { ChartsDate } from "./ChartsDate";

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(4),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(2),
  },
  customFont: {
    fontFamily: "'Inter Tight', sans-serif", // Definindo a fonte
    fontWeight: 500,  // Caso queira ajustar o peso da fonte
    color: theme.palette.text.primary,  // Cor da fonte
  },
  fixedHeightPaper: {
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    height: 240,
    overflowY: "auto",
    ...theme.scrollbarStyles,
  },
  cardAvatar: {
    fontSize: "55px",
    color: grey[500],
    backgroundColor: "#ffffff",
    width: theme.spacing(7),
    height: theme.spacing(7),
  },
  cardTitle: {
    fontSize: "18px",
    color: blue[700],
  },
  cardSubtitle: {
    color: grey[600],
    fontSize: "14px",
  },
  alignRight: {
    textAlign: "right",
  },
  fullWidth: {
    width: "100%",
  },
  selectContainer: {
    width: "100%",
    textAlign: "left",
  },
  iframeDashboard: {
    width: "100%",
    height: "calc(100vh - 64px)",
    border: "none",
  },
  customFixedHeightPaper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: 120,
  },
  customFixedHeightPaperLg: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "100%",
  },
  card1: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "#ffffff",  // Cor de fundo branca
    color: theme.palette.type === 'dark' ? "#eee" : "#000",  // Ajuste da cor do texto
  },
  card2: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "#ffffff",  // Cor de fundo branca
    color: theme.palette.type === 'dark' ? "#eee" : "#000",  // Ajuste da cor do texto
  },
  card3: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "#ffffff",  // Cor de fundo branca
    color: theme.palette.type === 'dark' ? "#eee" : "#000",  // Ajuste da cor do texto
  },
  card4: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "#ffffff",  // Cor de fundo branca
    color: theme.palette.type === 'dark' ? "#eee" : "#000",  // Ajuste da cor do texto
  },
  card5: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "#ffffff",  // Cor de fundo branca
    color: theme.palette.type === 'dark' ? "#eee" : "#000",  // Ajuste da cor do texto
  },
  card6: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "100%",
    backgroundColor: theme.palette.type === 'dark' ? theme.palette.boxticket.main : theme.palette.primary.main, // Cor dependendo do tema
    color: "#eee",
  },
  card7: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "#ffffff",  // Cor de fundo branca
    color: theme.palette.type === 'dark' ? "#eee" : "#000",  // Ajuste da cor do texto
  },
  card8: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "#ffffff",  // Cor de fundo branca
    color: theme.palette.type === 'dark' ? "#eee" : "#000",  // Ajuste da cor do texto
  },
  card9: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "#ffffff",  // Cor de fundo branca
    color: theme.palette.type === 'dark' ? "#eee" : "#000",  // Ajuste da cor do texto
  },
  fixedHeightPaper2: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
  },
  divBody: {
    flex: '1',
    padding: theme.spacing(1),
    height: 'calc(100% - 98px)',
    background: "#FFFFFF"
  },
  titleContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start', // Alinha os itens à esquerda
    marginBottom: '1rem', // Espaçamento abaixo do contêiner
  },
}));
const Dashboard = () => {
  const classes = useStyles();
  const [counters, setCounters] = useState({});
  const [attendants, setAttendants] = useState([]);
  const [period, setPeriod] = useState(0);
  const [filterType, setFilterType] = useState(1);
  const [dateFrom, setDateFrom] = useState(moment("1", "D").format("YYYY-MM-DD"));
  const [dateTo, setDateTo] = useState(moment().format("YYYY-MM-DD"));
  const [loading, setLoading] = useState(false);
  const { find } = useDashboard();

  let newDate = new Date();
  let date = newDate.getDate();
  let month = newDate.getMonth() + 1;
  let year = newDate.getFullYear();
  let now = `${year}-${month < 10 ? `0${month}` : `${month}`}-${date < 10 ? `0${date}` : `${date}`}`;

  const [showFilter, setShowFilter] = useState(false);
  const [queueTicket, setQueueTicket] = useState(false);

  const { user } = useContext(AuthContext);
  var userQueueIds = [];

  if (user.queues && user.queues.length > 0) {
    userQueueIds = user.queues.map((q) => q.id);
  }

  useEffect(() => {
    async function firstLoad() {
      await fetchData();
    }
    setTimeout(() => {
      firstLoad();
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleChangePeriod(value) {
    setPeriod(value);
  }

  async function handleChangeFilterType(value) {
    setFilterType(value);
    if (value === 1) {
      setPeriod(0);
    } else {
      setDateFrom("");
      setDateTo("");
    }
  }

  async function fetchData() {
    setLoading(true);

    let params = {};

    if (period > 0) {
      params = {
        days: period,
      };
    }

    if (!isEmpty(dateFrom) && moment(dateFrom).isValid()) {
      params = {
        ...params,
        date_from: moment(dateFrom).format("YYYY-MM-DD"),
      };
    }

    if (!isEmpty(dateTo) && moment(dateTo).isValid()) {
      params = {
        ...params,
        date_to: moment(dateTo).format("YYYY-MM-DD"),
      };
    }

    if (Object.keys(params).length === 0) {
      toast.error("Parametrize o filtro");
      setLoading(false);
      return;
    }

    const data = await find(params);

    setCounters(data.counters);
    if (isArray(data.attendants)) {
      setAttendants(data.attendants);
    } else {
      setAttendants([]);
    }

    setLoading(false);
  }

  function formatTime(minutes) {
    return moment()
      .startOf("day")
      .add(minutes, "minutes")
      .format("HH[h] mm[m]");
  }

  const GetUsers = () => {
    let count;
    let userOnline = 0;
    attendants.forEach(user => {
      if (user.online === true) {
        userOnline = userOnline + 1
      }
    })
    count = userOnline === 0 ? 0 : userOnline;
    return count;
  };

  const GetContacts = (all) => {
    let props = {};
    if (all) {
      props = {};
    }
    const { count } = useContacts(props);
    return count;
  };

  function renderFilters() {
    if (filterType === 1) {
      return (
        <>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Data Inicial"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className={classes.fullWidth}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Data Final"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className={classes.fullWidth}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
        </>
      );
    } else {
      return (
        <Grid item xs={12} sm={6} md={4}>
          <FormControl className={classes.selectContainer}>
            <InputLabel id="period-selector-label">Período</InputLabel>
            <Select
              labelId="period-selector-label"
              id="period-selector"
              value={period}
              onChange={(e) => handleChangePeriod(e.target.value)}
            >
              <MenuItem value={0}>Nenhum selecionado</MenuItem>
              <MenuItem value={3}>Últimos 3 dias</MenuItem>
              <MenuItem value={7}>Últimos 7 dias</MenuItem>
              <MenuItem value={15}>Últimos 15 dias</MenuItem>
              <MenuItem value={30}>Últimos 30 dias</MenuItem>
              <MenuItem value={60}>Últimos 60 dias</MenuItem>
              <MenuItem value={90}>Últimos 90 dias</MenuItem>
            </Select>
            <FormHelperText>Selecione o período desejado</FormHelperText>
          </FormControl>
        </Grid>
      );
    }
  }

  return (
    <div className={classes.divBody}>

        <div className={classes.titleContainer}>
          <h1 style={{margin: '0'}}>Dashboard</h1> {/*Titulo tarefas*/}
          <Typography
            className={classes.info}
            component="subtitle1"
            variant="body1"
            style={{ fontFamily: 'Inter Regular, sans-serif', color: '#828282' }}
            >
              {'Visualize seus chamados, tempo de espera médio e gráfico acerca dos chamados no mês e na semana'}
          </Typography>
        </div>

      <Container maxWidth="lg" className={classes.container}>
        <Grid container spacing={3} justifyContent="flex-end">


          {/* EM ATENDIMENTO */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              className={classes.card1}
              style={{ overflow: "hidden" }}
              elevation={4}
            >
              <Grid container spacing={3}>
                <Grid item xs={8}>
                  <Typography
                    component="h3"
                    variant="h6"
                    paragraph
                    style={{ fontFamily: 'Inter Tight, sans-serif', fontSize: "18px", color: 'black' }} // Aplicando a nova fonte
                  >
                    Chamados Pendentes
                  </Typography>
                  <Grid item>
                    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '8vh' }}>
                      {/* Outros componentes do conteúdo aqui */}

                      <div style={{ marginTop: 'auto' }}> {/* Isso empurra o Typography para o fundo */}
                        <Typography
                          component="h1"
                          variant="body2" // Escolha uma variante menor
                          style={{ fontFamily: 'Inter Tight, sans-serif', color: 'black' }} // Aplicando a nova fonte
                        >
                          {`${counters.supportHappening} Chamados Pendentes`}
                        </Typography>
                      </div>
                    </div>
                  </Grid>
                </Grid>
                <Grid item xs={2}>
                  <HeadsetMicOutlinedIcon
                    style={{
                      fontSize: 100,
                      color: "#0C2454",
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>


          {/* AGUARDANDO */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              className={classes.card2}
              style={{ overflow: "hidden" }}
              elevation={6}
            >
              <Grid container spacing={3}>
                <Grid item xs={8}>
                  <Typography
                    component="h3"
                    variant="h6"
                    paragraph
                    className={classes.customFont}  // Aplicando a classe customizada
                    style={{ fontFamily: 'Inter Tight, sans-serif', fontSize: "18px", color: 'black' }} // Aplicando a nova fonte
                  >
                    Chamados em Andamento
                  </Typography>
                  <Grid item>
                  <div style={{ display: 'flex', flexDirection: 'column', minHeight: '8vh' }}>
                      {/* Outros componentes do conteúdo aqui */}

                      <div style={{ marginTop: 'auto' }}> {/* Isso empurra o Typography para o fundo */}
                        <Typography
                          component="h1"
                          variant="body2" // Escolha uma variante menor
                          style={{ fontFamily: 'Inter Tight, sans-serif', color: 'black' }} // Aplicando a nova fonte
                        >
                          {`${counters.supportPending} Chamados em Andamento`}
                        </Typography>
                      </div>
                    </div>
                  </Grid>
                </Grid>
                <Grid item xs={4}>
                  <HourglassEmptyIcon
                    style={{
                      fontSize: 100,
                      color: "#0C2454",
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* ATENDENTES ATIVOS */}
          {/*<Grid item xs={12} sm={6} md={4}>
            <Paper
              className={classes.card6}
              style={{ overflow: "hidden" }}
              elevation={6}
            >
              <Grid container spacing={3}>
                <Grid item xs={8}>
                  <Typography
                    component="h3"
                    variant="h6"
                    paragraph
                  >
                    Conversas Ativas
                  </Typography>
                  <Grid item>
                    <Typography
                      component="h1"
                      variant="h4"
                    >
                      {GetUsers()}
                      <span
                        style={{ color: "#805753" }}
                      >
                        /{attendants.length}
                      </span>
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item xs={4}>
                  <RecordVoiceOverIcon
                    style={{
                      fontSize: 100,
                      color: "#805753",
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>*/}

          {/* FINALIZADOS */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              className={classes.card3}
              style={{ overflow: "hidden" }}
              elevation={6}
            >
              <Grid container spacing={3}>
                <Grid item xs={8}>
                  <Typography
                    component="h3"
                    variant="h6"
                    paragraph
                    className={classes.customFont}  // Aplicando a classe customizada
                    style={{ fontFamily: 'Inter Tight, sans-serif', fontSize: "18px", color: 'black' }} // Aplicando a nova fonte
                  >
                    Chamados Finalizados
                  </Typography>
                  <Grid item>
                  <div style={{ display: 'flex', flexDirection: 'column', minHeight: '8vh' }}>
                      {/* Outros componentes do conteúdo aqui */}

                      <div style={{ marginTop: 'auto' }}> {/* Isso empurra o Typography para o fundo */}
                        <Typography
                          component="h1"
                          variant="body2" // Escolha uma variante menor
                          style={{ fontFamily: 'Inter Tight, sans-serif', color: 'black' }} // Aplicando a nova fonte
                        >
                          {`${counters.supportFinished} Chamados Finalizados`}
                        </Typography>
                      </div>
                    </div>
                  </Grid>
                </Grid>
                <Grid item xs={4}>
                  <LibraryAddCheckOutlinedIcon
                    style={{
                      fontSize: 100,
                      color: "#0C2454",
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* NOVOS CONTATOS */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              className={classes.card4}
              style={{ overflow: "hidden" }}
              elevation={6}
            >
              <Grid container spacing={3}>
                <Grid item xs={8}>
                  <Typography
                    component="h3"
                    variant="h6"
                    paragraph
                    className={classes.customFont}  // Aplicando a classe customizada
                    style={{ fontFamily: 'Inter Tight, sans-serif', fontSize: '18px', color: 'black' }} // Aplicando a nova fonte
                  >
                    Novos Chamados
                  </Typography>
                  <Grid item>
                  <div style={{ display: 'flex', flexDirection: 'column', minHeight: '8vh' }}>
                      {/* Outros componentes do conteúdo aqui */}

                      <div style={{ marginTop: 'auto' }}> {/* Isso empurra o Typography para o fundo */}
                        <Typography
                          component="h1"
                          variant="body2" // Escolha uma variante menor
                          style={{ fontFamily: 'Inter Tight, sans-serif', color: 'black' }} // Aplicando a nova fonte
                        >
                          {`${GetContacts(true)} Novos Chamados`}
                        </Typography>
                      </div>
                    </div>
                  </Grid>
                </Grid>
                <Grid item xs={4}>
                  <GroupIcon
                    style={{
                      fontSize: 100,
                      color: "#0C2454",
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>


          {/* T.M. DE ATENDIMENTO */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              className={classes.card8}
              style={{ overflow: "hidden" }}
              elevation={6}
            >
              <Grid container spacing={3}>
                <Grid item xs={8}>
                  <Typography
                    component="h3"
                    variant="h6"
                    paragraph
                    className={classes.customFont}  // Aplicando a classe customizada
                    style={{ fontFamily: 'Inter Tight, sans-serif', fontSize: "18px", color: 'black' }} // Aplicando a nova fonte
                  >
                    T.M. de Atendimento
                  </Typography>
                  <Grid item>
                  <div style={{ display: 'flex', flexDirection: 'column', minHeight: '8vh' }}>
                      {/* Outros componentes do conteúdo aqui */}

                      <div style={{ marginTop: 'auto' }}> {/* Isso empurra o Typography para o fundo */}
                        <Typography
                          component="h1"
                          variant="body2" // Escolha uma variante menor
                          style={{ fontFamily: 'Inter Tight, sans-serif', color: 'black' }} // Aplicando a nova fonte
                        >
                          {`${formatTime(counters.avgSupportTime)} `}
                        </Typography>
                      </div>
                    </div>
                  </Grid>
                </Grid>
                <Grid item xs={4}>
                  <AccessAlarmIcon
                    style={{
                      fontSize: 100,
                      color: "#0C2454",
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* T.M. DE ESPERA */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              className={classes.card9}
              style={{ overflow: "hidden" }}
              elevation={6}
            >
              <Grid container spacing={3}>
                <Grid item xs={8}>
                  <Typography
                    component="h3"
                    variant="h6"
                    paragraph
                    className={classes.customFont}  // Aplicando a classe customizada
                    style={{ fontFamily: 'Inter Tight, sans-serif', fontSize: "18px", color: 'black' }} // Aplicando a nova fonte
                  >
                    T.M. de Espera
                  </Typography>
                  <Grid item>
                  <div style={{ display: 'flex', flexDirection: 'column', minHeight: '8vh' }}>
                      {/* Outros componentes do conteúdo aqui */}

                      <div style={{ marginTop: 'auto' }}> {/* Isso empurra o Typography para o fundo */}
                        <Typography
                          component="h1"
                          variant="body2" // Escolha uma variante menor
                          style={{ fontFamily: 'Inter Tight, sans-serif', color: 'black' }} // Aplicando a nova fonte
                        >
                          {`${formatTime(counters.avgWaitTime)} `}
                        </Typography>
                      </div>
                    </div>
                  </Grid>
                </Grid>
                <Grid item xs={4}>
                  <TimerIcon
                    style={{
                      fontSize: 100,
                      color: "#0C2454",
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* FILTROS */}
          <Grid item xs={12} sm={6} md={4}>
            <FormControl className={classes.selectContainer}>
              <InputLabel id="period-selector-label">Tipo de Filtro</InputLabel>
              <Select
                labelId="period-selector-label"
                value={filterType}
                onChange={(e) => handleChangeFilterType(e.target.value)}
              >
                <MenuItem value={1}>Filtro por Data</MenuItem>
                <MenuItem value={2}>Filtro por Período</MenuItem>
              </Select>
              <FormHelperText>Selecione o período desejado</FormHelperText>
            </FormControl>
          </Grid>

          {renderFilters()}

          {/* BOTAO FILTRAR */}
          <Grid item xs={12} className={classes.alignRight}>
            <ButtonWithSpinner
              loading={loading}
              onClick={() => fetchData()}
              variant="contained"
              color="primary"
            >
              Filtrar
            </ButtonWithSpinner>
          </Grid>

          {/* USUARIOS ONLINE */}
          <Grid item xs={12}>
            {attendants.length ? (
              <TableAttendantsStatus
                attendants={attendants}
                loading={loading}
              />
            ) : null}
          </Grid>

          {/* TOTAL DE ATENDIMENTOS POR USUARIO */}
          <Grid item xs={12}>
            <Paper className={classes.fixedHeightPaper2}>
              <ChatsUser />
            </Paper>
          </Grid>

          {/* TOTAL DE ATENDIMENTOS */}
          <Grid item xs={12}>
            <Paper className={classes.fixedHeightPaper2}>
              <ChartsDate />
            </Paper>
          </Grid>

        </Grid>
      </Container >
    </div >
  );
};

export default Dashboard;