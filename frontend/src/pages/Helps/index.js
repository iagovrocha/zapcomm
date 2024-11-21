import React, { useState, useEffect, useCallback } from "react";
import { makeStyles } from "@material-ui/core";
import { Paper } from "@material-ui/core";
import { Typography } from "@material-ui/core";
import { Modal } from "@material-ui/core";
import { InputBase } from "@material-ui/core";
import { Table } from "@material-ui/core";
import { TableBody } from "@material-ui/core";
import { TableCell } from "@material-ui/core";
import { TableHead } from "@material-ui/core";
import { TableRow } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import useHelps from "../../hooks/useHelps";
import YouTubeIcon from '@material-ui/icons/YouTube';

const useStyles = makeStyles((theme) => ({
  divBody: {
    flex: '1',
    padding: theme.spacing(1),
    backgroundColor: "#FFFFFF",
  },
  titleContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: '7px',
  },
  searchInputWrapper: {
    border: "solid 1px #828282",
    display: "flex",
    borderRadius: 40,
    padding: 4,
    marginBottom: theme.spacing(1),
    width: '70%',
    height: '48px',
  },
  input: {
    flex: 1,
    border: "none",
    borderRadius: 30,
  },
  table: {
    minWidth: 650,
    backgroundColor: "#FFFFFF",
    fontFamily: 'Inter Tight, sans-serif',
    color: 'black'
  },
  helps: {
    textDecoration: 'none',
    transition: 'text-decoration-color 0.3s ease',
    "&:hover": {
      textDecoration: 'underline',  //sublinhado no hover
      textDecorationColor: 'blue',  //cor do sublinhado
      textDecorationThickness: '2px',  //espessura do sublinhado
      textDecorationStyle: 'solid',  //estilo do sublinhado
    }
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
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState(''); //Estado para armazenar o termo de busca
  const [selectedVideo, setSelectedVideo] = useState(null); 
  const { list } = useHelps();

  useEffect(() => {
    async function fetchData() {
      const helps = await list();
      setRecords(helps);
    }
    fetchData();
  }, [list]);

  const openVideoModal = (videoId) => {
    setSelectedVideo(videoId); // Passa o ID do vídeo selecionado
  };

  const closeVideoModal = () => {
    setSelectedVideo(null); // Fecha o modal
  };

  // Função para atualizar o valor do campo de busca
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

  const renderVideoModal = () => (
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

  const renderHelps = () => (
    <Paper className={classes.tableContainer}>
      <Table className={classes.table} aria-label="Ajuda" size="small"> {/*Tabela que contém os tutoriais*/}
        <TableHead className={classes.tableHeader}>
          <TableRow>
            <TableCell><b>Tutorial</b></TableCell>
            <TableCell align="left"><b>Descrição</b></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredRecords.length === 0 ? ( //Verificar se não há tutoriais
            <TableRow>
              <TableCell colSpan={2} align="center">
                <b>Não possui tutoriais</b>
              </TableCell>
            </TableRow>
          ) : (
            filteredRecords.map((record, index) => ( //Mapeia a lista de tutoriais filtrados
              <TableRow className={classes.helps}
              key={index} 
              onClick={() => openVideoModal(record.video)} 
              style={{ cursor: 'pointer' }}>
                <TableCell component="th" scope="row">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <YouTubeIcon style={{ color: 'red' }} /> {/*icone do youtube ao lado do nome do tutorial*/}
                    <Typography variant="body1">{record.title}</Typography> {/* Titulo do tutorial */}
                  </span>
                </TableCell>
                <TableCell align="left">{record.description}</TableCell> {/* Descrição do tutorial */}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Paper>

  );

  return (
    <div className={classes.divBody}> {/*Div com todos os elementos da página*/}
      <div className={classes.titleContainer}> {/*Cabeçalho*/}
        <h1 style={{ margin: '0' }}>Ajuda</h1>
        <Typography component="subtitle1" variant="body1" style={{ fontFamily: 'Inter Regular, sans-serif', color: '#828282' }}>
          {'Assista aos tutoriais sobre como usar as ferramentas do Zapcomm'}
        </Typography>
      </div>
      <div className={classes.searchInputWrapper}>{/*Engloba o input de pesquisa e botão de adicionar*/} 
        <SearchIcon style={{ color: "grey", marginLeft: 6, marginRight: 6, alignSelf: 'center' }} />
        <InputBase
          className={classes.input}
          placeholder="Pesquisar..."
          value={search}
          onChange={handleSearchChange} // Atualiza a busca
        />
      </div>

      {renderHelps()} {/* Renderiza a tabela de tutoriais */}
      {renderVideoModal()} {/* Renderiza o modal do vídeo */}
    </div>
  );
};

export default Helps;
