import React, { useContext, useState } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Typography,
  Avatar,
  makeStyles,
  Grid,
} from "@material-ui/core";
import { useHistory, useParams } from "react-router-dom";
import { AuthContext } from "../../context/Auth/AuthContext";
import { useDate } from "../../hooks/useDate";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import ConfirmationModal from "../../components/ConfirmationModal";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    overflow: "hidden",
    flexDirection: "column",
    position: "relative",
    flex: 1,
    height: "calc(100% - 58px)",
    borderRadius: 10,
    backgroundColor: theme.palette.boxlist,
    paddingBottom: theme.spacing(2),
    display: "flex",
  },
  chatList: {
    position: "relative",
    flex: 1,
    overflowY: "auto",
    padding: theme.spacing(1),
  },
  chatCard: {
    margin: theme.spacing(1),
    cursor: "pointer",
    transition: "0.3s",
    borderRadius: 10,
    position: "relative",
    height: 150,
    display: 'flex',
    flexDirection: 'column',
  },
  cardContent: {
    flex: 1,
  },
  participants: {
    marginTop: theme.spacing(1),
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
  },
  profileAvatar: {
    position: "absolute",
    top: theme.spacing(1),
    right: theme.spacing(1),
    width: 30,
    height: 30,
  },
}));

export default function ChatList({
  chats,
  handleSelectChat,
  handleDeleteChat,
  handleEditChat,
}) {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const { datetimeToClient } = useDate();

  const [confirmationModal, setConfirmModalOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState({});
  const { id } = useParams();

  const goToMessages = async (chat) => {
    if (unreadMessages(chat) > 0) {
      try {
        await api.post(`/chats/${chat.id}/read`, { userId: user.id });
      } catch (err) {}
    }

    if (id !== chat.uuid) {
      history.push(`/chats/${chat.uuid}`);
      handleSelectChat(chat);
    }
  };

  const handleDelete = () => {
    handleDeleteChat(selectedChat);
  };

  const unreadMessages = (chat) => {
    const currentUser = chat.users.find((u) => u.userId === user.id);
    return currentUser ? currentUser.unreads : 0;
  };

  const getPrimaryText = (chat) => {
    const mainText = chat.title;
    const unreads = unreadMessages(chat);
    return (
      <>
        {mainText}
        {unreads > 0 && (
          <Chip
            size="small"
            style={{ marginLeft: 5 }}
            label={unreads}
            color="secondary"
          />
        )}
      </>
    );
  };

  const getSecondaryText = (chat) => {
    return chat.lastMessage !== ""
      ? `${datetimeToClient(chat.updatedAt)}: ${chat.lastMessage}`
      : "";
  };

  const getParticipantsAvatar = (chat) => {
    return chat.users.length > 0 ? (
      <Avatar
        alt="Participantes"
        src={chat.users[0].photoUrl} // Verifique se o URL da foto está correto
        className={classes.profileAvatar}
      />
    ) : null; // Retorne null se não houver usuários
  };

  const getParticipantsNames = (chat) => {
    return chat.users.map((user) => (
      <Typography key={user.userId} variant="body2">
        {user.name}
      </Typography>
    ));
  };

  return (
    <>
      <ConfirmationModal
        title={"Excluir Conversa"}
        open={confirmationModal}
        onClose={setConfirmModalOpen}
        onConfirm={handleDelete}
      >
        Esta ação não pode ser revertida, confirmar?
      </ConfirmationModal>
      <div className={classes.mainContainer}>
        <div className={classes.chatList}>
          <Grid container spacing={2}>
            {Array.isArray(chats) &&
              chats.length > 0 &&
              chats.map((chat, key) => (
                <Grid item xs={6} key={key}>
                  <Card
                    className={classes.chatCard}
                    onClick={() => goToMessages(chat)}
                  >
                    {getParticipantsAvatar(chat)}
                    <CardContent className={classes.cardContent}>
                      <Typography variant="h6">{getPrimaryText(chat)}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {getSecondaryText(chat)}
                      </Typography>
                      <div className={classes.participants}>
                        {getParticipantsNames(chat)}
                      </div>
                    </CardContent>
                    {chat.ownerId === user.id && (
                      <CardActions>
                        <IconButton 
                          onClick={() => {
                            goToMessages(chat).then(() => {
                              handleEditChat(chat);
                            });
                          }}
                          size="small"
                          style={{
                            color: "#0C2C54",
                            "&:hover": {
                              color: "#3c5676",
                            },
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => {
                            setSelectedChat(chat);
                            setConfirmModalOpen(true);
                          }}
                          size="small"
                          style={{
                            color: "#0C2C54",
                            "&:hover": {
                              color: "#3c5676",
                            },
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </CardActions>
                    )}
                  </Card>
                </Grid>
              ))}
          </Grid>
        </div>
      </div>
    </>
  );
}
