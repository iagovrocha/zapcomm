import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
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

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
   // margin: '2rem'
  },
  divBody: {
    flex: '1',
    padding: theme.spacing(1),
    height: 'calc(100% - 98px)',
    overflow: 'hidden',  
    background: "#FFFFFF"
  },
  titleContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start', // Alinha os itens à esquerda
    marginBottom: '1rem', // Espaçamento abaixo do contêiner
  },
  inputContainer: {
    border: "solid 1px #828282",
		flex: 1,
		display: "flex",
		borderRadius: 40,
		padding: 4,
		marginRight: theme.spacing(1),
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
    borderRadius: '40px',
    border: '1px',
    height: '48px',
  },
  tableContainer: { // Tabela
    width: '100%',
    marginTop: '1rem',
  },
  table: { // Tabela das tarefas que serão adicionadas
    minWidth: 650,
  },
  tableHeader: { // Cabeçalho da tabela
    backgroundColor: '', // alterar a cor do fundo do cabeçalho dos resultados
    color: 'black',
  },
  editButton: { // Botão de editar
    fontSize: '0.8rem',
    marginRight: '3px', // Aproximação dos botôes de editar e deletar
    backgroundColor: '#0C2C54',
    color: 'white',
    borderRadius: '5px',
    marginTop: '10px',
  },
  deleteButton: {  // Botão de deletar
    fontSize: '0.8rem',
    backgroundColor: '#0C2C54',
    color: 'white',
    borderRadius: '5px',
    marginTop: '10px',
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

  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

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

  const handleAddTask = () => {
    if (!task.trim()) {
      // Impede que o usuário crie uma tarefa sem texto
      return;
    }

    const now = new Date();
    if (editIndex >= 0) {
      // Editar tarefa existente
      const newTasks = [...tasks];
      newTasks[editIndex] = { text: task, updatedAt: now, createdAt: newTasks[editIndex].createdAt };
      setTasks(newTasks);
      setTask('');
      setEditIndex(-1);
    } else {
      // Adicionar nova tarefa
      setTasks([...tasks, { text: task, createdAt: now, updatedAt: now }]);
      setTask('');
    }
  };

  const handleEditTask = (index) => {
    setTask(tasks[index].text);
    setEditIndex(index);
  };

  const handleDeleteTask = (index) => {
    const newTasks = [...tasks];
    newTasks.splice(index, 1);
    setTasks(newTasks);
  };

  return (
    <div className={classes.root}>
      <div className={classes.divBody}>
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

        <div style={{display: "inline-flex", width: "100%"}}> 
          <div className={classes.inputContainer}>
            <SearchIcon className={classes.searchIcon} />
            <InputBase
              className={classes.input}
              placeholder="Nova tarefa (Máx: 50 caracteres)"
              value={task}
              onChange={handleTaskChange}
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
          <Button className={classes.button} variant="contained" color="primary" onClick={handleAddTask}>
            {editIndex >= 0 ? 'Salvar' : 'Adicionar'}
          </Button>
        </div>
        <TableContainer component={Paper} className={classes.tableContainer}> {/* Tabela começa aqui */}
          <Table className={classes.table} aria-label="Lista de Tarefas">
          {tasks.length > 0 && ( // Só mostra o cabeçalho se houver tarefas
            <TableHead className={classes.tableHeader}>
              <TableRow>
                <TableCell><b>Tarefas</b></TableCell> {/* Nome da coluna de Tarefas */}
                <TableCell align="center"><b>Data</b></TableCell> {/* Nome da coluna de Data */}
                <TableCell align="right"><b>Editar</b></TableCell> {/* Nome da coluna de Ações */}
              </TableRow>
            </TableHead>
          )}
            <TableBody>
          {tasks.map((task, index) => (
                <TableRow key={index}>
                  <TableCell component="th" scope="row">
                    <Tooltip title={task.text} arrow>
                      <span className={classes.taskText}>{task.text}</span>
                    </Tooltip> {/* Nome da tarefa */}
                  </TableCell>
                  <TableCell align="center" className={classes.dateText}>
                    {task.updatedAt.toLocaleString()}
                  </TableCell> {/* Data de criação e atualização da tarefa */}
                  <TableCell align="right">
                    <IconButton onClick={() => handleEditTask(index)} className={classes.editButton}>
                  EDITAR
                    </IconButton> {/* Botão de editar */}
                    <IconButton onClick={() => handleDeleteTask(index)} className={classes.deleteButton}>
                  DELETAR
                    </IconButton> {/* Botão de deletar */}
                  </TableCell>
                </TableRow>
          ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
};

export default ToDoList;
