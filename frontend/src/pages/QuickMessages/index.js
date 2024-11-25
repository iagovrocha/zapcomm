import React, { useState, useEffect, useReducer, useContext, useCallback } from "react";
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
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import CheckCircleIcon from '@material-ui/icons/CheckCircle';

import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import QuickMessageDialog from "../../components/QuickMessageDialog";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { Grid } from "@material-ui/core";
import { isArray } from "lodash";
import { SocketContext } from "../../context/Socket/SocketContext";
import { AuthContext } from "../../context/Auth/AuthContext";

import Typography from "@material-ui/core/Typography";
import InputBase from "@material-ui/core/InputBase";

const reducer = (state, action) => {
  if (action.type === "LOAD_QUICKMESSAGES") {
    const quickmessages = action.payload;
    const newQuickmessages = [];

    if (isArray(quickmessages)) {
      quickmessages.forEach((quickemessage) => {
        const quickemessageIndex = state.findIndex(
          (u) => u.id === quickemessage.id
        );
        if (quickemessageIndex !== -1) {
          state[quickemessageIndex] = quickemessage;
        } else {
          newQuickmessages.push(quickemessage);
        }
      });
    }

    return [...state, ...newQuickmessages];
  }

  if (action.type === "UPDATE_QUICKMESSAGES") {
    const quickemessage = action.payload;
    const quickemessageIndex = state.findIndex((u) => u.id === quickemessage.id);

    if (quickemessageIndex !== -1) {
      state[quickemessageIndex] = quickemessage;
      return [...state];
    } else {
      return [quickemessage, ...state];
    }
  }

  if (action.type === "DELETE_QUICKMESSAGE") {
    const quickemessageId = action.payload;

    const quickemessageIndex = state.findIndex((u) => u.id === quickemessageId);
    if (quickemessageIndex !== -1) {
      state.splice(quickemessageIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  divBody: {
    flex: 1,
    padding: theme.spacing(1),
    height: `calc(100% - 48px)`,
    backgroundColor: "#FFFFFF",
  },

  Botoes: {
    borderRadius: "40px",
    padding: "10px 20px",
    justifyContent: "center",
    alignItems: "center",
    border: "1px solid var(--logo-bg, #001C27)"
  },

  Tabela: {
    fontFamily: 'Inter Tight, sans-serif',
    color: 'black'
  },

  serachInputWrapper: {
    border: "solid 1px #828282",
    flex: 1,
    display: "flex",
    borderRadius: 40,
    padding: 4,
    marginRight: theme.spacing(1),
    width: '70%',
    height: '48px',
  },

  searchIcon: {
    color: "grey",
    marginLeft: 6,
    marginRight: 6,
    alignSelf: "center",
  },

  searchInput: {
    flex: 1,
    border: "none",
    borderRadius: 30,
  },

  acoes: {
    color: "#0C2C54",
    "&:hover": {
      color: "#3c5676",
    },
    width: "35px",
    height: "30px",
  }
}));

const Quickemessages = () => {
  const classes = useStyles();

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedQuickemessage, setSelectedQuickemessage] = useState(null);
  const [deletingQuickemessage, setDeletingQuickemessage] = useState(null);
  const [quickemessageModalOpen, setQuickMessageDialogOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [quickemessages, dispatch] = useReducer(reducer, []);
  const { user } = useContext(AuthContext);
  const { profile } = user;

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchQuickemessages();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = user.companyId;
    const socket = socketManager.getSocket(companyId);

    socket.on(`company${companyId}-quickemessage`, (data) => {
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

  const fetchQuickemessages = async () => {
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
    setSelectedQuickemessage(null);
    setQuickMessageDialogOpen(true);
  };

  const handleCloseQuickMessageDialog = () => {
    setSelectedQuickemessage(null);
    setQuickMessageDialogOpen(false);
    fetchQuickemessages();
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditQuickemessage = (quickemessage) => {
    setSelectedQuickemessage(quickemessage);
    setQuickMessageDialogOpen(true);
  };

  const handleDeleteQuickemessage = async (quickemessageId) => {
    try {
      await api.delete(`/quick-messages/${quickemessageId}`);
      toast.success(i18n.t("quickemessages.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingQuickemessage(null);
    setSearchParam("");
    setPageNumber(1);
    fetchQuickemessages();
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
      {/* <MainContainer> */}
      <ConfirmationModal
        title={deletingQuickemessage && `${i18n.t("quickMessages.confirmationModal.deleteTitle")} ${deletingQuickemessage.shortcode}?`}
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => handleDeleteQuickemessage(deletingQuickemessage.id)}
      >
        {i18n.t("quickMessages.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <QuickMessageDialog
        resetPagination={() => {
          setPageNumber(1);
          fetchQuickemessages();
        }}
        open={quickemessageModalOpen}
        onClose={handleCloseQuickMessageDialog}
        aria-labelledby="form-dialog-title"
        quickemessageId={selectedQuickemessage && selectedQuickemessage.id}
      />
      {/* <MainHeader> */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          flexWrap: "nowrap",
        }}
      >
        <div
          style={{
            flex: "1 1 auto", 
            display: "flex",
            alignItems: "center",
            maxWidth: "80%", 
          }}
          className={classes.serachInputWrapper}
        >
          <SearchIcon className={classes.searchIcon} />
          <InputBase
            className={classes.searchInput}
            placeholder={i18n.t("quickMessages.searchPlaceholder")}
            type="search"
            value={searchParam}
            onChange={handleSearch}
            style={{
              width: "100%", 
            }}
          />
        </div>

        <div
          style={{
            width: "1px",
            height: "43px",
            background: "#BDBDBD",
          }}
        ></div>

        <div
          style={{
            flex: "0 0 auto", 
          }}
        >
          <MainHeaderButtonsWrapper>
            <Button
              className={classes.Botoes}
              variant="contained"
              onClick={handleOpenQuickMessageDialog}
              color="primary"
              style={{
                whiteSpace: "nowrap",
              }}
            >
              {i18n.t("quickMessages.buttons.add")}
            </Button>
          </MainHeaderButtonsWrapper>
        </div>
      </div>

      {/* </MainHeader> */}
      <Paper
        // className={classes.mainPaper}
        // variant="outlined"
        onScroll={handleScroll}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center" className={classes.Tabela}>
                <b>{i18n.t("quickMessages.table.shortcode")}</b>
              </TableCell>

              <TableCell align="center" className={classes.Tabela}>
                <b>{i18n.t("quickMessages.table.mediaName")}</b>
              </TableCell>
              <TableCell align="center" className={classes.Tabela}>
                <b>{i18n.t("quickMessages.table.actions")}</b>
              </TableCell>
            </TableRow>
          </TableHead>
          {quickemessages.length > 0 ? (
            <>
              <TableBody>
                <>
                  {quickemessages.map((quickemessage) => (
                    <TableRow key={quickemessage.id}>
                      <TableCell align="center">{quickemessage.shortcode}</TableCell>

                      <TableCell align="center">
                        {quickemessage.mediaName ?? i18n.t("quickMessages.noAttachment")}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleEditQuickemessage(quickemessage)}
                          className={classes.acoes}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            setConfirmModalOpen(true);
                            setDeletingQuickemessage(quickemessage);
                          }}
                          className={classes.acoes}
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {loading && <TableRowSkeleton columns={5} />}
                </>
              </TableBody>
            </>
          ) : (
            <TableBody>
              <TableRow>
                <TableCell colSpan="5" align="center">
                  Nenhuma resposta a ser carregada no momento
                </TableCell>
              </TableRow>
            </TableBody>
          )}
        </Table>
      </Paper>
      {/* </MainContainer> */}
    </div>
  );
};

export default Quickemessages;