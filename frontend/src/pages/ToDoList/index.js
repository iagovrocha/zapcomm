import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import Grid from '@material-ui/core/Grid'; // Importando o Grid


const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '2rem'
  },
  inputContainer: {
    display: 'flex',
    width: '100%',
    marginBottom: '1rem',
  },
  input: { // Área de inserir texto
    flexGrow: 1,
    marginRight: '1rem',
    borderRadius: '40px', 
    border: '1px solid #000', // linha em volta do caixa de texto
  },
  button: { // botão de adicionar ou salvar
    borderRadius: '40px',
    border: '1px',
    
  },
  tableContainer: { // Tabela
    width: '100%',
    marginTop: '1rem',
  },
  table: { // Tabela das tarefas que serão adicionadas
    minWidth: 650,
  },
  tableHeader: { // Cabeçalho da tabela
  },
  editButton: { // Botão de editar
    fontSize: '0.8rem',
    borderRadius: '5px',
    marginRight: '-8px' //Aproximação dos botôes de editar e deletar
  },
  deleteButton: {  // Botão de deletar
    fontSize: '0.8rem',
  },

});

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
      <h2 className={classes.title}>Tarefas</h2> {/*Titulo tarefas*/}
      <p className={classes.info}>Adicione sua tarefa</p> {/*Informações do titulo*/}
      <div className={classes.inputContainer}>
        <TextField
          className={classes.input}
          label="Nova tarefa"
          value={task}
          onChange={handleTaskChange}
          variant="outlined"
            error={!!error} // irá mostrar um erro se houver
            helperText={error} // Mostra a nebsagem de erro abaixo do campo
            style: {
              border: 'none',
            }
          }}
        />
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
                <TableCell align="right"><b>Editar/Deletar</b></TableCell> {/* Nome da coluna de Ações */}
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
