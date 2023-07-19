import fs from "fs";
import { parse } from "csv-parse";
import { Database } from "../src/database.js";

async function persistCSVintoDB(row, db) {
    const [title, description] = row;

    if (!title) throw { message: "title is required" };
    if (!description) throw { message: "description is required" };

    const task = { title, description, completed_at: null };

    db.insert("tasks", task);
}

async function importCsv(db) {
    try {
        const csvPath = new URL("../tasks.csv", import.meta.url);

        const parser = fs.createReadStream(csvPath).pipe(
            parse({
                delimiter: ",",
                skip_empty_lines: true,
                fromLine: 2,
            })
        );

        for await (const record of parser) {
            await persistCSVintoDB(record, db);
        }
    } catch (error) {
        console.error("that was not possible to import due an error: ", error);
    }
}

(async () => {
    const db = await Database.createInstance();
    await importCsv(db);
})();
