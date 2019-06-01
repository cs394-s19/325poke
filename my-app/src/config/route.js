import React from 'react';
import { BrowserRouter, Route, Switch} from "react-router-dom";
import {
    StyledMainPage,
    Details,
    ManagePage,
} from '../pages';

const AppNavigator = () => (
    <div>
    <BrowserRouter>
        <Switch>
            <Route exact path="/" component={StyledMainPage} />
            <Route exact path="/details" component={Details} />
            <Route exact path="/managepage" component={ManagePage} />
        </Switch>
    </BrowserRouter>
    </div>
)

export { AppNavigator};