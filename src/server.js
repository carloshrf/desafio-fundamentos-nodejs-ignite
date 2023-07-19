import http from "node:http";
import { routes } from "./routes.js";
import { getPathQuery } from "./utils/getPathQuery.js";
import { json } from "./middleware/json.js";

const server = http.createServer(async (req, res) => {
    const route = routes.find(
        (route) => route.path.test(req.url) && route.method === req.method
    );

    await json(req);

    if (route) {
        try {
            const pathParams = req.url.match(route.path);
            const { query, ...params } = pathParams.groups;

            req.params = params;
            req.query = query ? getPathQuery(query) : {};

            await route.handler(req, res);
        } catch (error) {
            res.setHeader("content-type", "application/json");
            res.writeHead(400);
            res.end(JSON.stringify({ message: error.message || "Erro" }));
        }
    } else {
        res.setHeader("content-type", "application/json");
        res.writeHead(404);
        res.end(JSON.stringify({ message: "resource not found!" }));
    }
});

server.listen(3333, () => console.info("server is running..."));
