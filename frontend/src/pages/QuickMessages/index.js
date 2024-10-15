import React, { useState, useEffect, useReducer, useContext } from "react";
import { toast } from "react-toastify";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import { Grid } from "@material-ui/core";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import QuickMessageDialog from "../../components/QuickMessageDialog";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { isArray } from "lodash";
import { SocketContext } from "../../context/Socket/SocketContext";
import { AuthContext } from "../../context/Auth/AuthContext";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  editButton: {
    backgroundColor: "#00C853",
    color: "white",
    "&:hover": {
      backgroundColor: "#00E676",
    },
    width: "30px", // Reduzido para o tamanho desejado
    height: "30px",
  },
  deleteButton: {
    color: "red",
    width: "30px", // Reduzido para o tamanho desejado
    height: "30px",
  },
  searchInput: {
    "& .MuiOutlinedInput-root": {
      borderRadius: "50px",
    },
  },
  addButton: {
    backgroundColor: "#0C2C54",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#0C2C54",
    },
    borderRadius: "20px",
    padding: "10px 20px",
    textTransform: "none",
  },

  divBody: {
    flex: 1,
    padding: theme.spacing(1),
    height: `calc(100% - 48px)`,
    overflowY: "hidden",
  },

  Botaos: {
    borderRadius: "40px",
    padding: "10px 32px",
    justifyContent: "center",
    alignItems: "center",
    border: "1px solid var(--logo-bg, #0C2C54)",
  },

  Tabela: {
    fontFamily: 'Inter Tight, sans-serif', 
    color: 'black'
  },
}));

const reducer = (state, action) => {
  switch (action.type) {
    case "LOAD_QUICKMESSAGES":
      const quickmessages = action.payload;
      const newQuickmessages = [];
      if (isArray(quickmessages)) {
        quickmessages.forEach((quickmessage) => {
          const quickmessageIndex = state.findIndex(
            (u) => u.id === quickmessage.id
          );
          if (quickmessageIndex !== -1) {
            state[quickmessageIndex] = quickmessage;
          } else {
            newQuickmessages.push(quickmessage);
          }
        });
      }
      return [...state, ...newQuickmessages];

    case "UPDATE_QUICKMESSAGES":
      const quickmessage = action.payload;
      const quickmessageIndex = state.findIndex((u) => u.id === quickmessage.id);
      if (quickmessageIndex !== -1) {
        state[quickmessageIndex] = quickmessage;
        return [...state];
      } else {
        return [quickmessage, ...state];
      }

    case "DELETE_QUICKMESSAGE":
      const quickmessageId = action.payload;
      const quickmessageIdx = state.findIndex((u) => u.id === quickmessageId);
      if (quickmessageIdx !== -1) {
        state.splice(quickmessageIdx, 1);
      }
      return [...state];

    case "RESET":
      return [];

    default:
      return state;
  }
};

const QuickMessages = () => {
  const classes = useStyles();

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedQuickmessage, setSelectedQuickmessage] = useState(null);
  const [deletingQuickmessage, setDeletingQuickmessage] = useState(null);
  const [quickMessageModalOpen, setQuickMessageDialogOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [quickmessages, dispatch] = useReducer(reducer, []);
  const { user } = useContext(AuthContext);
  const socketManager = useContext(SocketContext);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchQuickmessages();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = user.companyId;
    const socket = socketManager.getSocket(companyId);
    socket.on(`company${companyId}-quickmessage`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_QUICKMESSAGES", payload: data.record });
      }
      if (data.action === "delete") {
        dispatch({ type: "DELETE_QUICKMESSAGE", payload: +data.id });
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [socketManager, user.companyId]);

  const fetchQuickmessages = async () => {
    try {
      const companyId = user.companyId;
      const { data } = await api.get("/quick-messages", {
        params: { searchParam, pageNumber, userId: user.id },
      });
      dispatch({ type: "LOAD_QUICKMESSAGES", payload: data.records });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenQuickMessageDialog = () => {
    setSelectedQuickmessage(null);
    setQuickMessageDialogOpen(true);
  };

  const handleCloseQuickMessageDialog = () => {
    setSelectedQuickmessage(null);
    setQuickMessageDialogOpen(false);
    fetchQuickmessages();
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditQuickmessage = (quickmessage) => {
    setSelectedQuickmessage(quickmessage);
    setQuickMessageDialogOpen(true);
  };

  const handleDeleteQuickmessage = async (quickmessageId) => {
    try {
      await api.delete(`/quick-messages/${quickmessageId}`);
      toast.success(i18n.t("quickmessages.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingQuickmessage(null);
    setSearchParam("");
    setPageNumber(1);
    fetchQuickmessages();
    dispatch({ type: "RESET" });
  };

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  const handleConfirmDelete = (quickmessage) => {
    setDeletingQuickmessage(quickmessage);
    setConfirmModalOpen(true);
  };

  return (
    <div className={classes.divBody}>
      <h1 style={{ margin: "0" }}><b>Respostas Rápidas</b></h1>
      <Typography
        component="subtitle1"
        variant="body1"
        style={{ fontFamily: 'Inter Regular, sans-serif', color: '#828282' }} // Aplicando a nova fonte
      >
        {"Adicione, edite e exclua as respostas rápidas dos chamados."}
      </Typography>
      <MainContainer>
        <ConfirmationModal
          title={
            deletingQuickmessage &&
            `${i18n.t("quickMessages.confirmationModal.deleteTitle")} ${deletingQuickmessage.shortcode}?`
          }
          open={confirmModalOpen}
          onClose={setConfirmModalOpen}
          onConfirm={() => handleDeleteQuickmessage(deletingQuickmessage.id)}
        >
          {i18n.t("quickMessages.confirmationModal.deleteMessage")}
        </ConfirmationModal>
        <QuickMessageDialog
          resetPagination={() => {
            setPageNumber(1);
            fetchQuickmessages();
          }}
          open={quickMessageModalOpen}
          onClose={handleCloseQuickMessageDialog}
          aria-labelledby="form-dialog-title"
          quickmessageId={selectedQuickmessage && selectedQuickmessage.id}
        />
        <MainHeader>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              {/* <Title>
                <strong>{i18n.t("quickMessages.title")}</strong>
              </Title>
              <Typography
                component="subtitle1"
                variant="body1"
                style={{ fontFamily: "Inter Regular, sans-serif", color: "#828282" }}
              >
                {"Adicione, edite e exclua as respostas rápidas dos chamados."}
              </Typography> */}
            </Grid>

            {/* Campo de busca e botão Adicionar abaixo da mensagem */}
            <Grid item xs={12} container justifyContent="space-between" alignItems="center" spacing={2}>
              {/* Campo de busca */}
              <Grid item xs={9}>
                <TextField
                  fullWidth
                  placeholder={i18n.t("quickMessages.searchPlaceholder")}
                  value={searchParam}
                  onChange={handleSearch}
                  className={classes.searchInput}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                />
              </Grid>
              {/* barra lateral entre itens */}
              <div
                style={{ width: "1px", height: "43px", background: "#BDBDBD", marginLeft: "50px", marginRight: "50px" }}
              ></div>

              {/* Botão Adicionar */}
              <Grid item xs={2}>
                <Button
                  variant="contained"
                  className={classes.Botaos}
                  color="primary"
                  onClick={handleOpenQuickMessageDialog}
                  fullWidth
                >
                  {i18n.t("quickMessages.buttons.add")}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </MainHeader>
        <Paper className={classes.mainPaper} onScroll={handleScroll}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell className={classes.Tabela}>
                  <b>{i18n.t("Título")}</b>
                </TableCell>
                <TableCell className={classes.Tabela}>
                  <b>{i18n.t("Mensagem")}</b>
                </TableCell>
                <TableCell className={classes.Tabela}>
                  <b>{i18n.t("Ações")}</b>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading &&
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRowSkeleton key={index} />
                ))}
              {quickmessages.length > 0 ? (
                quickmessages.map((quickmessage) => (
                  <TableRow key={quickmessage.id}>
                    <TableCell>{quickmessage.shortcode}</TableCell>
                    <TableCell>{quickmessage.message}</TableCell>
                    <TableCell align="center">
                      <Grid container justifyContent="center">
                        <Grid item>
                          <Button
                            className={classes.editButton}
                            onClick={() => handleEditQuickmessage(quickmessage)}
                          >
                            Editar
                          </Button>
                        </Grid>
                        <Grid item>
                          <Button
                            className={classes.deleteButton}
                            onClick={() => handleConfirmDelete(quickmessage)}
                          >
                            Deletar
                          </Button>
                        </Grid>
                      </Grid>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                !loading && (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      {i18n.t("Nenhuma resposta a ser carregada no momento")} 
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </Paper>
      </MainContainer>
    </div>
  );
};

export default QuickMessages;
