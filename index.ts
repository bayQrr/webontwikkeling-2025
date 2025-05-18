import express from "express";
import router from "./public/router/routers";
import { connect } from './database';
import { errorHandler } from "./public/middleware/middleware"
import session from "./public/middleware/session";

const app = express();

app.set("port", 3001);
app.set("view engine", "ejs")
app.use(express.static("public"));

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(session);

app.use("/", router); 

app.use(errorHandler(404, "The page you were trying to find does not exists"))
   .use(errorHandler(500, "Internal server error. Please try again later."))
   .use(errorHandler(403, "Forbidden. Access denied."))
   .use(errorHandler(401, "Unauthorized. Please log in."))
   .use(errorHandler(400, "Bad request. Invalid syntax."));

app.listen(app.get("port"), async () => {
    connect();
    console.log("server http://localhost:" + app.get("port"));
});
