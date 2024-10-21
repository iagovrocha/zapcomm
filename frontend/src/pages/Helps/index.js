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
  const [selectedVideo, setSelectedVideo] = useState(null); // Estado para o vídeo selecionado

  // Simulação de dados dos vídeos
  useEffect(() => {
    async function fetchData() {
      // Dados mockados de vídeos
      const helps = [
        { video: "dQw4w9WgXcQ", title: "Tutorial 1", description: "Este é o primeiro tutorial." },
        { video: "9bZkp7q19f0", title: "Tutorial 2", description: "Este é o segundo tutorial." },
      ];
      setRecords(helps); // Atualiza o estado com os vídeos simulados
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openVideoModal = (video) => {
    setSelectedVideo(video);
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
  };

  const handleModalClose = useCallback((event) => {
    if (event.key === "Escape") {
      closeVideoModal();
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleModalClose);
    return () => {
      document.removeEventListener("keydown", handleModalClose);
    };
  }, [handleModalClose]);

  const renderVideoModal = () => {
    return (
      <Modal
        open={Boolean(selectedVideo)}
        onClose={closeVideoModal}
        className={classes.videoModal}
      >
        <div className={classes.videoModalContent}>
          {selectedVideo && (
            <iframe
              style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
              src={`https://www.youtube.com/embed/${selectedVideo}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
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
                <TableRow key={key} onClick={() => openVideoModal(record.video)} className={classes.clickableRow}>
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
