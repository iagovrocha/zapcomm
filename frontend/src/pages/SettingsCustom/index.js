import React, { useState, useEffect } from "react";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import { makeStyles, Paper, Tabs, Tab } from "@material-ui/core";

import TabPanel from "../../components/TabPanel";

import SchedulesForm from "../../components/SchedulesForm";
import CompaniesManager from "../../components/CompaniesManager";
import PlansManager from "../../components/PlansManager";
import HelpsManager from "../../components/HelpsManager";
import Options from "../../components/Settings/Options";

import { i18n } from "../../translate/i18n.js";
import { toast } from "react-toastify";

import useCompanies from "../../hooks/useCompanies";
import useAuth from "../../hooks/useAuth.js";
import useSettings from "../../hooks/useSettings";
import Typography from "@material-ui/core/Typography";

import OnlyForSuperUser from "../../components/OnlyForSuperUser";

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.palette.background.paper,
  },
  mainPaper: {
    ...theme.scrollbarStyles,
    overflowY: "scroll",
    flex: 1,
  },
  tab: {
		minWidth: 120, //120
		width: 120,    //120
	},
  paper: {
    ...theme.scrollbarStyles,
    overflowY: "scroll",
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    width: "100%",
  },
  container: {
    width: "100%",
    maxHeight: "100%",
  },
  control: {
    padding: theme.spacing(1),
  },
  textfield: {
    width: "100%",
  },
  divBody: {
    flex: 1,
    padding: theme.spacing(1),
    height: `calc(100% - 48px)`,
    backgroundColor: "#FFFFFF",
  },
  MenuItens: {
    boxSizing: "border-box",
    width: "95%",
    display: "inline-flex",
    justifyContent: "space-between",
  },
}));

const SettingsCustom = () => {
  const classes = useStyles();
  const [tab, setTab] = useState("options");
  const [schedules, setSchedules] = useState([]);
  const [company, setCompany] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const [settings, setSettings] = useState({});
  const [schedulesEnabled, setSchedulesEnabled] = useState(false);

  const { getCurrentUserInfo } = useAuth();
  const { find, updateSchedules } = useCompanies();
  const { getAll: getAllSettings } = useSettings();

  useEffect(() => {
    async function findData() {
      setLoading(true);
      try {
        const companyId = localStorage.getItem("companyId");
        const company = await find(companyId);
        const settingList = await getAllSettings();
        setCompany(company);
        setSchedules(company.schedules);
        setSettings(settingList);

        if (Array.isArray(settingList)) {
          const scheduleType = settingList.find(
            (d) => d.key === "scheduleType"
          );
          if (scheduleType) {
            setSchedulesEnabled(scheduleType.value === "company");
          }
        }

        const user = await getCurrentUserInfo();
        setCurrentUser(user);
      } catch (e) {
        toast.error(e);
      }
      setLoading(false);
    }
    findData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTabChange = (event, newValue) => {
      async function findData() {
        setLoading(true);
        try {
          const companyId = localStorage.getItem("companyId");
          const company = await find(companyId);
          const settingList = await getAllSettings();
          setCompany(company);
          setSchedules(company.schedules);
          setSettings(settingList);
  
          if (Array.isArray(settingList)) {
            const scheduleType = settingList.find(
              (d) => d.key === "scheduleType"
            );
            if (scheduleType) {
              setSchedulesEnabled(scheduleType.value === "company");
            }
          }
  
          const user = await getCurrentUserInfo();
          setCurrentUser(user);
        } catch (e) {
          toast.error(e);
        }
        setLoading(false);
      }
      findData();
      // eslint-disable-next-line react-hooks/exhaustive-deps

    setTab(newValue);
  };

  const handleSubmitSchedules = async (data) => {
    setLoading(true);
    try {
      setSchedules(data);
      await updateSchedules({ id: company.id, schedules: data });
      toast.success("Horários atualizados com sucesso.");
    } catch (e) {
      toast.error(e);
    }
    setLoading(false);
  };

  const isSuper = () => {
    return currentUser.super;
  };

  return (
    <div className={classes.divBody}>
      <h1 style={{ margin: "0" }}><b>Configurações</b></h1>
      <Typography
        component="subtitle1"
        variant="body1"
        style={{ fontFamily: 'Inter Regular, sans-serif', color: '#828282'}}
      >
        {"Modifique as configurações gerais"}
      </Typography>
      <Paper className={classes.mainPaper} elevation={1}>
      <div className={classes.MenuIte}>
        <Tabs
          indicatorColor= "rgba(0, 0, 0, 0.00)"
          value={tab}
          onChange={handleTabChange}
          >
          <Tab
            value={"options"}
            label={<b>{i18n.t("Opções")}</b>}
            classes={{ root: classes.tab }}
            />

          <div
            style={{ width: "1px", height: "43px", background: "#BDBDBD", marginLeft: "5px", marginRight: "5px" }}
          >
          </div>

          <Tab
            value={"companies"}
            label={<b>{i18n.t("Empresas")}</b>}
            classes={{ root: classes.tab }}
            />

          <div
            style={{ width: "1px", height: "43px", background: "#BDBDBD", marginLeft: "5px", marginRight: "5px" }}
          >
          </div>

          <Tab
            value={"helps"}
            label={<b>{i18n.t("Ajuda")}</b>}
            classes={{ root: classes.tab }}
            />
        </Tabs>
      </div>

      {/* DAQUI PRA CIMA  */}
        {/* <Tabs
          value={tab}
          indicatorColor="primary"
          textColor="primary"
          scrollButtons="on"
          variant="scrollable"
          onChange={handleTabChange}
          className={classes.tab}
        >
          <Tab label="Opções" value={"options"} />
          {schedulesEnabled && <Tab label="Horários" value={"schedules"} />}
          {isSuper() ? <Tab label="Empresas" value={"companies"} /> : null}
          {isSuper() ? <Tab label="Planos" value={"plans"} /> : null}
          {isSuper() ? <Tab label="Ajuda" value={"helps"} /> : null}
        </Tabs> */}


        <Paper className={classes.paper} elevation={0}>
          <TabPanel
            className={classes.container}
            value={tab}
            name={"schedules"}
          >
            <SchedulesForm
              loading={loading}
              onSubmit={handleSubmitSchedules}
              initialValues={schedules}
            />
          </TabPanel>
          <OnlyForSuperUser
            user={currentUser}
            yes={() => (
              <TabPanel
                className={classes.container}
                value={tab}
                name={"companies"}
              >
                <CompaniesManager />
              </TabPanel>
            )}
          />
          <OnlyForSuperUser
            user={currentUser}
            yes={() => (
              <TabPanel
                className={classes.container}
                value={tab}
                name={"plans"}
              >
                <PlansManager />
              </TabPanel>
            )}
          />
          <OnlyForSuperUser
            user={currentUser}
            yes={() => (
              <TabPanel
                className={classes.container}
                value={tab}
                name={"helps"}
              >
                <HelpsManager />
              </TabPanel>
            )}
          />
          <TabPanel className={classes.container} value={tab} name={"options"}>
            <Options
              settings={settings}
              scheduleTypeChanged={(value) =>
                setSchedulesEnabled(value === "company")
              }
            />
          </TabPanel>
        </Paper>
      </Paper>
    {/* </MainContainer> */}
    </div>
  );
};

export default SettingsCustom;
