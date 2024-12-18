import React, { useState, useEffect, useReducer, useContext } from "react";

import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import { Tooltip } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Avatar from "@material-ui/core/Avatar";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import SearchIcon from "@material-ui/icons/Search";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import InputBase from "@material-ui/core/InputBase";

import IconButton from "@material-ui/core/IconButton";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import api from "../../services/api";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import ContactModal from "../../components/ContactModal";
import ConfirmationModal from "../../components/ConfirmationModal/";

import { i18n } from "../../translate/i18n";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import MainContainer from "../../components/MainContainer";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../../components/Can";
import NewTicketModal from "../../components/NewTicketModal";
import { SocketContext } from "../../context/Socket/SocketContext";

import { CSVLink } from "react-csv";

import Typography from "@material-ui/core/Typography";

const reducer = (state, action) => {
  if (action.type === "LOAD_CONTACTS") {
    const contacts = action.payload;
    const newContacts = [];

    contacts.forEach((contact) => {
      const contactIndex = state.findIndex((c) => c.id === contact.id);
      if (contactIndex !== -1) {
        state[contactIndex] = contact;
      } else {
        newContacts.push(contact);
      }
    });

    return [...state, ...newContacts];
  }

  if (action.type === "UPDATE_CONTACTS") {
    const contact = action.payload;
    const contactIndex = state.findIndex((c) => c.id === contact.id);

    if (contactIndex !== -1) {
      state[contactIndex] = contact;
      return [...state];
    } else {
      return [contact, ...state];
    }
  }

  if (action.type === "DELETE_CONTACT") {
    const contactId = action.payload;

    const contactIndex = state.findIndex((c) => c.id === contactId);
    if (contactIndex !== -1) {
      state.splice(contactIndex, 1);
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
    padding: "10px 32px",
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
    width: "35px", // Reduzido para o tamanho desejado
    height: "30px",
  }
}));

const Contacts = () => {
  const classes = useStyles();
  const history = useHistory();

  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam, setSearchParam] = useState("");
  const [contacts, dispatch] = useReducer(reducer, []);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [contactTicket, setContactTicket] = useState({});
  const [deletingContact, setDeletingContact] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        try {
          const { data } = await api.get("/contacts/", {
            params: { searchParam, pageNumber },
          });
          dispatch({ type: "LOAD_CONTACTS", payload: data.contacts });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };
      fetchContacts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    socket.on(`company-${companyId}-contact`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_CONTACTS", payload: data.contact });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_CONTACT", payload: +data.contactId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [socketManager]);

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleOpenContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(true);
  };

  const handleCloseContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(false);
  };

  // const handleSaveTicket = async contactId => {
  // 	if (!contactId) return;
  // 	setLoading(true);
  // 	try {
  // 		const { data: ticket } = await api.post("/tickets", {
  // 			contactId: contactId,
  // 			userId: user?.id,
  // 			status: "open",
  // 		});
  // 		history.push(`/tickets/${ticket.id}`);
  // 	} catch (err) {
  // 		toastError(err);
  // 	}
  // 	setLoading(false);
  // };

  const handleCloseOrOpenTicket = (ticket) => {
    setNewTicketModalOpen(false);
    if (ticket !== undefined && ticket.uuid !== undefined) {
      history.push(`/tickets/${ticket.uuid}`);
    }
  };

  const hadleEditContact = (contactId) => {
    setSelectedContactId(contactId);
    setContactModalOpen(true);
  };

  const handleDeleteContact = async (contactId) => {
    try {
      await api.delete(`/contacts/${contactId}`);
      toast.success(i18n.t("contacts.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingContact(null);
    setSearchParam("");
    setPageNumber(1);
  };

  const handleimportContact = async () => {
    try {
      await api.post("/contacts/import");
      history.go(0);
    } catch (err) {
      toastError(err);
    }
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
      <h1 style={{ margin: "0" }}><b>Contatos</b></h1>
      <Typography
        component="subtitle1"
        variant="body1"
        style={{ fontFamily: 'Inter Regular, sans-serif', color: '#828282' }} // Aplicando a nova fonte
      >
        {"Adicione e gerencie seus contatos"}
      </Typography>
      {/* <MainContainer> */}
      <NewTicketModal
        modalOpen={newTicketModalOpen}
        initialContact={contactTicket}
        onClose={(ticket) => {
          handleCloseOrOpenTicket(ticket);
        }}
      />
      <ContactModal
        open={contactModalOpen}
        onClose={handleCloseContactModal}
        aria-labelledby="form-dialog-title"
        contactId={selectedContactId}
      ></ContactModal>
      <ConfirmationModal
        title={
          deletingContact
            ? `${i18n.t("contacts.confirmationModal.deleteTitle")} ${deletingContact.name
            }?`
            : `${i18n.t("contacts.confirmationModal.importTitlte")}`
        }
        open={confirmOpen}
        onClose={setConfirmOpen}
        onConfirm={(e) =>
          deletingContact
            ? handleDeleteContact(deletingContact.id)
            : handleimportContact()
        }
      >
        {deletingContact
          ? `${i18n.t("contacts.confirmationModal.deleteMessage")}`
          : `${i18n.t("contacts.confirmationModal.importMessage")}`}
      </ConfirmationModal>
      {/* <MainHeader> */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minWidth: "37%",
          width: "97%",
          flexWrap: "nowrap",
        }}
      >

        <div
          style={{
            flex: "1 1 auto",
            display: "flex",
            alignItems: "center",
            minWidth: "30%",
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
              className={classes.Botoes}
              variant="contained"
              color="primary"
              onClick={(e) => setConfirmOpen(true)}
            >
              {i18n.t("contacts.buttons.import")} {document.body.offsetWidth < 600 ? '' : 'CONTATOS'}
            </Button>
            <Button
              className={classes.Botoes}
              variant="contained"
              color="primary"
              onClick={handleOpenContactModal}
            >
              {i18n.t("contacts.buttons.add")} {document.body.offsetWidth < 600 ? '' : 'CONTATOS'}
            </Button>

            <CSVLink style={{ textDecoration: 'none' }} separator=";" filename={'contatos.csv'} data={contacts.map((contact) => ({ name: contact.name, number: contact.number, email: contact.email }))}>
              <Button variant="contained" color="primary" className={classes.Botoes}>
                EXPORTAR {document.body.offsetWidth < 600 ? '' : 'CONTATOS'}
              </Button>
            </CSVLink>
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
              <TableCell padding="checkbox" />
              <TableCell className={classes.Tabela}>
                <b>
                  {i18n.t("contacts.table.name")}
                </b>
              </TableCell>
              <TableCell align="center" className={classes.Tabela}>
                <b>
                  {i18n.t("contacts.table.whatsapp")}
                </b>
              </TableCell>
              <TableCell align="center" className={classes.Tabela}>
                <b>
                  {i18n.t("contacts.table.email")}
                </b>
              </TableCell>
              <TableCell align="center" className={classes.Tabela}>
                <b>
                  {i18n.t("contacts.table.actions")}
                </b>
              </TableCell>
            </TableRow>
          </TableHead>
          {contacts.length > 0 ? (
            <>
              <TableBody>
                <>
                  {contacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell style={{ paddingRight: 0 }}>
                        {<Avatar src={contact.profilePicUrl} />}
                      </TableCell>
                      <TableCell>{contact.name}</TableCell>
                      <TableCell align="center">{contact.number}</TableCell>
                      <TableCell align="center">{contact.email}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setContactTicket(contact);
                            setNewTicketModalOpen(true);
                          }}
                          className={classes.acoes}
                        >
                          <WhatsAppIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => hadleEditContact(contact.id)}
                          className={classes.acoes}
                        >
                          <EditIcon />
                        </IconButton>
                        <Can
                          role={user.profile}
                          perform="contacts-page:deleteContact"
                          yes={() => (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                setConfirmOpen(true);
                                setDeletingContact(contact);
                              }}
                              className={classes.acoes}
                            >
                              <DeleteOutlineIcon />
                            </IconButton>
                          )}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {loading && <TableRowSkeleton avatar columns={3} />}
                </>
              </TableBody>
            </>
          ) : (
            <TableBody>
              <TableRow>
                <TableCell colSpan="5" align="center">
                  Nenhum contato a ser carregado no momento
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

export default Contacts;
