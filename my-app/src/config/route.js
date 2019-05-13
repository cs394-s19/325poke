import React from 'react';
import { BrowserRouter, Route, Switch} from "react-router-dom";
import {
    MainPage,
    Details,
} from '../pages';

const AppNavigator = () => (
    <div>
    <BrowserRouter>
        <Switch>
            <Route exact path="/" component={MainPage} />
            <Route exact path="/details" component={Details} />
        </Switch>
    </BrowserRouter>
    </div>
)

export { AppNavigator};