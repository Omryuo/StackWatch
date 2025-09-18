"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const routes_1 = __importDefault(require("./routes"));
const logging_middleware_1 = require("logging-middleware");
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.use("/", routes_1.default);
const PORT = 4000;
app.listen(PORT, () => {
    (0, logging_middleware_1.Log)("backend", "info", "service", `Server started on port ${PORT}`);
});
