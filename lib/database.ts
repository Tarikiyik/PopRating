import { Pool,QueryConfig,QueryResult } from "pg"

export const pool = new Pool ({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: `${process.env.DATABASE_PASSWORD}`,
    database: `${process.env.DATABASE_NAME}`
})

export const query = (
    text: string,
    params ?: any[]
): Promise <QueryResult> => {
    return pool.query(text,params)
}