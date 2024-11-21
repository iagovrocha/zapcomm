import React from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";

import { i18n } from "../../translate/i18n";

import IconButton from "@mui/material/IconButton";

const useStyles = makeStyles((theme) => ({ 
	background: {
		backgroundColor: "#0c2c54",
		color: "white",
	},

	cancelar: {
		color: "#F50057",
	},

	ok: {
		borderRadius: "20px",
		color: "#0c2c54",
		backgroundColor: "#34d3a3",
		"&:hover": {
			backgroundColor: "#5cdbb5",
		},
	},
	AlinhamentoBtn: {
		display: "flex !important",
		flexDirection: "row !important",
		justifyItems: "right !important",
	  },
}));
const ConfirmationModal = ({ title, children, open, onClose, onConfirm }) => {
	const classes = useStyles();
	return (
		<Dialog
			open={open}
			onClose={() => onClose(false)}
			aria-labelledby="confirm-dialog"
		>
			<DialogTitle className={classes.background}>
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					{title}
					<IconButton onClick={() => onClose(false)} style={{ color: "white" }}>x</IconButton>
				</div>
				</DialogTitle>
			<DialogContent>
				<Typography>{children}</Typography>
			</DialogContent>
			<DialogActions className={classes.AlinhamentoBtn}>
				{/* <Button
					variant="contained"
					onClick={() => onClose(false)}
					color="default"
					className={classes.cancelar}
				>
					{i18n.t("confirmationModal.buttons.cancel")}
				</Button> */}
				<Button
					variant="contained"
					onClick={() => {
						onClose(false);
						onConfirm();
					}}
					className={classes.ok}
					color="primary"
				>
					{i18n.t("confirmationModal.buttons.confirm")}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ConfirmationModal;
