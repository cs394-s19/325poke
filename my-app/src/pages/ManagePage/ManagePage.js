import React from 'react';
import './styles.css';
import {TextField, Button} from '@material-ui/core';
import database from '../../firebase'

const updateDate = (newStart, newEnd) => {
    const newTimes = {"start": newStart, "end": newEnd};
    database.ref('/settings/time').update(newTimes)
};

export function ManagePage(props) {

    const [startDate, setStartDate] = React.useState("2018-09-27");

    function handleStartChange(event) {
        setStartDate(event.target.value)
    }

    const [endDate, setEndDate] = React.useState("2018-12-14");

    function handleEndChange(event) {
        setEndDate(event.target.value)
    }

    return (
        <div class="wrapper">
            <div className='email'>
                <h1 className='h1'>Manage Quarter Time</h1>
                <TextField required id="1" type='date' name="s_time" defaultValue="2018-09-27"
                           onChange={handleStartChange}
                           helperText="Quarter Start Time"/>
                <br/><br/>
                <TextField required id="2" type='date' name="e_time" defaultValue="2018-12-14"
                           onChange={handleEndChange}
                           helperText="Quarter End Time"/>
                <br/><br/>
                <Button id="modify"
                        label="Modify" variant="contained" color="primary"
                        onClick={() => updateDate(startDate, endDate)}>
                    Modify
                </Button>
            </div>
        </div>
    );
}
