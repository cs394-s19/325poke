import React from 'react';
import { BrowserRouter, Route, Switch} from "react-router-dom";
import {
    StyledMainPage,
    Details,
} from '../pages';

const AppNavigator = () => (
    <div>
    <BrowserRouter>
        <Switch>
            <Route exact path="/" component={StyledMainPage} />
            <Route exact path="/details" component={Details} />
        </Switch>
    </BrowserRouter>
    </div>
)

export { AppNavigator};