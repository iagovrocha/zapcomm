import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from '@material-ui/icons/Edit';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from "@material-ui/core/Typography";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import InputAdornment from '@material-ui/core/InputAdornment'; // Importar InputAdornment
import SearchIcon from '@material-ui/icons/Search'; // Importar o ícone de pesquisa
import InputBase from "@material-ui/core/InputBase";
import MainContainer from "../../components/MainContainer";
import TaskModal from '../../components/TaskModal';

const useStyles = makeStyles((theme) => ({

  // root: {
  //   display: 'flex',
  //   flexDirection: 'column',
  //  // margin: '2rem'
  // },
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
  serachInputWrapper: {
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
  searchIcon: {
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
  //taskText: { // Texto da tarefa
    //maxWidth: '300px',
    //overflow: 'hidden',
    //textOverflow: 'ellipsis',
  //},
  //dateText: { // Data de criação e atualização da tarefa
    //textAlign: 'center',
  //},

}));

const ToDoList = () => {
  const classes = useStyles();

  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);
  const [error, setError] = useState(''); // Estado para armazenar a mensagem de erro
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [initialTask, setInitialTask] = useState('');

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

  const handleTaskChange = (event) => {
    const inputValue = event.target.value;
    if (inputValue.length > 50) {
      setError('A tarefa não pode exceder 50 caracteres.');
      return;
    } else {
      setError(''); // Limpa o erro se estiver dentro do limite
    }
    setTask(inputValue);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleDeleteTask = (index) => {
    const newTasks = [...tasks];
    newTasks.splice(index, 1);
    setTasks(newTasks);
  };

  const openAddModal = () => {
    setInitialTask('');
    setEditIndex(-1);
    setModalOpen(true);
  };

  const openEditModal = (index) => {
    setInitialTask(tasks[index].text);
    setEditIndex(index);
    setModalOpen(true);
  };

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

  const filteredTasks = tasks.filter(task => 
    task.text.toLowerCase().includes(searchTerm.toLowerCase())
  );
  //const handleAddTask = () => {
    //if (!task.trim()) {
      // Impede que o usuário crie uma tarefa sem texto
      //return;
    //}

    //const now = new Date();
    //if (editIndex >= 0) {
      // Editar tarefa existente
      //const newTasks = [...tasks];
      //newTasks[editIndex] = { text: task, updatedAt: now, createdAt: newTasks[editIndex].createdAt };
      //setTasks(newTasks);
      //setTask('');
      //setEditIndex(-1);
    //} else {
      // Adicionar nova tarefa
      //setTasks([...tasks, { text: task, createdAt: now, updatedAt: now }]);
      //setTask('');
    //}
  //};

  //const handleEditTask = (index) => {
    //setTask(tasks[index].text);
    //setEditIndex(index);
  //};

  

  return (
    <div className={classes.divBody}>
      {/* <div className={classes.root}> */}
        <div className={classes.titleContainer}>
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

      {/* <MainContainer className={classes.mainContainer}> */}

        <div style={{display: "inline-flex", alignItems: 'center', width: "95%"}}> 
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
              //   InputProps={{
              //     startAdornment: (
              //       <InputAdornment position="start">
              //         <SearchIcon style={{ color: "gray" }} />
              //       </InputAdornment>
              //     ),
              //   style: {
              //       borderRadius: '40px',
              //   }
              // }}
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
          // variant="outlined"
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
              {filteredTasks.length === 0 ? ( // Verificar se não há tarefas
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    Nenhuma tarefa adicionada
                  </TableCell>
                </TableRow>
              ) : (
                filteredTasks.map((task, index) => (
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
        open={modalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        initialTask={initialTask}
      />
      {/* </MainContainer> */}
    </div>
  );
}

export default ToDoList;
