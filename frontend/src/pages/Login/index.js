import React, { useState, useContext } from "react";
import { Link as RouterLink } from "react-router-dom";

import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import { versionSystem } from "../../../package.json";
import { i18n } from "../../translate/i18n";
import { nomeEmpresa } from "../../../package.json";
import { AuthContext } from "../../context/Auth/AuthContext";
import logo from "../../assets/logo.png";
import LoginImg from "../../assets/FotoLogin.png"

const Copyright = () => {
	return (
		<Typography variant="body2" color="#000000" align="center">
			{"Copyright "}
			<Link color="primary" href="https://baasic.com.br/" target="_blank">
				{"Baasic"} - v {versionSystem}
			</Link>{" "}
			{new Date().getFullYear()}
			{"."}
		</Typography>
	);
};

const useStyles = makeStyles(theme => ({
	root: {
		width: "100vw",
		height: "100vh",
		backgroundColor: "#FFFFFF",
		backgroundRepeat: "no-repeat",
		backgroundSize: "50% 50%",
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		textAlign: "center",
		position: "relative", // Isso permitirá o posicionamento da imagem
	},
	paper: {
		backgroundColor: theme.palette.login,
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		padding: "55px 30px",
		borderRadius: "12.5px",
	},
	avatar: {
		margin: theme.spacing(1),
		backgroundColor: theme.palette.secondary.main,
	},
	form: {
		width: "100%", // Fix IE 11 issue.
		marginTop: theme.spacing(1),
	},
	submit: {
		margin: theme.spacing(3, 0, 2),
	},
	imageLogin: {
		position: "right", // Para posicionar a imagem no lado direito
		right: "0", // Alinha a imagem à direita
		bottom: "0",
		height: "100%", // Ajusta a altura para que ocupe toda a tela
		display: "block", // Exibe a imagem em telas maiores
		'@media (max-width: 1070px)': { // Esconde a imagem em dispositivos móveis (largura menor que 768px)
			display: "none",
		},
		'@media (max-width: 1150px)': {
			width: "600px",
		},
	},
}));


const Login = () => {
	const classes = useStyles();

	const [user, setUser] = useState({ email: "", password: "" });

	const { handleLogin } = useContext(AuthContext);

	const handleChangeInput = e => {
		setUser({ ...user, [e.target.name]: e.target.value });
	};

	const handlSubmit = e => {
		e.preventDefault();
		handleLogin(user);
	};


	return (
		<div className={classes.root}>
			<Container component="main" maxWidth="xs">
				<CssBaseline />
				<div className={classes.paper}>
					<div>
						<img style={{ margin: "0 auto", width: "70%" }} src={logo} alt="Whats" />
					</div>
					<form className={classes.form} noValidate onSubmit={handlSubmit}>
						<TextField
							variant="outlined"
							margin="normal"
							required
							fullWidth
							id="email"
							label={i18n.t("login.form.email")}
							name="email"
							value={user.email}
							onChange={handleChangeInput}
							autoComplete="email"
							autoFocus
						/>
						<TextField
							variant="outlined"
							margin="normal"
							required
							fullWidth
							name="password"
							label={i18n.t("login.form.password")}
							type="password"
							id="password"
							value={user.password}
							onChange={handleChangeInput}
							autoComplete="current-password"
						/>

						<Grid container justify="flex-end">
							<Grid item xs={6} style={{ textAlign: "right" }}>
								<Link component={RouterLink} to="/forgetpsw" variant="body2">
									Esqueceu sua senha?
								</Link>
							</Grid>
						</Grid>
						<Button
							type="submit"
							fullWidth
							variant="contained"
							color="primary"
							style={{ backgroundColor: "#1B7358" }}
							className={classes.submit}
						>
							{i18n.t("login.buttons.submit")}
						</Button>
						<Grid container>
							<Grid item>
								<Link
									href="#"
									variant="body2"
									component={RouterLink}
									to="/signup"
								>
									{i18n.t("login.buttons.register")}
								</Link>
							</Grid>
						</Grid>
					</form>
				</div>
				<Box mt={8}><Copyright /></Box>
			</Container>
			<img className={classes.imageLogin} src={LoginImg} alt="Foto de Login" />
		</div>
	);
};

export default Login;