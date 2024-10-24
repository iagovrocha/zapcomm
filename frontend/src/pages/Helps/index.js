import React, { useState, useEffect, useCallback } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import InputBase from "@material-ui/core/InputBase";
import SearchIcon from "@material-ui/icons/Search";
import MainContainer from "../../components/MainContainer";

const useStyles = makeStyles((theme) => ({
  divBody: {
    flex: '1',
    padding: theme.spacing(1),
    height: 'calc(100% - 98px)',
  },
  titleContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start', // Alinha os itens à esquerda
    margin: 0, // Remove margens
  },
  searchInput: {
    border: "solid 1px #828282",
    display: "flex",
    borderRadius: 80,
    padding: 4,
    marginRight: theme.spacing(1),
    width: '70%',
    height: '48px',
    marginBottom: '10px'
  },
  input: {
    flex: 1,
  },
  table: {
    minWidth: 650,
    
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
  const [search, setSearch] = useState(''); // Estado para o filtro de busca
  const [selectedContent, setSelectedContent] = useState(null); // Estado para o vídeo selecionado

  // Simulação de dados dos vídeos
  useEffect(() => {
    async function fetchData() {
      const helps = [
        //id para video do youtube é o identificador unico apos o "v="
        //id para documentos do Google Docs é o identificador unico entre o "/d/" e o "/edit"
        { id: "id do video", title: "Tutorial 1", description: "Descrição do primeiro tutorial." },
        { id: "id do video", title: "Tutorial 2", description: "Descrição do segundo tutorial." },
        { id: "id do documento", type: "doc", title: "Tutorial 3", description: "Descrição do terceiro tutorial." },
        { id: "id do documento", type: "doc", title: "Tutorial 4", description: "Descrição do quarto tutorial." },
      ];
      setRecords(helps);
    }
    fetchData();
  }, []);

  const openContentModal = (Content) => {
    setSelectedContent(Content);
  };

  const closeContentModal = () => {
    setSelectedContent(null);
  };

  // Função para as mudanças que acontecem na barra de busca
  const handleSearchChange = (event) => {
    setSearch(event.target.value); //Atualiza o resultado da busca com o valor do input
  };

  // Filtra os registros com base no termo de busca
  const filteredRecords = records.filter(record =>
    record.title.toLowerCase().includes(search.toLowerCase()) //Verifica se o título contém o termo de busca
  );

  // aqui renderiza o modal do conteudo
  const renderContentModal = () => {
    return (
      <Modal
        open={Boolean(selectedContent)} // Verifica se há conteúdo selecionado
        onClose={closeContentModal} // Fecha o modal ao clicar fora
        className={classes.videoModal} // Aplica estilos ao modal

      >
        {/*Conteudo dentro do modal*/}
        <div className={classes.videoModalContent}>
          {selectedContent && (
            <iframe
              style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
              src={`https://www.youtube.com/embed/${selectedContent.id}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen  //permite tela cheia
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
  // renderiza o resto
  return (
    <div className={classes.divBody}>
      <div className={classes.titleContainer}> {/* Título e descrição */}
        <h1 style={{ margin: '0' }}>Ajuda</h1>
        <Typography
          component="subtitle1"
          variant="body1"
          style={{ fontFamily: 'Inter Regular, sans-serif', color: '#828282' }}
        >
          {'Assista aos tutoriais sobre como usar as ferramentas do Zapcomm'}
        </Typography>
      </div>

      <MainContainer> {/*Conteudo principal, contém tudo*/}
        <div className={classes.searchInput}>
          <SearchIcon style={{ color: "grey", marginLeft: 6, marginRight: 6 , alignSelf: 'center'}} />
          <InputBase
            className={classes.input}
            placeholder="Pesquisar ajuda"
            value={search} // Valor do input
            onChange={handleSearchChange} // Função chamada ao mudar o valor do input
          />
        </div>

        <Paper>
          <Table className={classes.table} aria-label="Ajuda">
            <TableHead>
              <TableRow>
                <TableCell>Tutorial</TableCell>
                <TableCell align="left">Descrição</TableCell>
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
                filteredRecords.map((record, key) => ( //Mapeia os conteudos
                  <TableRow key={key} onClick={() => openContentModal(record)} style={{ cursor: 'pointer', color: '#3f51b5', textDecoration: 'underline' }}>
                    <TableCell component="th" scope="row">
                      {record.title}
                    </TableCell>
                    <TableCell align="left">{record.description}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Paper>

        {renderContentModal()} {/* Renderiza o modal se houver conteúdo selecionado */}
      </MainContainer>
    </div>
  );
};

export default Helps;
