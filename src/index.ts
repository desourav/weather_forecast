import express, { Express, Request, Response } from "express";
import * as path from 'path';
const app: Express = express();

app.use(express.static(path.join(__dirname, '/')));
var engines = require('consolidate');

app.set('views', __dirname + '/controllers');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
// root for the api endpoint
app.use("/info", require("./routes/route"));

app.use((err: any, req: any, res: any, next: any) => {
    console.log(err.code);
    console.log(err.stack);
    console.log(err.name);

    res.status(500).json({
        "message": "error handling the request"
    });
});

app.listen(8080, () => {
 console.log(`App is listening on port 8080`);
});


