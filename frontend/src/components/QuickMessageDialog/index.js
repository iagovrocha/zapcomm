import React, { useContext, useState, useEffect, useRef } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import IconButton from "@material-ui/core/IconButton";
import Grid from "@material-ui/core/Grid";
import CloseIcon from "@material-ui/icons/Close"; // Importar o ícone de fechar
import { i18n } from "../../translate/i18n";
import { head } from "lodash";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import MessageVariablesPicker from "../MessageVariablesPicker";
import ButtonWithSpinner from "../ButtonWithSpinner";
import ConfirmationModal from "../ConfirmationModal";

const path = require('path');

const useStyles = makeStyles((theme) => ({
    root: {
        display: "flex",
        flexWrap: "wrap",
    },
    multFieldLine: {
        display: "flex",
        "& > *:not(:last-child)": {
            marginRight: theme.spacing(1),
        },
    },
    btnWrapper: {
        position: "relative",
    },
    buttonProgress: {
        color: green[500],
        position: "absolute",
        top: "50%",
        left: "50%",
        marginTop: -12,
        marginLeft: -12,
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    colorAdorment: {
        width: 20,
        height: 20,
    },

    // Estilos aplicados
    dialogTitle: {
        backgroundColor: "#0C2C54",    // Fundo azul-escuro no título
        color: "#FFF", // Cor do texto branca
        borderTopLeftRadius: "0px", // Bordas arredondadas
        borderTopRightRadius: "0px",
    },
    textField: {
        width: "100%",
        borderRadius: "10px", // Bordas arredondadas no campo de texto
        "& .MuiOutlinedInput-root": {
            borderRadius: "10px",
        },
    },
    dialogActions: {
        justifyContent: "center", // Centralizar o botão
        paddingBottom: theme.spacing(2),
    },
    saveButton: {
        backgroundColor: "#34d3a3", // Cor verde para o botão
        color: "#0c2c54",
        borderRadius: "20px", // Botão com bordas arredondadas
        padding: theme.spacing(1, 4),
        "&:hover": {
            backgroundColor: "#34d3a3",
        },
    },
}));

const QuickeMessageSchema = Yup.object().shape({
    shortcode: Yup.string().required("Obrigatório"),
});

const QuickMessageDialog = ({ open, onClose, quickemessageId, reload }) => {
    const classes = useStyles();
    const { user } = useContext(AuthContext);
    const { profile } = user;
    const messageInputRef = useRef();

    const initialState = {
        shortcode: "",
        message: "",
        geral: false,
        status: true,
    };

    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const [quickemessage, setQuickemessage] = useState(initialState);
    const [attachment, setAttachment] = useState(null);
    const attachmentFile = useRef(null);

    useEffect(() => {
        try {
            (async () => {
                if (!quickemessageId) return;

                const { data } = await api.get(`/quick-messages/${quickemessageId}`);

                setQuickemessage((prevState) => {
                    return { ...prevState, ...data };
                });
            })();
        } catch (err) {
            toastError(err);
        }
    }, [quickemessageId, open]);

    const handleClose = () => {
        setQuickemessage(initialState);
        setAttachment(null);
        onClose();
    };

    const handleAttachmentFile = (e) => {
        const file = head(e.target.files);
        if (file) {
            setAttachment(file);
        }
    };

    const handleSaveQuickeMessage = async (values) => {
        const quickemessageData = {
            ...values,
            isMedia: true,
            mediaPath: attachment ? String(attachment.name).replace(/ /g, "_") : values.mediaPath ? path.basename(values.mediaPath).replace(/ /g, "_") : null,
        };

        try {
            if (quickemessageId) {
                await api.put(`/quick-messages/${quickemessageId}`, quickemessageData);
                if (attachment != null) {
                    const formData = new FormData();
                    formData.append("typeArch", "quickMessage");
                    formData.append("file", attachment);
                    await api.post(`/quick-messages/${quickemessageId}/media-upload`, formData);
                }
            } else {
                const { data } = await api.post("/quick-messages", quickemessageData);
                if (attachment != null) {
                    const formData = new FormData();
                    formData.append("typeArch", "quickMessage");
                    formData.append("file", attachment);
                    await api.post(`/quick-messages/${data.id}/media-upload`, formData);
                }
            }
            toast.success(i18n.t("quickMessages.toasts.success"));
            if (typeof reload == "function") {
                reload();
            }
        } catch (err) {
            toastError(err);
        }
        handleClose();
    };

    const deleteMedia = async () => {
        if (attachment) {
            setAttachment(null);
            attachmentFile.current.value = null;
        }

        if (quickemessage.mediaPath) {
            await api.delete(`/quick-messages/${quickemessage.id}/media-upload`);
            setQuickemessage((prev) => ({
                ...prev,
                mediaPath: null,
            }));
            toast.success(i18n.t("quickMessages.toasts.deleted"));
            if (typeof reload == "function") {
                reload();
            }
        }
    };

    const handleClickMsgVar = async (msgVar, setValueFunc) => {
        const el = messageInputRef.current;
        const firstHalfText = el.value.substring(0, el.selectionStart);
        const secondHalfText = el.value.substring(el.selectionEnd);
        const newCursorPos = el.selectionStart + msgVar.length;

        setValueFunc("message", `${firstHalfText}${msgVar}${secondHalfText}`);

        await new Promise((r) => setTimeout(r, 100));
        messageInputRef.current.setSelectionRange(newCursorPos, newCursorPos);
    };

    return (
        <div className={classes.root}>
            <ConfirmationModal
                title={i18n.t("quickMessages.confirmationModal.deleteTitle")}
                open={confirmationOpen}
                onClose={() => setConfirmationOpen(false)}
                onConfirm={deleteMedia}
            >
                {i18n.t("quickMessages.confirmationModal.deleteMessage")}
            </ConfirmationModal>
            <Dialog open={open} onClose={handleClose} maxWidth="xs">
                <DialogTitle className={classes.dialogTitle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>
                        {quickemessageId
                            ? `${i18n.t("quickMessages.dialog.edit")}`
                            : `${i18n.t("Adicionar Resposta ao Chamado")}`}
                        </span>
                        <IconButton onClick={handleClose} style={{ color: "white" }}>x</IconButton>
                    </div>  
                </DialogTitle>
                <div style={{ display: "none" }}>
                    <input
                        type="file"
                        ref={attachmentFile}
                        onChange={(e) => handleAttachmentFile(e)}
                    />
                </div>
                <Formik
                    initialValues={quickemessage}
                    enableReinitialize={true}
                    validationSchema={QuickeMessageSchema}
                    onSubmit={(values, actions) => {
                        setTimeout(() => {
                            handleSaveQuickeMessage(values);
                            actions.setSubmitting(false);
                        }, 400);
                    }}
                >
                    {({ touched, errors, isSubmitting, setFieldValue, values }) => (
                        <Form>
                            <DialogContent dividers>
                                <Grid spacing={2} container>
                                    <Grid xs={12} item>
                                        <Field
                                            as={TextField}
                                            autoFocus
                                            label={i18n.t("Título")}
                                            name="shortcode"
                                            error={touched.shortcode && Boolean(errors.shortcode)}
                                            helperText={touched.shortcode && errors.shortcode}
                                            variant="outlined"
                                            className={classes.textField}
                                        />
                                    </Grid>
                                    <Grid xs={12} item>
                                        <Field
                                            inputRef={messageInputRef}
                                            as={TextField}
                                            multiline
                                            rows={3}
                                            label={i18n.t("Mensagem")}
                                            name="message"
                                            error={touched.message && Boolean(errors.message)}
                                            helperText={touched.message && errors.message}
                                            variant="outlined"
                                            className={classes.textField}
                                        />
                                        <MessageVariablesPicker handleClickMsgVar={handleClickMsgVar} />
                                    </Grid>
                                    <Grid xs={12} item>
                                        <div className={classes.multFieldLine}>
                                            {/* <Button
                                                variant="outlined"
                                                color="primary"
                                                startIcon={<AttachFileIcon />}
                                                onClick={() => attachmentFile.current.click()}
                                            >
                                                {i18n.t("quickMessages.addAttachment")}
                                            </Button> */}
                                            {attachment && (
                                                <div>
                                                    {attachment.name}
                                                    <IconButton
                                                        color="secondary"
                                                        onClick={() => setConfirmationOpen(true)}
                                                    >
                                                        <DeleteOutlineIcon />
                                                    </IconButton>
                                                </div>
                                            )}
                                        </div>
                                    </Grid>
                                </Grid>
                            </DialogContent>
                            <DialogActions className={classes.dialogActions}>
                                {/* <Button onClick={handleClose} color="primary">
                                    {i18n.t("Cancelar")}
                                </Button> */}
                                <div className={classes.btnWrapper}>
                                    <ButtonWithSpinner 
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={classes.saveButton}
                                    >
                                        {quickemessageId
                                            ? i18n.t("quickMessages.dialog.edit")
                                            : i18n.t("Salvar")}
                                    </ButtonWithSpinner>
                                    {isSubmitting && (
                                        <CircularProgress size={24} className={classes.buttonProgress} />
                                    )}
                                </div>
                            </DialogActions>
                        </Form>
                    )}
                </Formik>
            </Dialog>
        </div>
    );
};

export default QuickMessageDialog;
