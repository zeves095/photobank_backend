import React from 'react';
import ReactDOM from 'react-dom';

import { UserManager } from './UserManager';

var wrapper = document.getElementById('usermanager-wrapper');
global.config = JSON.parse(wrapper.dataset.config);
wrapper.dataset.config="";

if(typeof UserManager != 'undefined') ReactDOM.render(<UserManager />, wrapper);
