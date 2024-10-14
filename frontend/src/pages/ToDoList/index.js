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
    border: '1px solid #000' //linha em volta do caixa de texto
  },
  button: { //botão de adicionar ou salvar
    borderRadius: '40px',
    border: '1px',
    
  },
  listContainer: {
    width: '100%',
    height: '100%',
    marginTop: '1rem',
  },
  list: { //resultados
    marginBottom: '10px',
    border: '1px solid black',
    borderLeft: '1px #ffffff', //remove as barras laterais esquerdas
    borderRight: '1px #ffffff', // remove as barras laterais direitas
    borderBottom: '1px #ffffff', //remove as barras laterais inferiores
  },
  title: { //Titulo Tarefas
    fontSize: '1.5rem',
    textAlign: "left",
    width: '100%',
    marginBottom: '0rem'
  },
  info: { //Informações do titulo Tarefas
    textAlign: 'left',
    width: '100%',
    marginTop: '0,5rem' // Distancia entre o titulo e as informações
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
    setTask(event.target.value);
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
      newTasks[editIndex] = {text: task, updatedAt: now, createdAt: newTasks[editIndex].createdAt};
      setTasks(newTasks);
      setTask('');
      setEditIndex(-1);
    } else {
      // Adicionar nova tarefa
      setTasks([...tasks, {text: task, createdAt: now, updatedAt: now}]);
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
          inputProps={{
            style: {
              border: 'none',
            }
          }}
        />
        <Button className={classes.button} variant="contained" color="primary" onClick={handleAddTask}>
          {editIndex >= 0 ? 'Salvar' : 'Adicionar'}
        </Button>
      </div>
      <div className={classes.listContainer}>
        <List>
          {tasks.map((task, index) => (
            <ListItem key={index} className={classes.list}>
              <ListItemText primary={task.text}/> {/*Nome da tarefa*/}
              {/*Essa parte foi separada, para que os itens possam ficar lado a lado e o cabeçalho dos resultados possa ser criado*/}
              <ListItemText secondary={task.updatedAt.toLocaleString()} /> {/*Data da criação da tarefa e local da tarefa*/}
              <ListItemSecondaryAction>
                <IconButton onClick={() => handleEditTask(index)} className={classes.editButton}> {/*Botão de editar*/}
                  EDITAR
                </IconButton>
                <IconButton onClick={() => handleDeleteTask(index)} className={classes.deleteButton}> {/*Botão de deletar*/}
                  DELETAR
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </div>
    </div>
  );
};


export default ToDoList;
