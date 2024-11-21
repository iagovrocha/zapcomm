import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from '@material-ui/icons/Edit';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from "@material-ui/core/Typography";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import SearchIcon from '@material-ui/icons/Search'; // Importar o ícone de pesquisa
import InputBase from "@material-ui/core/InputBase";
import TaskModal from '../../components/TaskModal';

const useStyles = makeStyles((theme) => ({
  Tabela: {
    backgroundColor: "#FFFFFF",
    fontFamily: 'Inter Tight, sans-serif', 
    color: 'black'
  },

  divBody: {
    flex: '1',
    padding: theme.spacing(1),
    height: 'calc(100% - 98px)', 
    background: "#FFFFFF"
  },
  titleContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start', // Alinha os itens à esquerda
    marginBottom: '7px', // Espaçamento abaixo do contêiner
  },
  serachInputWrapper: { //Conjunto do input de pesquisa com o icone da lupa
    border: "solid 1px #828282",
		flex: 1,
		display: "flex",
		borderRadius: 40,
		padding: 4,
		marginRight: theme.spacing(1),
    		width: '70%',
    		height: '48px',
	},
  input: { // Área de inserir texto
		flex: 1,
		border: "none",
		borderRadius: 30,
  },
  searchIcon: { //icon da lupa
		color: "grey",
		marginLeft: 6,
		marginRight: 6,
		alignSelf: "center",
	},
  button: { // botão de adicionar ou salvar
    borderRadius: "40px",
    padding: "10px 32px",
    justifyContent: "center",
    alignItems: "center",
    border: "1px solid var(--logo-bg, #001C27)"
  },

  table: { // Tabela das tarefas que serão adicionadas
    minWidth: 650,
    marginTop: "7px",
  },
  tableHeader: { // Cabeçalho da tabela
    backgroundColor: '', // alterar a cor do fundo do cabeçalho dos resultados
    color: 'black',
  },
  acoesButtons: {
    color: "#0C2C54",
    "&:hover": {
      color: "#3c5676",
    },
    width: "35px", 
    height: "30px",
  },
}));

const ToDoList = () => {
  const classes = useStyles();

  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);
  const [error, setError] = useState(''); // Estado para armazenar a mensagem de erro
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false); //Estado de carregamento
  const [pageNumber, setPageNumber] = useState(1);
  const [searchTerm, setSearchTerm] = useState(''); //Termo de pesquisa
  const [modalOpen, setModalOpen] = useState(false); //Controla a abertura do modal
  const [initialTask, setInitialTask] = useState(''); //Armazena o valor inicial da tarefa no modal

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  //Função chamada quando o termo de pesquisa muda
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value); // Atualiza o estado do termo de pesquisa
  };

  //Função para excluir uma tarefa
  const handleDeleteTask = (index) => {
    const newTasks = [...tasks];
    newTasks.splice(index, 1);
    setTasks(newTasks);
  };

  //Função para abrir o modal de adição de tarefa
  const openAddModal = () => {
    setInitialTask('');
    setEditIndex(-1);
    setModalOpen(true);
  };

  //Função para abrir o modal de edição de tarefa
  const openEditModal = (index) => {
    setInitialTask(tasks[index].text);
    setEditIndex(index);
    setModalOpen(true);
  };

  //Função para fechar o modal
  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleModalSubmit = (task) => {
    if (editIndex >= 0) {
      const newTasks = [...tasks];
      newTasks[editIndex] = { text: task, updatedAt: new Date(), createdAt: newTasks[editIndex].createdAt };
      setTasks(newTasks);
    } else {
      setTasks([...tasks, { text: task, createdAt: new Date(), updatedAt: new Date() }]);
    }
    setModalOpen(false);
  };

  //Filtra as tarefas com base no termo de pesquisa
  const filteredTasks = tasks.filter(task => 
    task.text.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className={classes.divBody}> {/*Div com todos os elementos da página*/}   
        <div className={classes.titleContainer}> {/*Cabeçalho*/}
          <h1 style={{margin: '0'}}>Tarefas</h1> {/*Titulo tarefas*/}
          <Typography
            className={classes.info}
            component="subtitle1"
            variant="body1"
            style={{ fontFamily: 'Inter Regular, sans-serif', color: '#828282' }}
            >
              {'Adicione suas tarefas'}
          </Typography>
        </div>
        <div style={{display: "inline-flex", alignItems: 'center', width: "95%"}}> {/*Engloba o input de pesquisa e botão de adicionar*/} 
          <div className={classes.serachInputWrapper}>
            <SearchIcon className={classes.searchIcon} />
            <InputBase
              className={classes.input}
              placeholder="Pesquisar..."
              value={searchTerm}
              onChange={handleSearchChange}
              variant="outlined"
                error={!!error} // irá mostrar um erro se houver
                helperText={error} // Mostra a nebsagem de erro abaixo do campo 
            />
          </div>
          <div 
            style={{width: '1px', height: "43px", background: '#BDBDBD', marginLeft: '50px', marginRight: '50px'}}>
          </div>
          <Button className={classes.button} variant="contained" color="primary" onClick={openAddModal}>
            {"Adicionar Tarefa"}
          </Button>
        </div>
        <Paper 
          className={classes.mainPaper} 
          onScroll={handleScroll}>
          <Table className={classes.table} aria-label="Lista de Tarefas" size="small">
            <TableHead className={classes.tableHeader}>
              <TableRow>
                <TableCell><b>Tarefas</b></TableCell> {/* Nome da coluna de Tarefas */}
                <TableCell align="center"><b>Data</b></TableCell> {/* Nome da coluna de Data */}
                <TableCell align="right"><b>Ações</b></TableCell> {/* Nome da coluna de Ações */}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTasks.length === 0 ? ( //Verificar se não há tarefas
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    Nenhuma tarefa adicionada
                  </TableCell>
                </TableRow>
              ) : (
                filteredTasks.map((task, index) => ( //Mapeia a lista de tarefas filtradas
                  <TableRow key={index}>
                    <TableCell component="th" scope="row">
                      {task.text}
                    </TableCell>
                    <TableCell align="center">
                      {new Date(task.updatedAt).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Editar Tarefa">
                        <IconButton className={classes.acoesButtons} onClick={() => openEditModal(index)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir Tarefa">
                        <IconButton className={classes.acoesButtons} onClick={() => handleDeleteTask(index)}>
                        <DeleteOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Paper>
        <TaskModal
        open={modalOpen} //Controla a abertura do modal
        onClose={handleModalClose} //Fecha o modal
        onSubmit={handleModalSubmit} //Função para enviar o formulário do moda
        initialTask={initialTask} //Muda a tarefa inicial para edição
      />     
    </div>
  );
}

export default ToDoList;
