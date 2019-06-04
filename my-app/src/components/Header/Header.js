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

class Header extends Component {
    generateMenuItem() {
        const {numOfWeek} = this.props;
        let menuItems = [];
        for (let i = 0; i <= numOfWeek; i++) {
            menuItems.push(<MenuItem value={i}>{i === 0 ? "All" : i}</MenuItem>);
        }
        return menuItems;
    }

    render() {
        const {classes} = this.props;

        return (
            <AppBar position="fixed">
                <Toolbar>
                    <Typography variant="h6">
                        <span style={{color: "white", fontSize: 30}}> 325 Dashboard </span>
                    </Typography>

                    <span style={{flexGrow: 1}}>&nbsp;</span>

                    <span>Week:</span> &nbsp;
                    <form autoComplete="off">
                        <FormControl>
                            <Select
                                style={{color: 'white', marginTop: 2}}
                                disableUnderline={true}
                                value={this.props.currWeek}
                                onChange={this.props.handleWeekChange}
                                inputProps={{
                                    id: 'week-selector',
                                    classes: {
                                        icon: classes.arrowColor,
                                    }
                                }}
                            >
                                {this.generateMenuItem()}
                                {/*<MenuItem value={0}>All</MenuItem>*/}
                                {/*<MenuItem value={1}>1</MenuItem>*/}
                                {/*<MenuItem value={2}>2</MenuItem>*/}
                                {/*<MenuItem value={3}>3</MenuItem>*/}
                                {/*<MenuItem value={4}>4</MenuItem>*/}
                                {/*<MenuItem value={5}>5</MenuItem>*/}
                                {/*<MenuItem value={6}>6</MenuItem>*/}
                                {/*<MenuItem value={7}>7</MenuItem>*/}
                                {/*<MenuItem value={8}>8</MenuItem>*/}
                                {/*<MenuItem value={9}>9</MenuItem>*/}
                                {/*<MenuItem value={10}>10</MenuItem>*/}
                                {/*<MenuItem value={11}>11</MenuItem>*/}
                                {/*<MenuItem value={12}>12</MenuItem>*/}
                            </Select>
                        </FormControl>
                    </form>
                    <Button id="show" component={Link} to={{
                        pathname: "managepage",
                        student: this.props.jsonData.authors,
                    }} label="Manage" variant="contained" color="primary">
                        Manage
                    </Button>
                </Toolbar>
            </AppBar>
        )
    }
}

export const StyledHeader = withStyles(styles)(Header)