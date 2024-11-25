import React, { useState, useCallback, useContext } from "react";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";

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
		overflowY: "hidden",
		marginTop: "7px",
	},
	table: {
		minWidth: 650,
	},
	customTableCell: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
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
	acoesButtons: {
		color: "#0C2C54",
		"&:hover": {
			color: "#3c5676",
		},
		width: "35px",
		height: "30px",
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
	BotaoAdicionar: {
		borderRadius: "40px",
		padding: "10px 32px",
		justifyContent: "center",
		alignItems: "center",
		border: "1px solid var(--logo-bg, #001C27)"
	},
	titleContainer: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'flex-start', // Alinha os itens à esquerda
		marginBottom: '7px', // Espaçamento abaixo do contêiner
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
	//funcao para pesquizar parametros
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

	//funçao para procurar
	const handleSearch = (event) => {
		setSearchParam(event.target.value.toLowerCase());
	};

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
		<div className={classes.divBody}>
			<h1 style={{ margin: "0" }}><b>{i18n.t("connections.title")}</b></h1>
			<Typography
				component="subtitle1"
				variant="body1"
				style={{ fontFamily: 'Inter Regular, sans-serif', color: '#828282' }} // Aplicando a nova fonte
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
			{/*<MainHeader>*/}

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
					className={classes.serachInputWrapper}>
					<SearchIcon className={classes.searchIcon} />
					<InputBase
						className={classes.searchInput}
						placeholder={i18n.t("contacts.searchPlaceholder")}
						type="search"
						value={searchParam}
						onChange={handleSearch}
					></InputBase>
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
						<Can
							role={user.profile}
							perform="connections-page:addConnection"
							yes={() => (
								<Button
									variant="contained"
									color="primary"
									//adicionei a classe pro botao ficar padronizado
									className={classes.BotaoAdicionar}
									onClick={handleOpenWhatsAppModal}
								>
									{i18n.t("connections.buttons.add")}
								</Button>
							)}
						/>
					</MainHeaderButtonsWrapper>
				</div>
			</div>
			{/*<MainHeaderButtonsWrapper>
					
				</MainHeaderButtonsWrapper>*/}
			{/*</MainHeader>*/}
			<Paper
			// className={classes.mainPaper} 
			>
				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell align="center">
								<b>{i18n.t("connections.table.name")}</b>
							</TableCell>
							<TableCell align="center">
								<b>{i18n.t("connections.table.status")}</b>
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
														<IconButton size="small" onClick={() => handleEditWhatsApp(whatsApp)} className={classes.acoesButtons}><Edit /></IconButton>
														<IconButton size="small" onClick={() => handleOpenConfirmationModal("delete", whatsApp.id)} className={classes.acoesButtons}><DeleteOutline /></IconButton>
													</TableCell>
												)}
											/>
										</TableRow>
									))
								) : (
									<TableRow>
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
