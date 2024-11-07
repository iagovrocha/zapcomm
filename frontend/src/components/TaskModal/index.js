import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import IconButton from "@material-ui/core/IconButton";

const useStyles = makeStyles((theme) => ({
  btnWrapper: {
    borderRadius: "0.6rem",
    color: "#0c2c54",
    backgroundColor: "#34d3a3",
    "&:hover": {
      backgroundColor: "#5cdbb5",
    },
  },
}));

const TaskSchema = Yup.object().shape({
  task: Yup.string()
    .max(50, "A tarefa não pode exceder 50 caracteres.")
    .required("Obrigatório")
    .test('not-blank', 'A tarefa não pode ser apenas espaços em branco.', (value) => {
      return value && value.trim() !== ''; // Valida que a tarefa não seja apenas espaços em branco
    }),
});

const TaskModal = ({ open, onClose, onSubmit, initialTask }) => {
  const classes = useStyles();
  const [charLimitError, setCharLimitError] = useState('');

  const handleClose = () => {
    setCharLimitError(''); // Limpa o erro ao fechar
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle className={classes.DialogTitle} style={{ backgroundColor: '#0C2C54', color: "#FFF" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {initialTask ? "Editar Tarefa" : "Adicionar Tarefa"}
          <IconButton onClick={handleClose} style={{ color: "white" }}>x</IconButton>
        </div>
      </DialogTitle>
      <Formik
        initialValues={{ task: initialTask || '' }}
        validationSchema={TaskSchema}
        onSubmit={(values, { setSubmitting }) => {
          onSubmit(values.task);
          setSubmitting(false);
          handleClose();
        }}
      >
        {({ isSubmitting, touched, errors, setFieldValue }) => (
          <Form>
            <DialogContent dividers>
              <Field
                as={TextField}
                label="Tarefa (máximo de 50 caracteres)"
                name="task"
                fullWidth
                multiline
                rows={4}
                error={touched.task && (Boolean(errors.task) || charLimitError)}
                helperText={touched.task ? (errors.task || charLimitError) : ''}
                variant="outlined"
                margin="dense"
                inputProps={{ maxLength: 50 }}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 50) {
                    setFieldValue("task", value);
                    setCharLimitError(''); // Limpa o erro se não exceder
                  } else {
                    setCharLimitError('O limite de 50 caracteres foi alcançado.');
                  }
                }}
              />
            </DialogContent>
            <DialogActions style={{ justifyContent: 'center', width: '100%' }}>
              <Button
                type="submit"
                disabled={isSubmitting || charLimitError} // Desabilita se houver erro
                variant="contained"
                className={classes.btnWrapper}
              >
                {initialTask ? "Salvar Alteração" : "Adicionar Tarefa"}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default TaskModal;
