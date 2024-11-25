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
import Typography from "@material-ui/core/Typography";
import InputBase from "@material-ui/core/InputBase";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import FileModal from "../../components/FileModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { SocketContext } from "../../context/Socket/SocketContext";
import { AuthContext } from "../../context/Auth/AuthContext";

const reducer = (state, action) => {
    if (action.type === "LOAD_FILES") {
        const files = action.payload;
        const newFiles = [];

        files.forEach((fileList) => {
            const fileListIndex = state.findIndex((s) => s.id === fileList.id);
            if (fileListIndex !== -1) {
                state[fileListIndex] = fileList;
            } else {
                newFiles.push(fileList);
            }
        });

        return [...state, ...newFiles];
    }

    if (action.type === "UPDATE_FILES") {
        const fileList = action.payload;
        const fileListIndex = state.findIndex((s) => s.id === fileList.id);

        if (fileListIndex !== -1) {
            state[fileListIndex] = fileList;
            return [...state];
        } else {
            return [fileList, ...state];
        }
    }

    if (action.type === "DELETE_TAG") {
        const fileListId = action.payload;

        const fileListIndex = state.findIndex((s) => s.id === fileListId);
        if (fileListIndex !== -1) {
            state.splice(fileListIndex, 1);
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
        // padding: theme.spacing(1),
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

const FileLists = () => {
    const classes = useStyles();

    const { user } = useContext(AuthContext);

    const [loading, setLoading] = useState(false);
    const [pageNumber, setPageNumber] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [selectedFileList, setSelectedFileList] = useState(null);
    const [deletingFileList, setDeletingFileList] = useState(null);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [searchParam, setSearchParam] = useState("");
    const [files, dispatch] = useReducer(reducer, []);
    const [fileListModalOpen, setFileListModalOpen] = useState(false);

    const fetchFileLists = useCallback(async () => {
        try {
            const { data } = await api.get("/files/", {
                params: { searchParam, pageNumber },
            });
            dispatch({ type: "LOAD_FILES", payload: data.files });
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
            fetchFileLists();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchParam, pageNumber, fetchFileLists]);

    useEffect(() => {
        const socket = socketManager.getSocket(user.companyId);

        socket.on(`company-${user.companyId}-file`, (data) => {
            if (data.action === "update" || data.action === "create") {
                dispatch({ type: "UPDATE_FILES", payload: data.files });
            }

            if (data.action === "delete") {
                dispatch({ type: "DELETE_USER", payload: +data.fileId });
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [socketManager, user]);

    const handleOpenFileListModal = () => {
        setSelectedFileList(null);
        setFileListModalOpen(true);
    };

    const handleCloseFileListModal = () => {
        setSelectedFileList(null);
        setFileListModalOpen(false);
    };

    const handleSearch = (event) => {
        setSearchParam(event.target.value.toLowerCase());
    };

    const handleEditFileList = (fileList) => {
        setSelectedFileList(fileList);
        setFileListModalOpen(true);
    };

    const handleDeleteFileList = async (fileListId) => {
        try {
            await api.delete(`/files/${fileListId}`);
            toast.success(i18n.t("files.toasts.deleted"));
        } catch (err) {
            toastError(err);
        }
        setDeletingFileList(null);
        setSearchParam("");
        setPageNumber(1);

        dispatch({ type: "RESET" });
        setPageNumber(1);
        await fetchFileLists();
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
            <h1 style={{ margin: "0" }}><b>Lista de Arquivos</b></h1>
            <Typography
                component="subtitle1"
                variant="body1"
                style={{ fontFamily: 'Inter Regular, sans-serif', color: '#828282' }} // Aplicando a nova fonte
            >
                {"Adicione, edite e exclua os arquivos que serão enviado aos clientes dos chamados abertos."}
            </Typography>
            {/* <MainContainer> */}
            <ConfirmationModal
                title={deletingFileList && `${i18n.t("files.confirmationModal.deleteTitle")}`}
                open={confirmModalOpen}
                onClose={setConfirmModalOpen}
                onConfirm={() => handleDeleteFileList(deletingFileList.id)}
            >
                {i18n.t("files.confirmationModal.deleteMessage")}
            </ConfirmationModal>
            <FileModal
                open={fileListModalOpen}
                onClose={handleCloseFileListModal}
                reload={fetchFileLists}
                aria-labelledby="form-dialog-title"
                fileListId={selectedFileList && selectedFileList.id}
            />
            {/* <MainHeader> */}
            {/* <Title>{i18n.t("files.title")} ({files.length})</Title> */}

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

                    <MainHeaderButtonsWrapper>
                        <Button
                            className={classes.Botoes}
                            variant="contained"
                            color="primary"
                            onClick={handleOpenFileListModal}
                        >
                            {i18n.t("files.buttons.add")}
                        </Button>
                    </MainHeaderButtonsWrapper>
                </div>
                {/* </MainHeader> */}
            </div>
            <Paper
                className={classes.mainPaper}
                // variant="outlined"
                onScroll={handleScroll}
            >
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell align="center" className={classes.Tabela}>
                                <b>{i18n.t("files.table.name")}</b>
                            </TableCell>
                            <TableCell align="center" className={classes.Tabela}>
                                <b>{i18n.t("files.table.actions")}</b>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    {files.length > 0 ? (
                        <>
                            <TableBody>
                                <>
                                    {files.map((fileList) => (
                                        <TableRow key={fileList.id}>
                                            <TableCell align="center">
                                                {fileList.name}
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton size="small" onClick={() => handleEditFileList(fileList)} className={classes.acoes}>
                                                    <EditIcon />
                                                </IconButton>

                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        setConfirmModalOpen(true);
                                                        setDeletingFileList(fileList);
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

export default FileLists;
