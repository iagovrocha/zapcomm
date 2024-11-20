import React, { useState, useCallback, useContext } from "react";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";

//Ícone da lupa importado 
import SearchIcon from "@material-ui/icons/Search";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import {
	Button,
	TableBody,
	TableRow,
	TableCell,
	IconButton,
	Table,
	TableHead,
	Paper,
	Tooltip,
	Typography,
	CircularProgress,
	InputBase,
} from "@material-ui/core";
import {
	Edit,
	CheckCircle,
	SignalCellularConnectedNoInternet2Bar,
	SignalCellularConnectedNoInternet0Bar,
	SignalCellular4Bar,
	CropFree,
	DeleteOutline,
} from "@material-ui/icons";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import TableRowSkeleton from "../../components/TableRowSkeleton";

import api from "../../services/api";
import WhatsAppModal from "../../components/WhatsAppModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import QrcodeModal from "../../components/QrcodeModal";
import { i18n } from "../../translate/i18n";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";
import toastError from "../../errors/toastError";

import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../../components/Can";

const useStyles = makeStyles(theme => ({
	mainPaper: {
		flex: 1,
		padding: theme.spacing(1),
		overflowY: "scroll",
		...theme.scrollbarStyles,
	},
	customTableCell: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	},

	searchInputWrapper: {
		border: "solid 1px #828282",
        outline: "none", 
		flex: 1,
		display: "flex",
		borderRadius: 40,
		padding: 4,
		marginRight: theme.spacing(1),
	},

	//Ícone de busca usado dentro do input
	searchIcon: {
		color: "grey",
		marginLeft: 6,
		marginRight: 6,
		alignSelf: "center",
	},

	//Barra arredondada de busca do input
	searchInput: {
		flex: 1,
		border: "none",
		borderRadius: 30,
		padding: 4, 
        
	},

	// CSS do divBody
	divBody: {
		flex: 1,
		padding: theme.spacing(1),
		height: `calc(100% - 48px)`,
		backgroundColor: "#FFFFFF",
	},
	tooltip: {
		backgroundColor: "#f5f5f9",
		color: "rgba(0, 0, 0, 0.87)",
		fontSize: theme.typography.pxToRem(14),
		border: "1px solid #dadde9",
		maxWidth: 450,
	},

	tooltipPopper: {
		textAlign: "center",
	},
	buttonProgress: {
		color: green[500],
	},

	//Classe nova adicionada para o botao "Adicionar Whatsapp"
	BotaoAdicionar: {
		borderRadius: "40px",
		padding: "10px 32px",
		justifyContent: "center",
		alignItems: "center",
		border: "1px solid var(--logo-bg, #001C27)"
	  },

}));

const CustomToolTip = ({ title, content, children }) => {
	const classes = useStyles();

	return (
		<Tooltip
			arrow
			classes={{
				tooltip: classes.tooltip,
				popper: classes.tooltipPopper,
			}}
			title={
				<React.Fragment>
					<Typography gutterBottom color="inherit">
						{title}
					</Typography>
					{content && <Typography>{content}</Typography>}
				</React.Fragment>
			}
		>
			{children}
		</Tooltip>
	);
};

const Connections = () => {
	const classes = useStyles();

	const { user } = useContext(AuthContext);
	const { whatsApps, loading } = useContext(WhatsAppsContext);
	const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
	const [qrModalOpen, setQrModalOpen] = useState(false);
	const [selectedWhatsApp, setSelectedWhatsApp] = useState(null);
	const [confirmModalOpen, setConfirmModalOpen] = useState(false);
	const [searchParam, setSearchParam] = useState("");
	
	const confirmationModalInitialState = {
		action: "",
		title: "",
		message: "",
		whatsAppId: "",
		open: false,
	};
	const [confirmModalInfo, setConfirmModalInfo] = useState(
		confirmationModalInitialState
	);

	const handleStartWhatsAppSession = async whatsAppId => {
		try {
			await api.post(`/whatsappsession/${whatsAppId}`);
		} catch (err) {
			toastError(err);
		}
	};

	const handleRequestNewQrCode = async whatsAppId => {
		try {
			await api.put(`/whatsappsession/${whatsAppId}`);
		} catch (err) {
			toastError(err);
		}
	};

	
	const handleSearch = (event) => {
		setSearchParam(event.target.value.toLowerCase());
	  };

	//Codigo usado para detectar a palavra a medida que é digitada
	const filteredWhatsApps = whatsApps ? (searchParam
	? whatsApps.filter(whatsApp =>
		whatsApp.name.toLowerCase().includes(searchParam)
	)
	: whatsApps) : [];

	const handleOpenWhatsAppModal = () => {
		setSelectedWhatsApp(null);
		setWhatsAppModalOpen(true);
	};

	const handleCloseWhatsAppModal = useCallback(() => {
		setWhatsAppModalOpen(false);
		setSelectedWhatsApp(null);
	}, [setSelectedWhatsApp, setWhatsAppModalOpen]);

	const handleOpenQrModal = whatsApp => {
		setSelectedWhatsApp(whatsApp);
		setQrModalOpen(true);
	};

	const handleCloseQrModal = useCallback(() => {
		setSelectedWhatsApp(null);
		setQrModalOpen(false);
	}, [setQrModalOpen, setSelectedWhatsApp]);

	const handleEditWhatsApp = whatsApp => {
		setSelectedWhatsApp(whatsApp);
		setWhatsAppModalOpen(true);
	};

	const handleOpenConfirmationModal = (action, whatsAppId) => {
		if (action === "disconnect") {
			setConfirmModalInfo({
				action: action,
				title: i18n.t("connections.confirmationModal.disconnectTitle"),
				message: i18n.t("connections.confirmationModal.disconnectMessage"),
				whatsAppId: whatsAppId,
			});
		}

		if (action === "delete") {
			setConfirmModalInfo({
				action: action,
				title: i18n.t("connections.confirmationModal.deleteTitle"),
				message: i18n.t("connections.confirmationModal.deleteMessage"),
				whatsAppId: whatsAppId,
			});
		}
		setConfirmModalOpen(true);
	};

	const handleSubmitConfirmationModal = async () => {
		if (confirmModalInfo.action === "disconnect") {
			try {
				await api.delete(`/whatsappsession/${confirmModalInfo.whatsAppId}`);
			} catch (err) {
				toastError(err);
			}
		}

		if (confirmModalInfo.action === "delete") {
			try {
				await api.delete(`/whatsapp/${confirmModalInfo.whatsAppId}`);
				toast.success(i18n.t("connections.toasts.deleted"));
			} catch (err) {
				toastError(err);
			}
		}

		setConfirmModalInfo(confirmationModalInitialState);
	};

	const renderActionButtons = whatsApp => {
		return (
			<>
				{whatsApp.status === "qrcode" && (
					<Button
						size="small"
						variant="contained"
						color="primary"
						onClick={() => handleOpenQrModal(whatsApp)}
					>
						{i18n.t("connections.buttons.qrcode")}
					</Button>
				)}
				{whatsApp.status === "DISCONNECTED" && (
					<>
						<Button
							size="small"
							variant="outlined"
							color="primary"
							onClick={() => handleStartWhatsAppSession(whatsApp.id)}
						>
							{i18n.t("connections.buttons.tryAgain")}
						</Button>{" "}
						<Button
							size="small"
							variant="outlined"
							color="secondary"
							onClick={() => handleRequestNewQrCode(whatsApp.id)}
						>
							{i18n.t("connections.buttons.newQr")}
						</Button>
					</>
				)}
				{(whatsApp.status === "CONNECTED" ||
					whatsApp.status === "PAIRING" ||
					whatsApp.status === "TIMEOUT") && (
					<Button
						size="small"
						variant="outlined"
						color="secondary"
						onClick={() => {
							handleOpenConfirmationModal("disconnect", whatsApp.id);
						}}
					>
						{i18n.t("connections.buttons.disconnect")}
					</Button>
				)}
				{whatsApp.status === "OPENING" && (
					<Button size="small" variant="outlined" disabled color="default">
						{i18n.t("connections.buttons.connecting")}
					</Button>
				)}
			</>
		);
	};

	const renderStatusToolTips = whatsApp => {
		return (
			<div className={classes.customTableCell}>
				{whatsApp.status === "DISCONNECTED" && (
					<CustomToolTip
						title={i18n.t("connections.toolTips.disconnected.title")}
						content={i18n.t("connections.toolTips.disconnected.content")}
					>
						<SignalCellularConnectedNoInternet0Bar color="secondary" />
					</CustomToolTip>
				)}
				{whatsApp.status === "OPENING" && (
					<CircularProgress size={24} className={classes.buttonProgress} />
				)}
				{whatsApp.status === "qrcode" && (
					<CustomToolTip
						title={i18n.t("connections.toolTips.qrcode.title")}
						content={i18n.t("connections.toolTips.qrcode.content")}
					>
						<CropFree />
					</CustomToolTip>
				)}
				{whatsApp.status === "CONNECTED" && (
					<CustomToolTip title={i18n.t("connections.toolTips.connected.title")}>
						<SignalCellular4Bar style={{ color: green[500] }} />
					</CustomToolTip>
				)}
				{(whatsApp.status === "TIMEOUT" || whatsApp.status === "PAIRING") && (
					<CustomToolTip
						title={i18n.t("connections.toolTips.timeout.title")}
						content={i18n.t("connections.toolTips.timeout.content")}
					>
						<SignalCellularConnectedNoInternet2Bar color="secondary" />
					</CustomToolTip>
				)}
			</div>
		);
	};

	return (
		// div usada para padronizar as paginas e substituir o MainContainer
		<div className={classes.divBody}>
			  <h1 style={{ margin: "0" }}><b>{i18n.t("connections.title")}</b></h1>
			  <Typography
				component="subtitle1"
				variant="body1"
				style={{ fontFamily: 'Inter Regular, sans-serif', color: '#828282' }}
				>
				{"Adicione, edite e exclua seus bots e projetos."}
			  </Typography>
			<ConfirmationModal
				title={confirmModalInfo.title}
				open={confirmModalOpen}
				onClose={setConfirmModalOpen}
				onConfirm={handleSubmitConfirmationModal}
			>
				{confirmModalInfo.message}
			</ConfirmationModal>
			<QrcodeModal
				open={qrModalOpen}
				onClose={handleCloseQrModal}
				whatsAppId={!whatsAppModalOpen && selectedWhatsApp?.id}
			/>
			<WhatsAppModal
				open={whatsAppModalOpen}
				onClose={handleCloseWhatsAppModal}
				whatsAppId={!qrModalOpen && selectedWhatsApp?.id}
			/>
			<MainHeader>
				
			<div className={classes.searchInputWrapper}>
            	<SearchIcon className={classes.searchIcon} />

				{/* Atributos do InputBase que servem para a busca de conexoes especificas  */}
				<InputBase
					className={classes.searchInput}
					placeholder={i18n.t("contacts.searchPlaceholder")}
					type="search"
					value={searchParam}
					onChange={handleSearch}
				></InputBase>
          </div>
		  {/* Traço vertical que divide o espaço entre o input de busca e o botao de adicionar */}
		  <div 
          		style={{ width: "1px", height: "48px", background: "#BDBDBD", marginLeft: "50px", marginRight: "50px" }}
          	>
          </div>
				<MainHeaderButtonsWrapper>
					<Can
						role={user.profile}
						perform="connections-page:addConnection"
						
						yes={() => (
							
							<Button
								variant="contained"
								color="primary"
						
								//Adicionada a classe "BotaoAdicionar" pro botão ficar fiel ao figma
								className={classes.BotaoAdicionar}
								onClick={handleOpenWhatsAppModal}
							>
								{i18n.t("connections.buttons.add")}
							</Button>
						)}
					/>
				</MainHeaderButtonsWrapper>
			</MainHeader>
			<Paper className={classes.mainPaper} variant="outlined">
				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell align="center">
								{i18n.t("connections.table.name")}
							</TableCell>
							<TableCell align="center">
								{i18n.t("connections.table.status")}
							</TableCell>
							<Can
								role={user.profile}
								perform="connections-page:actionButtons"
								yes={() => (
									<TableCell align="center">
										{i18n.t("connections.table.session")}
									</TableCell>
								)}
							/>
							<TableCell align="center">
								{i18n.t("connections.table.lastUpdate")}
							</TableCell>
							<TableCell align="center">
								{i18n.t("connections.table.default")}
							</TableCell>
							<Can
								role={user.profile}
								perform="connections-page:editOrDeleteConnection"
								yes={() => (
									<TableCell align="center">
										{i18n.t("connections.table.actions")}
									</TableCell>
								)}
							/>
						</TableRow>
					</TableHead>
					<TableBody>
						{loading ? (
						 <TableRow><TableCell colSpan={5} align="center"><CircularProgress /></TableCell></TableRow>
                        ) : (
                            <>
							{/* filtra as conexoes existentes com base no nome da conexao digitada no input */}
                                {filteredWhatsApps.length > 0 ? (
                                    filteredWhatsApps.map(whatsApp => (
                                        <TableRow key={whatsApp.id}>
                                            <TableCell align="center">{whatsApp.name}</TableCell>
                                            <TableCell align="center">{renderStatusToolTips(whatsApp)}</TableCell>
                                            <Can
                                                role={user.profile}
                                                perform="connections-page:actionButtons"
                                                yes={() => (
                                                    <TableCell align="center">
                                                        {renderActionButtons(whatsApp)}
                                                    </TableCell>
                                                )}
                                            />
                                            <TableCell align="center">
                                                {format(parseISO(whatsApp.updatedAt), "dd/MM/yy HH:mm")}
                                            </TableCell>
                                            <TableCell align="center">
                                                {whatsApp.isDefault && <CheckCircle style={{ color: green[500] }} />}
                                            </TableCell>
                                            <Can
                                                role={user.profile}
                                                perform="connections-page:editOrDeleteConnection"
                                                yes={() => (
                                                    <TableCell align="center">
                                                        <IconButton size="small" onClick={() => handleEditWhatsApp(whatsApp)}><Edit /></IconButton>
                                                        <IconButton size="small" onClick={() => handleOpenConfirmationModal("delete", whatsApp.id)}><DeleteOutline /></IconButton>
                                                    </TableCell>
                                                )}
                                            />
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
										{/* Caso nao tenha sido encontrada nenhuma conexao o texto "Nenhuma conexão encontrada" será mostrado*/}
                                        <TableCell colSpan={6} align="center">
                                            <Typography variant="body1">Nenhuma conexão encontrada</Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </>
                        )}
					</TableBody>
				</Table>
			</Paper>
		</div>);
};

export default Connections;
