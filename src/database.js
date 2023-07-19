import fs from "node:fs/promises";
import { randomUUID as uuid } from "node:crypto";

const dbPath = new URL("../db.json", import.meta.url);

class Database {
    #data = {};

    constructor(dbData) {
        if (dbData) {
            this.#data = dbData;
        } else {
            fs.readFile(dbPath, "utf-8")
                .then((data) => (this.#data = JSON.parse(data)))
                .catch((error) => {
                    if (error?.code === "ENOENT") {
                        fs.writeFile(dbPath, "{}", (err) => {
                            if (err) console.error(err);
                            else console.info("database created!");
                        });
                    } else {
                        console.error(error);
                    }
                });
        }
    }

    static async createInstance() {
        let dbData = {};

        try {
            const data = await fs.readFile(dbPath, "utf-8");
            dbData = JSON.parse(data);
        } catch (error) {
            if (error?.code === "ENOENT") {
                fs.writeFile(dbPath, "{}", (err) => {
                    if (err) console.error(err);
                    else console.info("database created!");
                });
            } else {
                console.error(error);
            }
        }

        return new Database(dbData);
    }

    #persist() {
        fs.writeFile(dbPath, JSON.stringify(this.#data));
    }

    selectById(table, id) {
        return this.#data[table].find((item) => item.id === id);
    }

    select(table, filter) {
        if (filter) {
            const findValues = Object.entries(filter);

            const filteredData = this.#data[table].filter((item) =>
                findValues.some(([key, value]) =>
                    item[key].toLowerCase().includes(value.toLowerCase())
                )
            );

            return filteredData;
        }

        return this.#data[table] || [];
    }

    insert(table, data) {
        data.id = uuid();
        data.created_at = new Date().toISOString();
        data.updated_at = new Date().toISOString();

        if (Array.isArray(this.#data[table])) {
            this.#data[table].push(data);
        } else {
            this.#data[table] = [data];
        }

        this.#persist();
    }

    update(table, data, id) {
        let dataIndex = this.#data[table]?.findIndex((item) => item.id === id);

        if (dataIndex > -1) {
            const updatedData = {
                ...this.#data[table][dataIndex],
                ...data,
                updated_at: new Date().toISOString(),
            };

            this.#data[table][dataIndex] = {
                ...this.#data[table][dataIndex],
                ...updatedData,
            };

            this.#persist();

            return updatedData;
        }
    }

    delete(table, id) {
        const dataIndex = this.#data[table]?.findIndex(
            (item) => item.id === id
        );

        if (dataIndex > -1) {
            const deleted = this.#data[table].splice(dataIndex, 1);

            this.#persist();

            return deleted;
        }
    }
}

export { Database };
