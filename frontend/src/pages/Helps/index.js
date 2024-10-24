import React, { useState, useEffect, useCallback } from "react";
import { makeStyles } from "@material-ui/core";
import { Paper } from "@material-ui/core";
import { Typography } from "@material-ui/core";
import { Modal } from "@material-ui/core";
import { InputBase } from "@material-ui/core";
import { Table } from "@material-ui/core";
import { TableBody } from "@material-ui/core";
import { TableCell } from "@material-ui/core";
import { TableContainer } from "@material-ui/core";
import { TableHead } from "@material-ui/core";
import { TableRow } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import { i18n } from "../../translate/i18n";
import useHelps from "../../hooks/useHelps";

const useStyles = makeStyles((theme) => ({
  mainPaperContainer: {
    overflowY: 'auto',
    maxHeight: 'calc(100vh - 200px)',
  },
  mainPaper: {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: theme.spacing(3),
    padding: theme.spacing(2),
    marginBottom: theme.spacing(3),
  },
  helpPaper: {
    position: 'relative',
    width: '100%',
    minHeight: '340px',
    padding: theme.spacing(2),
    boxShadow: theme.shadows[3],
    borderRadius: theme.spacing(1),
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    maxWidth: '340px',
  },
  paperHover: {
    transition: 'transform 0.3s, box-shadow 0.3s',
    '&:hover': {
      transform: 'scale(1.03)',
      boxShadow: `0 0 8px`,
      color: theme.palette.primary.main,
    },
  },
  videoThumbnail: {
    width: '100%',
    height: 'calc(100% - 56px)',
    objectFit: 'cover',
    borderRadius: `${theme.spacing(1)}px ${theme.spacing(1)}px 0 0`,
  },
  videoTitle: {
    marginTop: theme.spacing(1),
    flex: 1,
  },
  videoDescription: {
    maxHeight: '100px',
    overflow: 'hidden',
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
  divBody: {
    flex: '1',
    padding: theme.spacing(1),
    height: 'calc(100% - 98px)',
  },
  titleContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    margin: 0,
  },
  searchInput: {
    border: "solid 1px #828282",
    display: "flex",
    borderRadius: 80,
    padding: 4,
    marginRight: theme.spacing(1),
    width: '70%',
    height: '48px',
    marginBottom: '10px',
  },
  input: {
    flex: 1,
  },
  table: {
    minWidth: 650,
  },
}));

const Helps = () => {
  const classes = useStyles();
  const [records, setRecords] = useState([]); // Armazena os tutoriais
  const [search, setSearch] = useState(''); // Armazena o termo de busca
  const [selectedVideo, setSelectedVideo] = useState(null); // Agora usa selectedVideo
  const { list } = useHelps();

  useEffect(() => {
    async function fetchData() {
      const helps = await list(); // Chama a função list para buscar os tutoriais
      setRecords(helps); // Atualiza o estado com os tutoriais
    }
    fetchData();
  }, [list]);

  const openVideoModal = (videoId) => {
    setSelectedVideo(videoId); // Passa o ID do vídeo selecionado
  };

  const closeVideoModal = () => {
    setSelectedVideo(null); // Fecha o modal
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value); // Atualiza o termo de busca
  };

  const handleModalClose = useCallback((event) => {
    if (event.key === "Escape") {
      closeVideoModal(); // Fecha o modal se a tecla Escape for pressionada
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleModalClose);
    return () => {
      document.removeEventListener("keydown", handleModalClose);
    };
  }, [handleModalClose]);

  const filteredRecords = records.filter(record =>
    record.title.toLowerCase().includes(search.toLowerCase())
  );

  const renderVideoModal = () => {
    return (
      <Modal
        open={Boolean(selectedVideo)} // Verifica se há vídeo selecionado
        onClose={closeVideoModal} // Fecha o modal ao clicar fora
        className={classes.videoModal}
      >
        <div className={classes.videoModalContent}>
          {selectedVideo && (
            <iframe
              style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
              src={`https://www.youtube.com/embed/${selectedVideo}`} // Passa o ID do vídeo
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

  const renderHelps = () => {
    return (
      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="Ajuda">
          <TableHead>
            <TableRow>
              <TableCell>Tutorial</TableCell>
              <TableCell align="left">Descrição</TableCell> {/* Alterado para Link do Vídeo */}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} align="center">
                  Não possui tutoriais
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords.map((record, key) => (
                <TableRow key={key} onClick={() => openVideoModal(record.video)} style={{ cursor: 'pointer' }}>
                  <TableCell component="th" scope="row">
                    {record.title} {/* Título do tutorial */}
                  </TableCell>
                  <TableCell align="left">{record.description}</TableCell> {/* Descrição do tutorial */}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <div className={classes.divBody}>
      <div className={classes.titleContainer}>
        <h1 style={{ margin: '0' }}>Ajuda</h1>
        <Typography component="subtitle1" variant="body1" style={{ fontFamily: 'Inter Regular, sans-serif', color: '#828282' }}>
          {'Assista aos tutoriais sobre como usar as ferramentas do Zapcomm'}
        </Typography>
      </div>

      <MainContainer>
        <div className={classes.searchInput}>
          <SearchIcon style={{ color: "grey", marginLeft: 6, marginRight: 6, alignSelf: 'center' }} />
          <InputBase
            className={classes.input}
            placeholder="Pesquisar ajuda"
            value={search}
            onChange={handleSearchChange} // Atualiza a busca
          />
        </div>

        {renderHelps()} {/* Renderiza a tabela de tutoriais */}
        {renderVideoModal()} {/* Renderiza o modal do vídeo */}
      </MainContainer>
    </div>
  );
};

export default Helps;
