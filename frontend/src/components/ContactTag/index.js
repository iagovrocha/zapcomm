import { makeStyles } from "@material-ui/styles";
import React from "react";

const useStyles = makeStyles(theme => ({
    tag: {
        padding: "1px 5px",
        borderRadius: "3px",
        fontSize: "0.8em",
        fontWeight: "bold",
        color: "#FFF",
        marginRight: "5px",
        whiteSpace: "nowrap"
    }
}));

function hexToRgb(hex) {
    // Remove o símbolo "#" se ele estiver presente
    hex = hex.replace('#', '');
  
    // Converter os valores hexadecimais em valores RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
  
    return `${r}, ${g}, ${b}`;
  };

const ContactTag = ({ tag }) => {
    const classes = useStyles();

    return (
        <div className={classes.tag} style={{ backgroundColor: `rgba(${hexToRgb(tag.color)}, 0.2)`, color: tag.color, marginTop: "2px" }}>
            {tag.name.toUpperCase()}
        </div>
    )
}

export default ContactTag;