import express from "express";
import bodyParser from "body-parser";
import routes from "./routes";
import { Log } from "logging-middleware";

const app = express();
app.use(bodyParser.json());
app.use("/", routes);

const PORT = 4000;
app.listen(PORT, () => {
  Log("backend", "info", "service", `Server started on port ${PORT}`);
});
