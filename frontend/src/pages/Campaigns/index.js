/* eslint-disable no-unused-vars */

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
import Typography from "@material-ui/core/Typography";

import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import DescriptionIcon from "@material-ui/icons/Description";
import TimerOffIcon from "@material-ui/icons/TimerOff";
import PlayCircleOutlineIcon from "@material-ui/icons/PlayCircleOutline";
import PauseCircleOutlineIcon from "@material-ui/icons/PauseCircleOutline";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import CampaignModal from "../../components/CampaignModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { Grid, InputBase } from "@material-ui/core";
import { isArray } from "lodash";
import { useDate } from "../../hooks/useDate";
import { SocketContext } from "../../context/Socket/SocketContext";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";

const reducer = (state, action) => {
  if (action.type === "LOAD_CAMPAIGNS") {
    const campaigns = action.payload;
    const newCampaigns = [];

    if (isArray(campaigns)) {
      campaigns.forEach((campaign) => {
        const campaignIndex = state.findIndex((u) => u.id === campaign.id);
        if (campaignIndex !== -1) {
          state[campaignIndex] = campaign;
        } else {
          newCampaigns.push(campaign);
        }
      });
    }

    return [...state, ...newCampaigns];
  }

  if (action.type === "UPDATE_CAMPAIGNS") {
    const campaign = action.payload;
    const campaignIndex = state.findIndex((u) => u.id === campaign.id);

    if (campaignIndex !== -1) {
      state[campaignIndex] = campaign;
      return [...state];
    } else {
      return [campaign, ...state];
    }
  }

  if (action.type === "DELETE_CAMPAIGN") {
    const campaignId = action.payload;

    const campaignIndex = state.findIndex((u) => u.id === campaignId);
    if (campaignIndex !== -1) {
      state.splice(campaignIndex, 1);
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
  acoesButtons: {
    color: "#0C2C54",
    "&:hover": {
      color: "#3c5676",
    },
    width: "35px", 
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

const Campaigns = () => {
  const classes = useStyles();

  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [deletingCampaign, setDeletingCampaign] = useState(null);
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [campaigns, dispatch] = useReducer(reducer, []);

  const { datetimeToClient } = useDate();

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchCampaigns();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    socket.on(`company-${companyId}-campaign`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_CAMPAIGNS", payload: data.record });
      }
      if (data.action === "delete") {
        dispatch({ type: "DELETE_CAMPAIGN", payload: +data.id });
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [socketManager]);

  const fetchCampaigns = async () => {
    try {
      const { data } = await api.get("/campaigns/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_CAMPAIGNS", payload: data.records });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenCampaignModal = () => {
    setSelectedCampaign(null);
    setCampaignModalOpen(true);
  };

  const handleCloseCampaignModal = () => {
    setSelectedCampaign(null);
    setCampaignModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditCampaign = (campaign) => {
    setSelectedCampaign(campaign);
    setCampaignModalOpen(true);
  };

  const handleDeleteCampaign = async (campaignId) => {
    try {
      await api.delete(`/campaigns/${campaignId}`);
      toast.success(i18n.t("campaigns.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingCampaign(null);
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

  const formatStatus = (val) => {
    switch (val) {
      case "INATIVA":
        return "Inativa";
      case "PROGRAMADA":
        return "Programada";
      case "EM_ANDAMENTO":
        return "Em Andamento";
      case "CANCELADA":
        return "Cancelada";
      case "FINALIZADA":
        return "Finalizada";
      default:
        return val;
    }
  };

  const cancelCampaign = async (campaign) => {
    try {
      await api.post(`/campaigns/${campaign.id}/cancel`);
      toast.success(i18n.t("campaigns.toasts.cancel"));
      setPageNumber(1);
      fetchCampaigns();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const restartCampaign = async (campaign) => {
    try {
      await api.post(`/campaigns/${campaign.id}/restart`);
      toast.success(i18n.t("campaigns.toasts.restart"));
      setPageNumber(1);
      fetchCampaigns();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className={classes.divBody}>
      <h1 style={{ margin: "0" }}><b>Campanhas</b></h1>
      <Typography
        component="subtitle1"
        variant="body1"
        style={{ fontFamily: 'Inter Regular, sans-serif', color: '#828282' }} // Aplicando a nova fonte
      >
        {"Adicione, edite e exclua suas campanhas."}
      </Typography>
      {/* <MainContainer> */}
        <ConfirmationModal
          title={
            deletingCampaign &&
            `${i18n.t("campaigns.confirmationModal.deleteTitle")} ${
              deletingCampaign.name
            }?`
          }
          open={confirmModalOpen}
          onClose={setConfirmModalOpen}
          onConfirm={() => handleDeleteCampaign(deletingCampaign.id)}
        >
          {i18n.t("campaigns.confirmationModal.deleteMessage")}
        </ConfirmationModal>
        <CampaignModal
          resetPagination={() => {
            setPageNumber(1);
            fetchCampaigns();
          }}
          open={campaignModalOpen}
          onClose={handleCloseCampaignModal}
          aria-labelledby="form-dialog-title"
          campaignId={selectedCampaign && selectedCampaign.id}
        />
        {/* <MainHeader> */}
        <div style={{display: "inline-flex", alignItems: 'center', width: "95%",}}> 

                <div className={classes.serachInputWrapper}>
                  <SearchIcon className={classes.searchIcon} />
                  <InputBase
                    className={classes.searchInput}
                    placeholder={i18n.t("campaigns.searchPlaceholder")}
                    type="search"
                    value={searchParam}
                    onChange={handleSearch}
                  />
                </div>

                <div
                style={{ width: "1px", height: "43px", background: "#BDBDBD", marginLeft: "50px", marginRight: "50px" }}
              ></div>

                <MainHeaderButtonsWrapper style={{}}>

                  <Button
                    className={classes.Botoes}
                    variant="contained"
                    onClick={handleOpenCampaignModal}
                    color="primary"
                    fullWidth
                  >
                    {i18n.t("campaigns.buttons.add")}
                  </Button>

                </MainHeaderButtonsWrapper>
          </div>
        {/* </MainHeader> */}
        <Paper
          className={classes.mainPaper}
          onScroll={handleScroll}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell align="center" className={classes.Tabela}>
                  <b>{i18n.t("campaigns.table.name")}</b>
                </TableCell>
                <TableCell align="center" className={classes.Tabela}>
                  <b>{i18n.t("campaigns.table.status")}</b>
                </TableCell>
                <TableCell align="center" className={classes.Tabela}>
                  <b>{i18n.t("campaigns.table.contactList")}</b>
                </TableCell>
                <TableCell align="center" className={classes.Tabela}>
                  <b>{i18n.t("campaigns.table.whatsapp")}</b>
                </TableCell>
                <TableCell align="center" className={classes.Tabela}>
                  <b>{i18n.t("campaigns.table.scheduledAt")}</b>
                </TableCell>
                <TableCell align="center" className={classes.Tabela}>
                  <b>{i18n.t("campaigns.table.completedAt")}</b>
                </TableCell>
                <TableCell align="center" className={classes.Tabela}>
                  <b>{i18n.t("campaigns.table.confirmation")}</b>
                </TableCell>
                <TableCell align="center" className={classes.Tabela}>
                  <b>{i18n.t("campaigns.table.actions")}</b>
                </TableCell>
              </TableRow>
            </TableHead>
            {campaigns.length > 0 ? (
              <>
            <TableBody>
              <>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell align="center">{campaign.name}</TableCell>
                    <TableCell align="center">
                      {formatStatus(campaign.status)}
                    </TableCell>
                    <TableCell align="center">
                      {campaign.contactListId
                        ? campaign.contactList.name
                        : "Não definida"}
                    </TableCell>
                    <TableCell align="center">
                      {campaign.whatsappId
                        ? campaign.whatsapp.name
                        : "Não definido"}
                    </TableCell>
                    <TableCell align="center">
                      {campaign.scheduledAt
                        ? datetimeToClient(campaign.scheduledAt)
                        : "Sem agendamento"}
                    </TableCell>
                    <TableCell align="center">
                      {campaign.completedAt
                        ? datetimeToClient(campaign.completedAt)
                        : "Não concluída"}
                    </TableCell>
                    <TableCell align="center">
                      {campaign.confirmation ? "Habilitada" : "Desabilitada"}
                    </TableCell>
                    <TableCell align="center">
                      {campaign.status === "EM_ANDAMENTO" && (
                        <IconButton
                          className={classes.acoesButtons}
                          onClick={() => cancelCampaign(campaign)}
                          title="Parar Campanha"
                        >
                          <PauseCircleOutlineIcon />
                        </IconButton>
                      )}
                      {campaign.status === "CANCELADA" && (
                        <IconButton
                          className={classes.acoesButtons}
                          onClick={() => restartCampaign(campaign)}
                          title="Parar Campanha"
                        >
                          <PlayCircleOutlineIcon />
                        </IconButton>
                      )}
                      <IconButton
                        className={classes.acoesButtons}
                        onClick={() =>
                          history.push(`/campaign/${campaign.id}/report`)
                        }
                      >
                        <DescriptionIcon />
                      </IconButton>
                      <IconButton
                        className={classes.acoesButtons}
                        onClick={() => handleEditCampaign(campaign)}
                      >
                        <EditIcon />
                      </IconButton>

                      <IconButton
                        className={classes.acoesButtons}
                        onClick={(e) => {
                          setConfirmModalOpen(true);
                          setDeletingCampaign(campaign);
                        }}
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {loading && <TableRowSkeleton columns={8} />}
              </>
            </TableBody>
            </>
            ) : (
              <TableBody>
                <TableRow>
                  <TableCell colSpan="8" align="center">
                    Nenhuma campanha a ser carregada no momento
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

export default Campaigns;
