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
            fileId TEXT PRIMARY KEY,
            hash TEXT,
            type TEXT,
            name TEXT,
            modifiable NUMBER,
            property TEXT,
            FOREIGN KEY (fileId) REFERENCES files(uuid) ON DELETE CASCADE
        );
    `);

    const filesQuery: {
        gets: Statement<[], FileRow>,
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
        gets: Statement<[], AssetRow>,
        getByFileId: Statement<[string], AssetRow>,
        getByType: Statement<[string], AssetRow>,
        insert: Statement<[string, string, string, string, number, string], RunResult>,
        updateType: Statement<[string, string], RunResult>,
        updateHash: Statement<[string, string], RunResult>,
        updateName: Statement<[string, string], RunResult>,
        updateProperty: Statement<[string, string], RunResult>
    } = {
        gets: db.prepare("SELECT * FROM assets"),
        getByFileId: db.prepare("SELECT * FROM assets WHERE fileId = ?"),
        getByType: db.prepare("SELECT * FROM assets WHERE type = ?"),
        insert: db.prepare(`
            INSERT INTO assets (fileId, hash, type, name, modifiable, property)
            VALUES (?, ?, ?, ?, ?, ?);    
        `),
        updateType: db.prepare(`
            UPDATE assets
            SET type = ?
            WHERE fileId = ?
        `),
        updateHash: db.prepare(`
            UPDATE assets
            SET hash = ?
            WHERE fileId = ?
        `),
        updateName: db.prepare(`
            UPDATE assets
            SET name = ?
            WHERE fileId = ?
        `),
        updateProperty: db.prepare(`
            UPDATE assets
            SET property = ?
            WHERE fileId = ?
        `)
    }

    return { filesQuery, assetsQuery }
}

export function closeDB(){
    if(db) db.close();
}
