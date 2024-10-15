import React, { useContext, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import SearchIcon from "@material-ui/icons/Search";
import InputBase from "@material-ui/core/InputBase";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Badge from "@material-ui/core/Badge";
import MoveToInboxIcon from "@material-ui/icons/MoveToInbox";
import CheckBoxIcon from "@material-ui/icons/CheckBox";

import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";

import NewTicketModal from "../NewTicketModal";
import TicketsList from "../TicketsListCustom";
import TabPanel from "../TabPanel";

import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../Can";
import TicketsQueueSelect from "../TicketsQueueSelect";
import { Button, colors } from "@material-ui/core";
import { TagsFilter } from "../TagsFilter";
import { UsersFilter } from "../UsersFilter";

import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles(theme => ({
	ticketsWrapper: {
		position: "relative",
		display: "flex",
		height: "100%",
		flexDirection: "column",
		overflow: "hidden",
		borderTopRightRadius: 0,
		borderBottomRightRadius: 0,
		borderRadius:0,
	},

	tabsHeader: {
		flex: "none",
		backgroundColor: theme.palette.tabHeaderBackground,
	},

	tabsInternal: {
		flex: "none",
		backgroundColor: theme.palette.tabHeaderBackground
	},

	settingsIcon: {
		alignSelf: "center",
		marginLeft: "auto",
		padding: 8,
	},

	tab: {
		minWidth: 200, //120
		width: 200,    //120
	},

	internalTab: {
		minWidth: 120,
		width: 120,
		padding: 5
	},

	ticketOptionsBox: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		background: theme.palette.optionsBackground,
		padding: theme.spacing(1),
	},

	ticketSearchLine: {
		padding: theme.spacing(1),
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

	insiderTabPanel: {
		height: '100%',
		marginTop: "-72px",
		paddingTop: "72px"
	},

	insiderDoubleTabPanel: {
		display:"flex",
		flexDirection: "column",
		marginTop: "-72px",
		paddingTop: "72px",
		height: "100%"
	},

	labelContainer: {
		width: "auto",
		padding: 0
	},
	iconLabelWrapper: {
		flexDirection: "row",
		'& > *:first-child': {
			marginBottom: '3px !important',
			marginRight: 16
		}
	},
	insiderTabLabel: {
		[theme.breakpoints.down(1600)]: {
			display:'none'
		}
	},
	smallFormControl: {
		'& .MuiOutlinedInput-input': {
			padding: "12px 10px",
		},
		'& .MuiInputLabel-outlined': {
			marginTop: "-6px"
		}
	},
  AgrupamentoDoPesquisarENovo: {
    paddingTop: "10px",
    paddingBottom: "12px",
    display: "inline-flex",
    width: "70%"
  },
  BotaoAdicionar: {
    borderRadius: "40px",
    padding: "10px 32px",
    justifyContent: "center",
    alignItems: "center",
    border: "1px solid var(--logo-bg, #001C27)"
  },
  MenuAbaixoPesquisar: {
    boxSizing: "border-box",
    width: "70%",
    display: "inline-flex",
    justifyContent: "space-between",
    //gap: "30%",
  },
  AguardoEResolvido: {
		minWidth: "200", //120
		width: "200",    //120
    borderRadius: "20px",
    border: "2px solid",
    background: "rgba(217, 217, 217, 0.00)",
    flexShrink: "0",

    transition: "border-color 0.3s, background-color 0.3s",
    height: "32px !important",  // Força a altura de 32px
    minHeight: "32px !important", // Força a altura mínima
    maxHeight: "32px !important", // Força a altura máxima

    "&.Mui-selected": {
      borderColor: "#0C2C54", // Cor da borda quando o tab está ativo
    },
    "&:not(.Mui-selected)": {
      borderColor: "gray", // Cor da borda quando o tab está inativo
    },
	},
  AguardoEResolvidoGray: {
    borderColor: "gray !important", // Cor da borda cinza quando a aba "CHAMADOS RESOLVIDOS" é clicada
  },
}));

const TicketsManagerTabs = () => {
  const classes = useStyles();
  const history = useHistory();

  const [searchParam, setSearchParam] = useState("");
  const [tab, setTab] = useState("open");
  const [tabOpen, setTabOpen] = useState("open");
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [showAllTickets, setShowAllTickets] = useState(false);
  const searchInputRef = useRef();
  const { user } = useContext(AuthContext);
  const { profile } = user;

  const [openCount, setOpenCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  const userQueueIds = user.queues.map((q) => q.id);
  const [selectedQueueIds, setSelectedQueueIds] = useState(userQueueIds || []);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    if (user.profile.toUpperCase() === "ADMIN") {
      setShowAllTickets(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (tab === "search") {
      searchInputRef.current.focus();
    }
  }, [tab]);

  let searchTimeout;

  const handleSearch = (e) => {
    const searchedTerm = e.target.value.toLowerCase();

    clearTimeout(searchTimeout);

    if (searchedTerm === "") {
      setSearchParam(searchedTerm);
      setTab("open");
      return;
    } else if (searchedTerm !== "") {
      setTab("search");
      
    }

    searchTimeout = setTimeout(() => {
      setSearchParam(searchedTerm);
    }, 500);
  };

  const handleChangeTab = (e, newValue) => {
    setTab(newValue);
  };

  const handleChangeTabOpen = (e, newValue) => {
    setTabOpen(newValue);
  };

  const applyPanelStyle = (status) => {
    if (tabOpen !== status) {
      return { width: 0, height: 0 };
    }
  };

  const handleCloseOrOpenTicket = (ticket) => {
    setNewTicketModalOpen(false);
    if (ticket !== undefined && ticket.uuid !== undefined) {
      history.push(`/tickets/${ticket.uuid}`);
    }
  };

  const handleSelectedTags = (selecteds) => {
    const tags = selecteds.map((t) => t.id);
    setSelectedTags(tags);
  };

  const handleSelectedUsers = (selecteds) => {
    const users = selecteds.map((t) => t.id);
    setSelectedUsers(users);
  };

  return (
    <div style={{backgroundColor: "#FFFFFF"}}>
      <h1 style={{ margin: "0" }}><b>Chamados</b></h1>
      <Typography
        component="subtitle1"
        variant="body1"
        style={{ fontFamily: 'Inter Regular, sans-serif', color: '#828282' }} // Aplicando a nova fonte
      >
        {"Analise seus chamados com base nas categorias: aberto atendendo, aberto aguardando e resolvido."}
      </Typography>
      <div className={classes.AgrupamentoDoPesquisarENovo}>
        <div className={classes.serachInputWrapper}>
          <SearchIcon className={classes.searchIcon} />
          <InputBase
            className={classes.searchInput}
            //style={{width: "50%", paddingRight: "10px"}}
            inputRef={searchInputRef}
            placeholder={i18n.t("Buscar chamado")}
            type="search"
            onChange={handleSearch}
          />
        </div>
        <div
          style={{ width: "1px", height: "43px", background: "#BDBDBD", marginLeft: "50px", marginRight: "50px" }}
        >
        </div>
        <Button
          variant="outlined"
          color="primary"
          className={classes.BotaoAdicionar}
          onClick={() => setNewTicketModalOpen(true)}
        >
          {i18n.t("+ Novo")}
        </Button>
      </div>
      <div className={classes.MenuAbaixoPesquisar}>
        <div>
        <Tabs
          indicatorColor= "rgba(0, 0, 0, 0.00)"
          value={tab}
          onChange={handleChangeTab}
          >
          <Tab
            value={"open"}
            label={<b>{i18n.t("Chamados Abertos")}</b>}
            classes={{ root: classes.tab }}
            />
          <div
            style={{ width: "1px", height: "43px", background: "#BDBDBD", marginLeft: "50px", marginRight: "50px" }}
          >
          </div>
          <Tab
            value={"closed"}
            label={<b>{i18n.t("Chamados Resolvidos")}</b>}
            classes={{ root: classes.tab }}
            />
        </Tabs>
        </div>
        
        <div style={{ display: "inline-flex", gap: "1.25rem", marginRight: "1rem"}}>
          <TicketsQueueSelect
            style={{ marginLeft: 6, }} //border: "1px solid rgba(0, 0, 0, 0.30)", borderRadius: "10px", with: "150px", height: "40px" }}
            selectedQueueIds={selectedQueueIds}
            userQueues={user?.queues}
            onChange={(values) => setSelectedQueueIds(values)}
          />
          <Can
            role={user.profile}
            //style={{marginLeft: "250px"}}
            perform="tickets-manager:showall"
            yes={() => (
              <FormControlLabel
                label={i18n.t("tickets.buttons.showAll")}
                labelPlacement="start"
                control={
                  <Switch
                    size="normal"
                    checked={showAllTickets}
                    onChange={() =>
                      setShowAllTickets((prevState) => !prevState)
                    }
                    name="showAllTickets"
                    color="primary"
                  />
                }
              />
            )}
          />
        </div>
      </div>
      <Tabs
          style={{marginTop: "5px"}}
          value={tabOpen}
          onChange={handleChangeTabOpen}
          indicatorColor= "rgba(0, 0, 0, 0.00)"
          textColor="primary"
      >
        <Tab
          className={`${classes.AguardoEResolvido} ${tab === "closed" ? classes.AguardoEResolvidoGray : ""}`}
          label={
            <Badge
              badgeContent={openCount}
              color="primary"
              >
              {i18n.t("ticketsList.assignedHeader")}
            </Badge>
            }
            value={"open"}
            disabled={tab === "closed"}
          />
          <div style={{marginRight: "10px"}}></div>
        <Tab
          className={`${classes.AguardoEResolvido} ${tab === "closed" ? classes.AguardoEResolvidoGray : ""}`}
          label={
            <Badge
              badgeContent={pendingCount}
              color="secondary"
            >
              {i18n.t("ticketsList.pendingHeader")}
            </Badge>
            }
            value={"pending"}
            disabled={tab === "closed"}
        />
        {/* Area ATENDENDO E AGUARDANDO */}
        </Tabs>
        <TabPanel value={tab} name="open" className={classes.ticketsWrapper}>
        <Paper className={classes.ticketsWrapper}>
          {/* ATENDENDO */}
          <TicketsList
            status="open"
            showAll={showAllTickets}
            selectedQueueIds={selectedQueueIds}
            updateCount={(val) => setOpenCount(val)}
            style={applyPanelStyle("open")}
          />
          {/* AGUARDANDO */}
          <TicketsList
            status="pending"
            selectedQueueIds={selectedQueueIds}
            updateCount={(val) => setPendingCount(val)}
            style={applyPanelStyle("pending")}
          />
        </Paper>
        </TabPanel>
        <TabPanel value={tab} name="closed" className={classes.ticketsWrapper}>
        <TicketsList
          status="closed"
          showAll={true}
          selectedQueueIds={selectedQueueIds}
        />
        </TabPanel>
        <TabPanel value={tab} name="search" className={classes.ticketsWrapper}>
        {/* <TagsFilter onFiltered={handleSelectedTags} />
        {profile === "admin" && (
          <UsersFilter onFiltered={handleSelectedUsers} />
        )} */}
        <TicketsList
          searchParam={searchParam}
          showAll={true}
          tags={selectedTags}
          users={selectedUsers}
          selectedQueueIds={selectedQueueIds}
        />
      </TabPanel>
      {/* -- ANTIGO SITE -- */}
    {/* <Paper elevation={0} variant="outlined" className={classes.ticketsWrapper}>
      <NewTicketModal
        modalOpen={newTicketModalOpen}
        onClose={(ticket) => {
          
          handleCloseOrOpenTicket(ticket);
        }}
      />
      <Paper elevation={0} square className={classes.tabsHeader}>
        <Tabs
          value={tab}
          onChange={handleChangeTab}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          aria-label="icon label tabs example"
        >
          <Tab
            value={"open"}
            icon={<MoveToInboxIcon />}
            label={i18n.t("tickets.tabs.open.title")}
            classes={{ root: classes.tab }}
          />
          <Tab
            value={"closed"}
            icon={<CheckBoxIcon />}
            label={i18n.t("tickets.tabs.closed.title")}
            classes={{ root: classes.tab }}
          />
          <Tab
            value={"search"}
            icon={<SearchIcon />}
            label={i18n.t("tickets.tabs.search.title")}
            classes={{ root: classes.tab }}
          />
        </Tabs>
      </Paper>
      <Paper square elevation={0} className={classes.ticketOptionsBox}>
        {tab === "search" ? (
          <div className={classes.serachInputWrapper}>
            <SearchIcon className={classes.searchIcon} />
            <InputBase
              className={classes.searchInput}
              inputRef={searchInputRef}
              placeholder={i18n.t("tickets.search.placeholder")}
              type="search"
              onChange={handleSearch}
            />
          </div>
        ) : (
          <>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setNewTicketModalOpen(true)}
            >
              {i18n.t("ticketsManager.buttons.newTicket")}
            </Button>
            <Can
              role={user.profile}
              perform="tickets-manager:showall"
              yes={() => (
                <FormControlLabel
                  label={i18n.t("tickets.buttons.showAll")}
                  labelPlacement="start"
                  control={
                    <Switch
                      size="small"
                      checked={showAllTickets}
                      onChange={() =>
                        setShowAllTickets((prevState) => !prevState)
                      }
                      name="showAllTickets"
                      color="primary"
                    />
                  }
                />
              )}
            />
          </>
        )}
        <TicketsQueueSelect
          style={{ marginLeft: 6 }}
          selectedQueueIds={selectedQueueIds}
          userQueues={user?.queues}
          onChange={(values) => setSelectedQueueIds(values)}
        />
      </Paper>
      {/* BOTÃO ATENDENDO E AGUARDANDO *
      <TabPanel value={tab} name="open" className={classes.ticketsWrapper}>
        <Tabs
          value={tabOpen}
          onChange={handleChangeTabOpen}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab
            label={
              <Badge
                className={classes.badge}
                badgeContent={openCount}
                color="primary"
              >
                {i18n.t("ticketsList.assignedHeader")}
              </Badge>
            }
            value={"open"}
          />
          <Tab
            label={
              <Badge
                className={classes.badge}
                badgeContent={pendingCount}
                color="secondary"
              >
                {i18n.t("ticketsList.pendingHeader")}
              </Badge>
            }
            value={"pending"}
          />
        </Tabs>
        {/* ÁREA DE APARECER CHAMADOS ABERTOS (ATENDENDO E AGUARDANDO)
        <Paper className={classes.ticketsWrapper}>
          <TicketsList
            status="open"
            showAll={showAllTickets}
            selectedQueueIds={selectedQueueIds}
            updateCount={(val) => setOpenCount(val)}
            style={applyPanelStyle("open")}
          />
          <TicketsList
            status="pending"
            selectedQueueIds={selectedQueueIds}
            updateCount={(val) => setPendingCount(val)}
            style={applyPanelStyle("pending")}
          />
        </Paper>
      </TabPanel>
      {/* AREA DE CHAMADOS RESOLVIDOS 
      <TabPanel value={tab} name="closed" className={classes.ticketsWrapper}>
        <TicketsList
          status="closed"
          showAll={true}
          selectedQueueIds={selectedQueueIds}
        />
      </TabPanel>
      {/* AREA DE PESQUISA *
      <TabPanel value={tab} name="search" className={classes.ticketsWrapper}>
        <TagsFilter onFiltered={handleSelectedTags} />
        {profile === "admin" && (
          <UsersFilter onFiltered={handleSelectedUsers} />
        )}
        <TicketsList
          searchParam={searchParam}
          showAll={true}
          tags={selectedTags}
          users={selectedUsers}
          selectedQueueIds={selectedQueueIds}
        />
      </TabPanel>
    </Paper> */}
    </div>
  );
};

export default TicketsManagerTabs;
