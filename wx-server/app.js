const express = require('express');
const index = require('./route/index')

let server = new express();

server.use('/share',index)

server.listen(3000)