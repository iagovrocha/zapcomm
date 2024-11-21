import React, { useState, useEffect, useReducer, useContext, useCallback } from "react";
import { makeStyles } from "@material-ui/core/styles";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import Board from 'react-trello';
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";
import { useHistory } from 'react-router-dom';

import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#F4F4F4",
    overflowY: "-moz-hidden-unscrollable",
    padding: theme.spacing(1),
  },
  button: {
    background: "#0C2C54",
    border: "none",
    padding: "10px",
    color: "white",
    fontWeight: "bold",
    borderRadius: "10px",
  },
  divBody: {
    flex: 1,
    padding: theme.spacing(1),
    height: `calc(100% - 48px)`,
    backgroundColor: "#F4F4F4",
    width: "100%",
  },
}));

const Kanban = () => {
  const classes = useStyles();
  const history = useHistory();

  const [tags, setTags] = useState([]);
  const [reloadData, setReloadData] = useState(false);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);


  const fetchTags = async () => {
    try {
      const response = await api.get("/tags/kanban");
      const fetchedTags = response.data.lista || [];

      setTags(fetchedTags);

      // Fetch tickets after fetching tags
      await fetchTickets(jsonString);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const [file, setFile] = useState({
    lanes: []
  });


  const [tickets, setTickets] = useState([]);
  const { user } = useContext(AuthContext);
  const { profile, queues } = user;
  const jsonString = user.queues.map(queue => queue.UserQueue.queueId);

  const fetchTickets = async (jsonString) => {
    try {

      const { data } = await api.get("/ticket/kanban", {
        params: {
          queueIds: JSON.stringify(jsonString),
          teste: true
        }
      });
      setTickets(data.tickets);
    } catch (err) {
      console.log(err);
      setTickets([]);
    }
  };


  const popularCards = (jsonString) => {
    const filteredTickets = tickets.filter(ticket => ticket.tags.length === 0);
    const lanes = [
      {
        id: "lane0",
        tags: "aasa",
        colorBorder: "#0C2C54",
        title: i18n.t("Chamados em Aberto"),
        label: `${filteredTickets.length} Chamados`,
        cards: filteredTickets.map(ticket => ({
          id: ticket.id.toString(),
          label: "Ticket nº " + ticket.id.toString(),
          tags:
          {
            bgcolor: '#EB5A46',
            color: 'white',
            title: 'High'
          },
          description: (
            <div>
              <p>
                {ticket.contact.number}
                <br />
                {ticket.lastMessage}
              </p>
              <button
                className={classes.button}
                onClick={() => {
                  handleCardClick(ticket.uuid)
                }}>
                Ver Ticket
              </button>
            </div>
          ),
          style: { backgroundColor: "#FFFFFF", borderRadius: 20 },
          title: ticket.contact.name,
          draggable: true,
          href: "/tickets/" + ticket.uuid,
        })),
        style: {
          backgroundColor: "#F4F4F4",
        }
      },
      {
        id: "lane1",
        colorBorder: "#0C2C54",
        title: i18n.t("Chamados em Atendimento"),
        label: `${filteredTickets.length} Chamados`,
        cards: filteredTickets.map(ticket => ({
          id: ticket.id.toString(),
          label: "Ticket nº " + ticket.id.toString(),
          tags: "aaaaaa",
          description: (
            <div>
              <p>
                {ticket.contact.number}
                <br />
                {ticket.lastMessage}
              </p>
              <button
                className={classes.button}
                onClick={() => {
                  handleCardClick(ticket.uuid)
                }}>
                Ver Ticket
              </button>
            </div>
          ),
          style: { backgroundColor: "#FFFFFF", borderRadius: 20 },
          title: ticket.contact.name,
          draggable: true,
          href: "/tickets/" + ticket.uuid,
        })),
        style: {
          backgroundColor: "#F4F4F4",
        }
      },
      {
        id: "lane2",
        colorBorder: "#0C2C54",
        title: i18n.t("Chamados Impedidos"),
        label: `${filteredTickets.length} Chamados`,
        cards: filteredTickets.map(ticket => ({
          id: ticket.id.toString(),
          label: "Ticket nº " + ticket.id.toString(),
          description: (
            <div>
              <p>
                {ticket.contact.number}
                <br />
                {ticket.lastMessage}
              </p>
              <button
                className={classes.button}
                onClick={() => {
                  handleCardClick(ticket.uuid)
                }}>
                Ver Ticket
              </button>
            </div>
          ),
          style: { backgroundColor: "#FFFFFF", borderRadius: 20 },
          title: ticket.contact.name,
          draggable: true,
          href: "/tickets/" + ticket.uuid,
        })),
        style: {
          backgroundColor: "#F4F4F4",
        }
      },
      {
        id: "lane3",
        colorBorder: "#0C2C54",
        title: i18n.t("Chamados Finalizados"),
        label: `${filteredTickets.length} Chamados`,
        cards: filteredTickets.map(ticket => ({
          id: ticket.id.toString(),
          label: "Ticket nº " + ticket.id.toString(),
          description: (
            <div>
              <p>
                {ticket.contact.number}
                <br />
                {ticket.lastMessage}
              </p>
              <button
                className={classes.button}
                onClick={() => {
                  handleCardClick(ticket.uuid)
                }}>
                Ver Ticket
              </button>
            </div>
          ),
          style: { backgroundColor: "#FFFFFF", borderRadius: 20 },
          title: ticket.contact.name,
          draggable: true,
          href: "/tickets/" + ticket.uuid,
        })),
        style: {
          backgroundColor: "#F4F4F4",
        }
      },
      ...tags.map(tag => {
        const filteredTickets = tickets.filter(ticket => {
          const tagIds = ticket.tags.map(tag => tag.id);
          return tagIds.includes(tag.id);
        });

        return {
          id: tag.id.toString(),
          colorBorder: tag.color,
          title: tag.name,
          label: `${filteredTickets.length} Chamados`,
          cards: filteredTickets.map(ticket => ({
            id: ticket.id.toString(),
            label: "Ticket nº " + ticket.id.toString(),
            description: (
              <div style={{ flex: 1, maxWidth: "100%" }}>
                <p>
                  {ticket.contact.number}
                  <br />
                  {ticket.lastMessage}
                </p>
                <button
                  className={classes.button}
                  onClick={() => {

                    handleCardClick(ticket.uuid)
                  }}>
                  Ver Ticket
                </button>
              </div>
            ),
            style: { backgroundColor: "#FFFFFF", borderRadius: 20 },
            title: ticket.contact.name,
            draggable: true,
            href: "/tickets/" + ticket.uuid,
          })),
          style: {
            backgroundColor: "#F4F4F4",
          }
        };
      }),
    ];

    setFile({ lanes });
  };

  const handleCardClick = (uuid) => {
    //console.log("Clicked on card with UUID:", uuid);
    history.push('/tickets/' + uuid);
  };

  useEffect(() => {
    popularCards(jsonString);
  }, [tags, tickets, reloadData]);

  const handleCardMove = async (cardId, sourceLaneId, targetLaneId) => {
    try {

      await api.delete(`/ticket-tags/${targetLaneId}`);
      toast.success('Ticket Tag Removido!');
      await api.put(`/ticket-tags/${targetLaneId}/${sourceLaneId}`);
      toast.success('Ticket Tag Adicionado com Sucesso!');
      await fetchTickets(jsonString);
      popularCards(jsonString);

    } catch (err) {
      console.log(err);
    }
  };
  const CustomLaneHeader = ({ label, cards, title, current, target, colorBorder }) => {
    return (
      <div>
        <header
          style={{
            borderBottom: `4px solid ${colorBorder}`,
            paddingBottom: 6,
            marginBottom: 10,
            justifyContent: 'space-between',
          }}>
          <div style={{
            color: "#000000",
            fontFamily: "Inter Regular, sans-serif",
            fontSize: "20px",
            fontStyle: "normal",
            fontWeight: 600,
            lineHeight: "normal",
          }}>{title}</div>
          <div style={{
            color: "rgba(0, 0, 0, 0.50)",
            fontFamily: "Inter Regular, sans-serif",
            fontSize: "15px",
            fontStyle: "normal",
            fontWeight: 600,
            lineHeight: "normal",
          }}>{label}</div>
        </header>
      </div>
    )
  };

  const MyCard = ({ id, label, description, title, href }) => {
    return (
      <div style={{
        marginBottom: "6px",
        backgroundColor: "#FFFFFF",
        borderRadius: "20px",
        width: "280px",
        height: "auto",
        padding: "8px",
        minHeight: "96px",
        maxHeight: "auto",
        fontFamily: "Inter Regular, sans-serif",
        fontSize: "15px",
        fontStyle: "normal",
        fontWeight: 600,
        lineHeight: "normal",
      }}>
        <header style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          color: "#000000",
        }}>
          <div>
            {title}
          </div>
          <div style={{
            fontSize: "10px",
          }}>
            {label}
          </div>
        </header>
        {/* <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "4px",
          marginTop: "6px",
        }}>
          {tags.map((tag, index) => (
            <span key={index} style={{
              backgroundColor: tag.bgcolor,
              color: tag.color,
              borderRadius: "12px",
              padding: "2px 8px",
              fontSize: "10px",
              fontWeight: 500,
            }}>
              {tag.title}
            </span>
          ))}
        </div> */}

        <div style={{
          fontSize: "12px",
          wordBreak: "break-word",
          overflowWrap: "break-word",
          whiteSpace: "pre-wrap",
          color: "rgba(0, 0, 0, 0.50)",
        }}>
          {description}
        </div>
      </div>
    )
  };

  const CustomScrollableLane = () => {
    return (

      <div style={{
        flex: "1",
        overflowY: "auto",
        minWidth: "250px",
        overflowX: "hidden",
        alignSelf: "center",
        maxHeight: "90vh",
        marginTop: "10px",
        flexDirection: "column",
        justifyContent: "space-between",
      }}>
      </div>
    )
  };
  return (
    <div className={classes.divBody}>
      <h1 style={{ margin: "0" }}><b>Kanban</b></h1>
      <Typography
        component="subtitle1"
        variant="body1"
        style={{ fontFamily: 'Inter Regular, sans-serif', color: '#828282' }} // Aplicando a nova fonte
      >
        Organize seus chamados
      </Typography>
      <div>
        <div className={classes.root}>
          <Board
            data={file}
            onCardMoveAcrossLanes={handleCardMove}
            style={{ backgroundColor: '#F4F4F4' }}
            components={{
              LaneHeader: CustomLaneHeader,
              Card: MyCard,
            }}
          />
        </div>
      </div>
    </div>
  );
};


export default Kanban;
