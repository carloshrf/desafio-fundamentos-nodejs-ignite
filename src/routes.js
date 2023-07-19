import { Database } from "./database.js";
import { resolveParams } from "./utils/resolveParams.js";

const db = new Database();

const routes = [
    {
        method: "POST",
        path: resolveParams("/tasks"),
        handler: async (req, res) => {
            const { title, description } = req.body;

            if (!title) throw { message: "title is required" };
            if (!description) throw { message: "description is required" };

            const data = { title, description };

            data.completed_at = null;

            db.insert("tasks", data);

            return res.writeHead(201).end(JSON.stringify(data));
        },
    },
    {
        method: "GET",
        path: resolveParams("/tasks"),
        handler: (req, res) => {
            const { filter: queryFilter } = req.query;

            const filter = queryFilter
                ? {
                      title: queryFilter,
                      description: queryFilter,
                  }
                : null;

            const data = db.select("tasks", filter);

            return res.writeHead(200).end(JSON.stringify(data));
        },
    },
    {
        method: "PUT",
        path: resolveParams("/tasks/:taskId"),
        handler: (req, res) => {
            const { taskId } = req.params;
            const data = req?.body;

            console.log(!data?.description && !data?.title)
            if (!data?.description && !data?.title)
                throw { message: "description or title is required" };

            const task = {
                ...(data.title && { title: data.title }),
                ...(data.description && { description: data.description }),
            };

            const entity = db.update("tasks", task, taskId);

            if (entity) {
                return res.writeHead(200).end(JSON.stringify(entity));
            }

            return res
                .writeHead(404)
                .end(JSON.stringify({ message: "id not found" }));
        },
    },
    {
        method: "DELETE",
        path: resolveParams("/tasks/:taskId"),
        handler: (req, res) => {
            const { taskId } = req.params;

            const deleted = db.delete("tasks", taskId);

            if (deleted) {
                return res.writeHead(204).end();
            }

            return res
                .writeHead(404)
                .end(JSON.stringify({ message: "id not found" }));
        },
    },
    {
        method: "PATCH",
        path: resolveParams("/tasks/:taskId/complete"),
        handler: (req, res) => {
            const { taskId } = req.params;

            const task = db.selectById("tasks", taskId);

            if (!task) {
                return res
                    .writeHead(404)
                    .end(JSON.stringify({ message: "id not found" }));
            }

            task.completed_at = task.completed_at
                ? null
                : new Date().toISOString();

            const updated = db.update("tasks", task, taskId);

            if (updated) {
                return res.writeHead(200).end(JSON.stringify(task));
            }

            return res
                .writeHead(404)
                .end(JSON.stringify({ message: "id not found" }));
        },
    },
];

export { routes };
