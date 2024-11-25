import React, { useEffect, useReducer, useState, useContext } from "react";
import {
  Button,
  IconButton,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  InputBase,
} from "@material-ui/core";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { DeleteOutline, Edit, Search as SearchIcon } from "@material-ui/icons";
import QueueModal from "../../components/QueueModal";
import { toast } from "react-toastify";
import ConfirmationModal from "../../components/ConfirmationModal";
import { SocketContext } from "../../context/Socket/SocketContext";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  customTableCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  divBody: {
    flex: 1,
    padding: theme.spacing(1),
    height: `calc(100% - 48px)`,
    backgroundColor: "#FFFFFF",
  },
  Botoes: {
    borderRadius: "40px",
    padding: "10px 32px",
    justifyContent: "center",
    alignItems: "center",
    border: "1px solid var(--logo-bg, #0C2C54)",
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
  headerContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing(1),
  },
  Tabela: {
    fontFamily: 'Inter Tight, sans-serif',
    color: 'black'
  },
}));

const reducer = (state, action) => {
  switch (action.type) {
    case "LOAD_QUEUES":
      return action.payload;
    case "UPDATE_QUEUES":
      return state.map(queue =>
        queue.id === action.payload.id ? action.payload : queue
      );
    case "DELETE_QUEUE":
      return state.filter(queue => queue.id !== action.payload);
    default:
      return state;
  }
};

const Queues = () => {
  const classes = useStyles();

  const [queues, dispatch] = useReducer(reducer, []);
  const [loading, setLoading] = useState(false);
  const [queueModalOpen, setQueueModalOpen] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/queue");
        dispatch({ type: "LOAD_QUEUES", payload: data });
        setLoading(false);
      } catch (err) {
        toastError(err);
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    socket.on(`company-${companyId}-queue`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_QUEUES", payload: data.queue });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_QUEUE", payload: data.queueId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [socketManager]);

  const handleOpenQueueModal = () => {
    setQueueModalOpen(true);
    setSelectedQueue(null);
  };

  const handleCloseQueueModal = () => {
    setQueueModalOpen(false);
    setSelectedQueue(null);
  };

  const handleEditQueue = (queue) => {
    setSelectedQueue(queue);
    setQueueModalOpen(true);
  };

  const handleCloseConfirmationModal = () => {
    setConfirmModalOpen(false);
    setSelectedQueue(null);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleDeleteQueue = async (queueId) => {
    try {
      await api.delete(`/queue/${queueId}`);
      toast.success(i18n.t("Queue deleted successfully!"));
    } catch (err) {
      toastError(err);
    }
    setSelectedQueue(null);
  };

  const filteredQueues = queues.filter((queue) =>
    queue.name.toLowerCase().includes(searchParam)
  );

  return (
    <div className={classes.divBody}>
      <h1 style={{ margin: "0" }}><b>{i18n.t("Filas & Chatbot")}</b></h1>
      <Typography
        component="subtitle1"
        variant="body1"
        style={{ fontFamily: 'Inter Regular, sans-serif', color: '#828282' }}
      >
        {"Adicione, edite e exclua filas para separar os chamados."}
      </Typography>

      <ConfirmationModal
        title={
          selectedQueue &&
          `${i18n.t("queues.confirmationModal.deleteTitle")} ${selectedQueue.name}?`
        }
        open={confirmModalOpen}
        onClose={handleCloseConfirmationModal}
        onConfirm={() => handleDeleteQueue(selectedQueue.id)}
      > (
        {i18n.t("queues.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <QueueModal
        open={queueModalOpen}
        onClose={handleCloseQueueModal}
        queueId={selectedQueue?.id}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "97%",
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
          className={classes.serachInputWrapper}>
          <SearchIcon className={classes.searchIcon} />
          <InputBase
            className={classes.searchInput}
            placeholder={i18n.t("contacts.searchPlaceholder")}
            type="search"
            value={searchParam}
            onChange={handleSearch}
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
          <MainHeaderButtonsWrapper style={{}}>
            <Button
              variant="contained"
              className={classes.Botoes}
              color="primary"
              onClick={handleOpenQueueModal}
            >
              {i18n.t("queues.buttons.add")}
            </Button>
          </MainHeaderButtonsWrapper>
        </div>
      </div>

      <Paper className={classes.mainPaper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center" className={classes.Tabela}>
                <b>{i18n.t("queues.table.id")}</b>
              </TableCell>
              <TableCell align="center" className={classes.Tabela}>
                <b>{i18n.t("queues.table.name")}</b>
              </TableCell>
              <TableCell align="center" className={classes.Tabela}>
                <b>{i18n.t("queues.table.color")}</b>
              </TableCell>
              <TableCell align="center" className={classes.Tabela}>
                <b>{i18n.t("queues.table.orderQueue")}</b>
              </TableCell>
              <TableCell align="center" className={classes.Tabela}>
                <b>{i18n.t("queues.table.greeting")}</b>
              </TableCell>
              <TableCell align="center" className={classes.Tabela}>
                <b>{i18n.t("queues.table.actions")}</b>
              </TableCell>
            </TableRow>
          </TableHead>
          {filteredQueues.length > 0 ? (
            <>
              <TableBody>
                {filteredQueues.map((queue) => (
                  <TableRow key={queue.id}>
                    <TableCell align="center">{queue.id}</TableCell>
                    <TableCell align="center">{queue.name}</TableCell>
                    <TableCell align="center">
                      <div className={classes.customTableCell}>
                        <span
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            alignSelf: "center",
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell align="center">
                      <div className={classes.customTableCell}>
                        <Typography
                          style={{ width: 300, align: "center" }}
                          noWrap
                          variant="body2"
                        >
                          {queue.orderQueue}
                        </Typography>
                      </div>
                    </TableCell>
                    <TableCell align="center">
                      <div className={classes.customTableCell}>
                        <Typography
                          style={{ width: 300, align: "center" }}
                          noWrap
                          variant="body2"
                        >
                          {queue.greeting}
                        </Typography>
                      </div>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        style={{
                          color: "#0C2C54",
                          "&:hover": {
                            color: "#3c5676",
                          },
                        }}
                        onClick={() => handleEditQueue(queue)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        style={{
                          color: "#0C2C54",
                          "&:hover": {
                            color: "#3c5676",
                          },
                        }}
                        onClick={() => {
                          setSelectedQueue(queue);
                          setConfirmModalOpen(true);
                        }}
                      >
                        <DeleteOutline />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {loading && <TableRowSkeleton columns={4} />}
              </TableBody>
            </>
          ) : (
            <TableBody>
              <TableRow>
                <TableCell colSpan="6" align="center">
                  Nenhuma fila a ser carregada no momento
                </TableCell>
              </TableRow>
            </TableBody>
          )}
        </Table>
      </Paper>
    </div>
  );
};

export default Queues;
