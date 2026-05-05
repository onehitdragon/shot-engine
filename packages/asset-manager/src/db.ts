import Database from 'better-sqlite3';
import type { RunResult, Statement, Transaction } from "better-sqlite3";
import fs from "fs-extra";
import { AssetType } from "@shot-engine/types";

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
    type: AssetType,
    name: string,
    modifiable: number,
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
            modifiable NUMBER,
            property TEXT,
            FOREIGN KEY (fileId) REFERENCES files(uuid) ON DELETE CASCADE
        );
    `);

    const filesQuery: {
        gets: Statement,
        getByPath: Statement<[string], FileRow>,
        getById: Statement<[string], FileRow>,
        updatePath: Statement,
        updateHash: Statement,
        insert: Statement,
        delete: Statement
    } = {
        gets: db.prepare("SELECT * FROM files"),
        getById: db.prepare("SELECT * FROM files WHERE uuid = ?"),
        getByPath: db.prepare("SELECT * FROM files WHERE path = ?"), 
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
        getByFileId: Statement<[string], AssetRow>,
        getById: Statement<[string], AssetRow>,
        getByType: Statement<[string], AssetRow>,
        delete: Statement,
        deletesTransaction: Transaction,
        insert: Statement<[string, string, string, string, string, number, string], RunResult>,
        updateHash: Statement,
        updateName: Statement,
        updateProperty: Statement<[string, string], RunResult>
    } = {
        gets: db.prepare("SELECT * FROM assets"),
        getByFileId: db.prepare("SELECT * FROM assets WHERE fileId = ?"),
        getById: db.prepare("SELECT * FROM assets WHERE uuid = ?"),
        getByType: db.prepare("SELECT * FROM assets WHERE type = ?"),
        delete: db.prepare("DELETE FROM assets WHERE uuid = ?"),
        deletesTransaction: db.transaction((ids: string[]) => {
            for(const id of ids) assetsQuery.delete.run(id);
        }),
        insert: db.prepare(`
            INSERT INTO assets (uuid, fileId, hash, type, name, modifiable, property)
            VALUES (?, ?, ?, ?, ?, ?, ?);    
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
        `),
        updateProperty: db.prepare(`
            UPDATE assets
            SET property = ?
            WHERE uuid = ?
        `)
    }

    return { filesQuery, assetsQuery }
}

export function closeDB(){
    if(db) db.close();
}
