import React from 'react';
import ReactDOM from 'react-dom';
import PhotoBankRouter from './PhotoBankRouter';
import('../../scss/app.scss');
var wrapper = document.getElementById('photobank-root');
ReactDOM.render(<PhotoBankRouter />, wrapper);
