import React, {
  useState,
  useEffect,
  useReducer,
  useCallback,
  useContext,
} from "react";
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

import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import TagModal from "../../components/TagModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { Chip } from "@material-ui/core";
import { Tooltip } from "@material-ui/core";
import { SocketContext } from "../../context/Socket/SocketContext";
import { AuthContext } from "../../context/Auth/AuthContext";

import Typography from "@material-ui/core/Typography";
import InputBase from "@material-ui/core/InputBase";

const reducer = (state, action) => {
  if (action.type === "LOAD_TAGS") {
    const tags = action.payload;
    const newTags = [];

    tags.forEach((tag) => {
      const tagIndex = state.findIndex((s) => s.id === tag.id);
      if (tagIndex !== -1) {
        state[tagIndex] = tag;
      } else {
        newTags.push(tag);
      }
    });

    return [...state, ...newTags];
  }

  if (action.type === "UPDATE_TAGS") {
    const tag = action.payload;
    const tagIndex = state.findIndex((s) => s.id === tag.id);

    if (tagIndex !== -1) {
      state[tagIndex] = tag;
      return [...state];
    } else {
      return [tag, ...state];
    }
  }

  if (action.type === "DELETE_TAG") {
    const tagId = action.payload;

    const tagIndex = state.findIndex((s) => s.id === tagId);
    if (tagIndex !== -1) {
      state.splice(tagIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    backgroundColor: "#FFFFFF",
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  serachInputWrapper: {
    border: "solid 1px #828282",
		flex: 1,
		display: "flex",
		borderRadius: 40,
		padding: 4,
		marginRight: theme.spacing(1),
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
  AgrupamentoDoPesquisarENovo: {
    paddingTop: "7px",
    paddingBottom: "8px",
    display: "inline-flex",
    width: "95%"
  },
  BotaoAdicionar: {
    borderRadius: "40px",
    padding: "10px 32px",
    justifyContent: "center",
    alignItems: "center",
    border: "1px solid var(--logo-bg, #001C27)"
  },
  divBody: {
    flex: 1,
    padding: theme.spacing(1),
    height: `calc(100% - 48px)`,
    backgroundColor: "#FFFFFF",
  },
  acoes: {
    color: "#0C2C54",
    "&:hover": {
      color: "#3c5676",
    },
  }
}));

const Tags = () => {
  const classes = useStyles();

  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);
  const [deletingTag, setDeletingTag] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [tags, dispatch] = useReducer(reducer, []);
  const [tagModalOpen, setTagModalOpen] = useState(false);

  const fetchTags = useCallback(async () => {
    try {
      const { data } = await api.get("/tags/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_TAGS", payload: data.tags });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toastError(err);
    }
  }, [searchParam, pageNumber]);

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchTags();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber, fetchTags]);

  useEffect(() => {
    const socket = socketManager.getSocket(user.companyId);

    socket.on("user", (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_TAGS", payload: data.tags });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_USER", payload: +data.tagId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [socketManager, user]);

  const handleOpenTagModal = () => {
    setSelectedTag(null);
    setTagModalOpen(true);
  };

  const handleCloseTagModal = () => {
    setSelectedTag(null);
    setTagModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditTag = (tag) => {
    setSelectedTag(tag);
    setTagModalOpen(true);
  };

  const handleDeleteTag = async (tagId) => {
    try {
      await api.delete(`/tags/${tagId}`);
      toast.success(i18n.t("tags.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingTag(null);
    setSearchParam("");
    setPageNumber(1);

    dispatch({ type: "RESET" });
    setPageNumber(1);
    await fetchTags();
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
  function hexToRgb(hex) {
    // Remove o símbolo "#" se ele estiver presente
    hex = hex.replace('#', '');
  
    // Converter os valores hexadecimais em valores RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
  
    return `${r}, ${g}, ${b}`;
  };
  return (
  <div className={classes.divBody}>
    <h1 style={{ margin: "0" }}><b>{i18n.t("tags.title")}</b></h1>
    <Typography
      component="subtitle1"
      variant="body1"
      style={{ fontFamily: 'Inter Regular, sans-serif', color: '#828282' }} // Aplicando a nova fonte
    >
    {"Adicione e edite as tags utilizadas."}
    </Typography>
    {/* <MainContainer style={{backgroundColor: "#FFFFFF"}}> */}
      {/* Componete do Botão de Deletar */}
      <ConfirmationModal
        title={deletingTag && `${i18n.t("tags.confirmationModal.deleteTitle")}`}
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => handleDeleteTag(deletingTag.id)}
      >
        {i18n.t("tags.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      {/* Componete do Botão de Nova Tag */}
      <TagModal
        open={tagModalOpen}
        onClose={handleCloseTagModal}
        reload={fetchTags}
        aria-labelledby="form-dialog-title"
        tagId={selectedTag && selectedTag.id}
      />
      <div>
        {/* Pesquisar */}
        <div className={classes.AgrupamentoDoPesquisarENovo}>
          <div className={classes.serachInputWrapper}>
            <SearchIcon className={classes.searchIcon} />
            <InputBase
              className={classes.searchInput}
              placeholder={i18n.t("contacts.searchPlaceholder")}
              type="search"
              value={searchParam}
              onChange={handleSearch}
              // InputProps={{
              //   startAdornment: (
              //     <InputAdornment position="start">
              //       <SearchIcon style={{ color: "gray" }} />
              //     </InputAdornment>
              //   ),
              // }}
            />
          </div>
          <div
          style={{ width: "1px", height: "48px", background: "#BDBDBD", marginLeft: "50px", marginRight: "50px" }}
          >
          </div>
          <Button
            className={classes.BotaoAdicionar}
            variant="contained"
            color="primary"
            onClick={handleOpenTagModal}
          >
            {i18n.t("tags.buttons.add")}
          </Button>	  
        </div>
      </div>  
      <Paper
        // className={classes.mainPaper}
        // variant="outlined"
        onScroll={handleScroll}
      >
        <Table size="small" style={{backgroundColor: "#FFFFFF"}}>
          <TableHead>
            <TableRow>
              <TableCell align="left">
                <b>{i18n.t("tags.table.name")}</b>
              </TableCell>
              <TableCell align="center">
                <b>{i18n.t("tags.table.tickets")}</b>
              </TableCell>
              <TableCell align="center">
                <b>{i18n.t("tags.table.actions")}</b>
              </TableCell>
            </TableRow>
          </TableHead>
          {tags.length > 0 ? (
              <>
          <TableBody>
            <>
              {tags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell align="left">
                    <Chip
                      // variant="outlined"
                      style={{
                        borderRadius: "4px",
                        backgroundColor: `rgba(${hexToRgb(tag.color)}, 0.2)`,
                        color: tag.color,
                        fontFamily: 'Inter Regular, sans-serif',
                        fontSize: "14px",
                        fontStyle: "normal",
                        fontWeight: "500",
                        lineHeight: "normal",
                      }}
                      label={<b>{tag.name}</b>}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">{tag.ticketsCount}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => handleEditTag(tag)} className={classes.acoes}>
                      <EditIcon />
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={(e) => {
                        setConfirmModalOpen(true);
                        setDeletingTag(tag);
                      }}
                      className={classes.acoes}
                      >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton columns={4} />}
            </>
          </TableBody>
          </>
            ) : (
              <TableBody>
                <TableRow>
                  <TableCell colSpan="4" align="center">
                    Nenhuma tag a ser carregada no momento
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

export default Tags;
