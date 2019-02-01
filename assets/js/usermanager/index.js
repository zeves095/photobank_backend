import React from 'react';
import ReactDOM from 'react-dom';

import { UserManagerWrapper } from './components/UserManagerWrapper';

var wrapper = document.getElementById('usermanager-wrapper');
global.config = JSON.parse(wrapper.dataset.config);
wrapper.dataset.config="";

if(typeof UserManagerWrapper != 'undefined') ReactDOM.render(<UserManagerWrapper />, wrapper);
