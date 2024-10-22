import React, { useState, useEffect, useCallback } from "react";
import { makeStyles, Modal, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from "@material-ui/core";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles(theme => ({
  table: {
    minWidth: 650,
  },
  clickableRow: {
    cursor: 'pointer',
    color: theme.palette.primary.main,
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  videoModal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoModalContent: {
    outline: 'none',
    width: '90%',
    maxWidth: 1024,
    aspectRatio: '16/9',
    position: 'relative',
    backgroundColor: 'white',
    borderRadius: theme.spacing(1),
    overflow: 'hidden',
  },
}));

const Helps = () => {
  const classes = useStyles();
  const [records, setRecords] = useState([]); // Estado para armazenar vídeos
  const [selectedContent, setSelectedContent] = useState(null); // Estado para o vídeo selecionado

  // Simulação de dados dos vídeos
  useEffect(() => {
    async function fetchData() {
      // Dados mockados de vídeos
      const helps = [
        { id: "9bZkp7q19f0", title: "Tutorial 2", description: "Este é o segundo tutorial." },
        { id: "EOBDZwfRBpI", title: "Tutorial 3", description: "Este é o terceiro tutorial." },
        { id: "dQw4w9WgXcQ", title: "Tutorial 1", description: "Este é o primeiro tutorial." },
        { id: "1TmqOyMlKLJb3RXxtKERxWdmdfFGHv3-aqgKybGhNo_k", type: "doc", title: "Documento 1", description: "Este é o primeiro documento." }, // Documento do Google Docs
        { id: "1nTbq39MgY2ZyR_k0a5L-vTkMmp6SgZaKQbPzDZ5cH8M", type: "doc", title: "Documento 2", description: "Este é o segundo documento." }, // Documento do Google Docs
      ];
      setRecords(helps); // Atualiza o estado com os vídeos simulados
    }
    fetchData();
  }, []);

  const openContentModal = (Content) => {
    setSelectedContent(Content);
  };

  const closeContentModal = () => {
    setSelectedContent(null);
  };

  const handleModalClose = useCallback((event) => {
    if (event.key === "Escape") {
      closeContentModal();
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleModalClose);
    return () => {
      document.removeEventListener("keydown", handleModalClose);
    };
  }, [handleModalClose]);

  const renderContentModal = () => {
    return (
      <Modal
        open={Boolean(selectedContent)}
        onClose={closeContentModal}
        className={classes.videoModal}
      >
        <div className={classes.videoModalContent}>
          {selectedContent && (
            <iframe
              style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
              src={`https://www.youtube.com/embed/${selectedContent.id}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
          {selectedContent && selectedContent.type === "doc" && (
            <iframe
              style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
              src={`https://docs.google.com/document/d/${selectedContent.id}/preview`}
              title="Google Doc"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          )}
        </div>
      </Modal>
    );
  };

  const renderHelpsTable = () => {
    return (  
      <div className={classes.divBody}>
        <TableContainer component={Paper}>
          <Table className={classes.table} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Tutorial</TableCell>
                <TableCell align="left">Descrição</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((record, key) => (
                <TableRow key={key} onClick={() => openContentModal(record)} className={classes.clickableRow}>
                  <TableCell component="th" scope="row">
                    {record.title}
                  </TableCell>
                  <TableCell align="left">{record.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    );
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>{i18n.t("ola")} ({records.length})</Title>
        <MainHeaderButtonsWrapper></MainHeaderButtonsWrapper>
      </MainHeader>
      {renderHelpsTable()}
      {renderVideoModal()}
    </MainContainer>
  );
};

export default Helps;
