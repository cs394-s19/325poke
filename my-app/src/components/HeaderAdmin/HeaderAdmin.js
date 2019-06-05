import React, {Component} from 'react';
import './styles.css';
import {AppBar, Button, FormControl, MenuItem, Select, Toolbar, Typography, withStyles} from '@material-ui/core';
import {Link} from 'react-router-dom';

// styles
const styles = {
    textField: {
        width: 300,
        fontSize: 50,
    },
    weekColor: {
        color: 'white',
    },
    arrowColor: {
        fill: 'white'
    },
    week_label: {
        marginRight: 100,
    }
};

class HeaderAdmin extends Component {

    render() {
        const {classes} = this.props;

        return (
            <AppBar position="fixed">
                <Toolbar>
                    <Typography variant="h6">
                        <span style={{color: "white", fontSize: 30}}> 325 Dashboard </span>
                    </Typography>

                    <span style={{flexGrow: 1}}>&nbsp;</span>

                    <Button id="show" component={Link} to={{
                        pathname: "/",
                    }} label="Home" variant="contained" color="primary">
                        Manage
                    </Button>
                </Toolbar>
            </AppBar>
        )
    }
}

export const StyledHeaderAdmin = withStyles(styles)(HeaderAdmin)