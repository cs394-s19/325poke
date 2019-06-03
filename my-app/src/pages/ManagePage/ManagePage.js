import React from 'react';
import './styles.css';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import FolderIcon from '@material-ui/icons/Folder';
import DeleteIcon from '@material-ui/icons/Delete';
import { TextField, Button } from '@material-ui/core';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';


export function ManagePage(props) {

    const [values, setValues] = React.useState({
      emailtype: '',
    });
    function handleChange(event) {
      setValues(oldValues => ({
        ...oldValues,
        [event.target.name]: event.target.value,
      }));
    }
    function generate(element) {
      return [0, 1, 2, 3].map(value =>
        React.cloneElement(element, {
          key: value,
        }),
      );
  }

    return (
      <div class="wrapper">

        <div className='student'>
          <h1 className='h1'>Manage Student</h1>
            <List>
              {generate(
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <FolderIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Student"
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" aria-label="Delete">
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              )}
            </List>
        </div>

        <div></div>

        <div className='email'>
          <h1 className='h1'>Manage Quarter Time</h1>
            <TextField required id="1" type='date'name="s_time" 
            helperText="Quarter Start Time"/>
            <br /><br />
            <TextField required id="2" type='date'name="e_time"
            helperText="Quarter End Time"/>
            <br /><br />
            <Button id="modify" 
                label="Modify" variant="contained" color="primary" >
            Modify
            </Button>
            <h1 className='h1'>Manage Email</h1>
            <br /><br /> 
            <FormControl className='formControl' id="4">
              <Select
                value={values.emailtype}
                onChange={handleChange}
                inputProps={{
                  name: 'emailtype',
                  id: 'emailtype-simple',
                }}
              >
                <MenuItem value={1}>1st</MenuItem>
                <MenuItem value={2}>2ed</MenuItem>
                <MenuItem value={3}>3rd</MenuItem>
              </Select>
            <FormHelperText>Email Type</FormHelperText>
            </FormControl>
            <br /><br />
            <textarea name="paste" rows="20" cols="80" id='show-text'></textarea>
            <br /><br /><br />
            <Button id="modify" 
                label="Modify" variant="contained" color="primary" >
            Modify
            </Button>
            {/* component={Link} to="moves" */}
        </div>

      </div>
    );
}