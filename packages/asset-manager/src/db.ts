import Database from 'better-sqlite3';
import type { Statement, Transaction } from "better-sqlite3";
import path from "node:path";
import fs from "fs-extra";

export type FileRow = {
    uuid: string,
    hash: string,
    path: string | null,
    dirty?: boolean
}
export type AssetRow = {
    uuid: string,
    fileId: string,
    hash: string,
    type: "other" | "image" | "mesh" | "prefab",
    name: string,
    property: string
}

let db: Database.Database;

export function createDBIfNotExist(dbFilePath: string){
    fs.ensureFileSync(dbFilePath);
    db = new Database(dbFilePath, {  });
    db.pragma('journal_mode = WAL');
    db.exec(`
        CREATE TABLE IF NOT EXISTS files(
            uuid TEXT PRIMARY KEY,
            hash TEXT,
            path TEXT
        );
        CREATE TABLE IF NOT EXISTS assets(
            uuid TEXT PRIMARY KEY,
            fileId TEXT,
            hash TEXT,
            type TEXT,
            name TEXT,
            property TEXT,
            FOREIGN KEY (fileId) REFERENCES files(uuid) ON DELETE CASCADE
        );
    `);

    const filesQuery: {
        gets: Statement,
        updatePath: Statement,
        updateHash: Statement,
        insert: Statement,
        delete: Statement
    } = {
        gets: db.prepare("SELECT * FROM files"),
        updatePath: db.prepare(`
            UPDATE files
            SET path = ?
            WHERE uuid = ?
        `),
        updateHash: db.prepare(`
            UPDATE files
            SET hash = ?
            WHERE uuid = ?
        `),
        insert: db.prepare(`
            INSERT INTO files (uuid, hash, path)
            VALUES (?, ?, ?);
        `),
        delete: db.prepare(`
            DELETE FROM files WHERE uuid = ?
        `),
    }

    const assetsQuery: {
        gets: Statement,
        delete: Statement,
        deletesTransaction: Transaction,
        insert: Statement,
        updateHash: Statement,
        updateName: Statement
    } = {
        gets: db.prepare("SELECT * FROM assets"),
        delete: db.prepare("DELETE FROM assets WHERE uuid = ?"),
        deletesTransaction: db.transaction((ids: string[]) => {
            for(const id of ids) assetsQuery.delete.run(id);
        }),
        insert: db.prepare(`
            INSERT INTO assets (uuid, fileId, hash, type, name, property)
            VALUES (?, ?, ?, ?, ?, ?);    
        `),
        updateHash: db.prepare(`
            UPDATE assets
            SET hash = ?
            WHERE uuid = ?
        `),
        updateName: db.prepare(`
            UPDATE assets
            SET name = ?
            WHERE uuid = ?
        `)
    }

    return { filesQuery, assetsQuery }
}

export function closeDB(){
    if(db) db.close();
}
