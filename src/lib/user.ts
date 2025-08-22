import { User } from "@/lib/models";

export const getUserById = async (db: D1Database, id: number) => {
  const sql = `SELECT * FROM users WHERE id = ?`;
  const result = await db.prepare(sql).bind(id).first();

  return result as unknown as User;
};

export const getUserByEmail = async (db: D1Database, email: string) => {
  const sql = `SELECT * FROM users WHERE email = ?`;
  const result = await db.prepare(sql).bind(email).first();

  if (email && !result) {
    return createUser(db, email);
  }

  return result as unknown as User;
};

export const createUser = async (db: D1Database, email: string) => {
  const sql = `INSERT INTO users (email) VALUES (?)`;
  const result = await db.prepare(sql).bind(email).run();

  const id = result.meta.last_row_id;

  return { id, email } as User;
};
