import React, { useState, useEffect, useReducer, useContext } from "react";
import { toast } from "react-toastify";

import { useHistory } from "react-router-dom";

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

import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import PeopleIcon from "@material-ui/icons/People";
import DownloadIcon from "@material-ui/icons/GetApp";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import ContactListDialog from "../../components/ContactListDialog";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { Grid, InputBase } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";

import planilhaExemplo from "../../assets/planilha.xlsx";
import { SocketContext } from "../../context/Socket/SocketContext";

const reducer = (state, action) => {
  if (action.type === "LOAD_CONTACTLISTS") {
    const contactLists = action.payload;
    const newContactLists = [];

    contactLists.forEach((contactList) => {
      const contactListIndex = state.findIndex((u) => u.id === contactList.id);
      if (contactListIndex !== -1) {
        state[contactListIndex] = contactList;
      } else {
        newContactLists.push(contactList);
      }
    });

    return [...state, ...newContactLists];
  }

  if (action.type === "UPDATE_CONTACTLIST") {
    const contactList = action.payload;
    const contactListIndex = state.findIndex((u) => u.id === contactList.id);

    if (contactListIndex !== -1) {
      state[contactListIndex] = contactList;
      return [...state];
    } else {
      return [contactList, ...state];
    }
  }

  if (action.type === "DELETE_CONTACTLIST") {
    const contactListId = action.payload;

    const contactListIndex = state.findIndex((u) => u.id === contactListId);
    if (contactListIndex !== -1) {
      state.splice(contactListIndex, 1);
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

  acoes: {
    color: "#0C2C54",
    "&:hover": {
      color: "#3c5676",
    },
    width: "35px", // Reduzido para o tamanho desejado
    height: "30px",
  },

  searchInput: {
    "& .MuiOutlinedInput-root": {
      borderRadius: "50px",
    },
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

  divBody: {
    flex: 1,
    padding: theme.spacing(1),
    height: `calc(100% - 48px)`,
    overflowY: "hidden",
    background: "#FFFFFF"
  },

  Botoes: {
    borderRadius: "40px",
    padding: "10px 32px",
    justifyContent: "center",
    alignItems: "center",
    border: "1px solid var(--logo-bg, #0C2C54)",
  },

  Tabela: {
    backgroundColor: "#FFFFFF",
    fontFamily: 'Inter Tight, sans-serif',
    color: 'black'
  },
}));

const ContactLists = () => {
  const classes = useStyles();
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedContactList, setSelectedContactList] = useState(null);
  const [deletingContactList, setDeletingContactList] = useState(null);
  const [contactListModalOpen, setContactListModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [contactLists, dispatch] = useReducer(reducer, []);

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContactLists = async () => {
        try {
          const { data } = await api.get("/contact-lists/", {
            params: { searchParam, pageNumber },
          });
          dispatch({ type: "LOAD_CONTACTLISTS", payload: data.records });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };
      fetchContactLists();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    socket.on(`company-${companyId}-ContactList`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_CONTACTLIST", payload: data.record });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_CONTACTLIST", payload: +data.id });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [socketManager]);

  const handleOpenContactListModal = () => {
    setSelectedContactList(null);
    setContactListModalOpen(true);
  };

  const handleCloseContactListModal = () => {
    setSelectedContactList(null);
    setContactListModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditContactList = (contactList) => {
    setSelectedContactList(contactList);
    setContactListModalOpen(true);
  };

  const handleDeleteContactList = async (contactListId) => {
    try {
      await api.delete(`/contact-lists/${contactListId}`);
      toast.success(i18n.t("contactLists.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingContactList(null);
    setSearchParam("");
    setPageNumber(1);
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

  const goToContacts = (id) => {
    history.push(`/contact-lists/${id}/contacts`);
  };

  return (
    <div className={classes.divBody}>
      <h1 style={{ margin: "0" }}><b>Lista de Contatos</b></h1>
      <Typography
        component="subtitle1"
        variant="body1"
        style={{ fontFamily: 'Inter Regular, sans-serif', color: '#828282' }} // Aplicando a nova fonte
      >
        {"Adicione, edite e exclua suas listas para as campanhas."}
      </Typography>
      {/* <MainContainer> */}
      <ConfirmationModal
        title={
          deletingContactList &&
          `${i18n.t("contactLists.confirmationModal.deleteTitle")} ${deletingContactList.name
          }?`
        }
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => handleDeleteContactList(deletingContactList.id)}
      >
        {i18n.t("contactLists.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <ContactListDialog
        open={contactListModalOpen}
        onClose={handleCloseContactListModal}
        aria-labelledby="form-dialog-title"
        contactListId={selectedContactList && selectedContactList.id}
      />
      {/* <MainHeader> */}
      {/* <Grid style={{ width: "99.6%" }} container>
          <Grid xs={12} sm={8} item>
            <Title>{i18n.t("contactLists.title")}</Title>
          </Grid>
          <Grid xs={12} sm={4} item>
            <Grid spacing={2} container>
              <Grid xs={7} sm={6} item> */}
      <div style={{ display: "inline-flex", alignItems: 'center', width: "90%", }}>
        <div className={classes.serachInputWrapper}>
          <SearchIcon className={classes.searchIcon} />
          <InputBase
            className={classes.searchInput}
            fullWidth
            placeholder={i18n.t("contacts.searchPlaceholder")}
            type="search"
            value={searchParam}
            onChange={handleSearch}
          />
          {/* </Grid>
              <Grid xs={5} sm={6} item> */}
        </div>
        <div
                style={{ width: "1px", height: "43px", background: "#BDBDBD", marginLeft: "50px", marginRight: "50px" }}
              ></div>

            <MainHeaderButtonsWrapper style={{}}>

        <Button
          className={classes.Botoes}
          fullWidth
          variant="contained"
          color="primary"
          onClick={handleOpenContactListModal}
        >
          {i18n.t("contactLists.buttons.add")}
        </Button>
        </MainHeaderButtonsWrapper>
      </div>
      {/* </Grid>
            </Grid> */}
      {/* </Grid>
        </Grid> */}
      {/* </MainHeader> */}
      <Paper
        className={classes.mainPaper}
        // variant="outlined"
        onScroll={handleScroll}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center" className={classes.Tabela}>
              <b>{i18n.t("contactLists.table.name")}</b>
              </TableCell>
              <TableCell align="center" className={classes.Tabela}>
                <b>{i18n.t("contactLists.table.contacts")}</b>
              </TableCell>
              <TableCell align="center" className={classes.Tabela}>
              <b> {i18n.t("contactLists.table.actions")}</b>
              </TableCell>
            </TableRow>
          </TableHead>
          {contactLists.length > 0 ? (
              <>
          <TableBody>
            <>
              {contactLists.map((contactList) => (
                <TableRow key={contactList.id}>
                  <TableCell align="center">{contactList.name}</TableCell>
                  <TableCell align="center">
                    {contactList.contactsCount || 0}
                  </TableCell>
                  <TableCell align="center">
                    <a href={planilhaExemplo} download="planilha.xlsx">
                      <IconButton className={classes.acoes} title="Baixar Planilha Exemplo">
                        <DownloadIcon />
                      </IconButton>
                    </a>

                    <IconButton
                      className={classes.acoes}
                      onClick={() => goToContacts(contactList.id)}
                    >
                      <PeopleIcon />
                    </IconButton>

                    <IconButton
                      className={classes.acoes}
                      onClick={() => handleEditContactList(contactList)}
                    >
                      <EditIcon />
                    </IconButton>

                    <IconButton
                      className={classes.acoes}
                      onClick={(e) => {
                        setConfirmModalOpen(true);
                        setDeletingContactList(contactList);
                      }}
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton columns={3} />}
            </>
          </TableBody>
          </>
            ) : (
              <TableBody>
                <TableRow>
                  <TableCell colSpan="3" align="center">
                    Nenhuma lista a ser carregada no momento
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

export default ContactLists;
