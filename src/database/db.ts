import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';

export interface Transaction {
  id: number;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  created_at: string;
}

export interface UserProfile {
  name: string;
  role: string;
  email: string;
  monthly_income_target: number;
  currency: string;
  avatar_uri?: string;
  cycle_mode?: 'weekly' | 'monthly';
}

export interface Budget {
  id: number;
  category: string;
  limit_amount: number;
}

// State in-memory lokal (bersih tanpa data dummy)
let memoryTransactions: Transaction[] = [];
let memoryBudgets: Budget[] = [];
let nextTxId = 1;
let nextBudgetId = 1;

let memoryProfile: UserProfile = {
  name: 'Pengguna RSDVault',
  role: 'Personal (Pengguna Pribadi)',
  email: 'pengguna@rsdvault.app',
  monthly_income_target: 10000000,
  currency: 'IDR (Rp)',
  avatar_uri: '',
  cycle_mode: 'monthly',
};

let db: SQLite.SQLiteDatabase | null = null;
let isDbInitialized = false;

function getDb(): SQLite.SQLiteDatabase | null {
  if (Platform.OS === 'web') return null;
  if (!db) {
    try {
      db = SQLite.openDatabaseSync('finance.db');
    } catch (err) {
      console.warn('SQLite openDatabaseSync error:', err);
      db = null;
    }
  }
  return db;
}

export function initDatabase() {
  if (isDbInitialized) return;
  const database = getDb();
  if (database) {
    try {
      database.execSync(`
        CREATE TABLE IF NOT EXISTS transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          amount INTEGER NOT NULL,
          type TEXT NOT NULL,
          category TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS user_profile (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          name TEXT NOT NULL,
          role TEXT NOT NULL,
          email TEXT NOT NULL,
          monthly_income_target INTEGER NOT NULL,
          currency TEXT NOT NULL,
          avatar_uri TEXT,
          cycle_mode TEXT DEFAULT 'monthly'
        );
        CREATE TABLE IF NOT EXISTS budgets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          category TEXT NOT NULL UNIQUE,
          limit_amount INTEGER NOT NULL
        );
      `);

      // Migrasi kolom jika tabel lama belum memiliki cycle_mode
      try {
        database.execSync("ALTER TABLE user_profile ADD COLUMN cycle_mode TEXT DEFAULT 'monthly'");
      } catch (_) {}

      const profile = database.getFirstSync<UserProfile>('SELECT * FROM user_profile WHERE id = 1');
      if (!profile) {
        database.runSync(
          `INSERT INTO user_profile (id, name, role, email, monthly_income_target, currency, avatar_uri, cycle_mode)
           VALUES (1, ?, ?, ?, ?, ?, ?, ?)`,
          [
            memoryProfile.name,
            memoryProfile.role,
            memoryProfile.email,
            memoryProfile.monthly_income_target,
            memoryProfile.currency,
            memoryProfile.avatar_uri || '',
            memoryProfile.cycle_mode || 'monthly',
          ]
        );
      }
      isDbInitialized = true;
    } catch (err) {
      console.warn('SQLite initDatabase error:', err);
    }
  }
}

export function getUserProfile(): UserProfile {
  initDatabase();
  const database = getDb();
  if (database) {
    try {
      const row = database.getFirstSync<UserProfile>(
        'SELECT name, role, email, monthly_income_target, currency, avatar_uri, cycle_mode FROM user_profile WHERE id = 1'
      );
      if (row) {
        if (!row.cycle_mode) row.cycle_mode = 'monthly';
        return row;
      }
    } catch (err) {
      console.warn('getUserProfile error:', err);
    }
  }
  return memoryProfile;
}

export function updateUserProfile(profile: UserProfile) {
  initDatabase();
  const database = getDb();
  const cycleMode = profile.cycle_mode || 'monthly';
  if (database) {
    try {
      database.runSync(
        `INSERT INTO user_profile (id, name, role, email, monthly_income_target, currency, avatar_uri, cycle_mode)
         VALUES (1, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           name = excluded.name,
           role = excluded.role,
           email = excluded.email,
           monthly_income_target = excluded.monthly_income_target,
           currency = excluded.currency,
           avatar_uri = excluded.avatar_uri,
           cycle_mode = excluded.cycle_mode`,
        [
          profile.name,
          profile.role,
          profile.email,
          profile.monthly_income_target,
          profile.currency,
          profile.avatar_uri || '',
          cycleMode,
        ]
      );
      memoryProfile = { ...profile, cycle_mode: cycleMode };
      return;
    } catch (err) {
      console.warn('updateUserProfile error:', err);
    }
  }
  memoryProfile = { ...profile, cycle_mode: cycleMode };
}

// Transactions CRUD
export function getTransactions(): Transaction[] {
  initDatabase();
  const database = getDb();
  if (database) {
    try {
      return database.getAllSync<Transaction>(
        'SELECT * FROM transactions ORDER BY datetime(created_at) DESC'
      );
    } catch (err) {
      console.warn('getTransactions error:', err);
    }
  }
  return [...memoryTransactions].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function insertTransaction(
  title: string,
  amount: number,
  type: 'income' | 'expense',
  category: string
) {
  const now = new Date().toISOString();
  initDatabase();
  const database = getDb();
  if (database) {
    try {
      database.runSync(
        'INSERT INTO transactions (title, amount, type, category, created_at) VALUES (?, ?, ?, ?, ?)',
        [title, amount, type, category, now]
      );
      return;
    } catch (err) {
      console.warn('insertTransaction error:', err);
    }
  }

  memoryTransactions.push({
    id: nextTxId++,
    title,
    amount,
    type,
    category,
    created_at: now,
  });
}

export function deleteTransaction(id: number) {
  initDatabase();
  const database = getDb();
  if (database) {
    try {
      database.runSync('DELETE FROM transactions WHERE id = ?', [id]);
      return;
    } catch (err) {
      console.warn('deleteTransaction error:', err);
    }
  }
  memoryTransactions = memoryTransactions.filter((tx) => tx.id !== id);
}

// Budgets CRUD
export function getBudgets(): Budget[] {
  initDatabase();
  const database = getDb();
  if (database) {
    try {
      return database.getAllSync<Budget>('SELECT * FROM budgets ORDER BY id ASC');
    } catch (err) {
      console.warn('getBudgets error:', err);
    }
  }
  return [...memoryBudgets];
}

export function upsertBudget(category: string, limit_amount: number) {
  initDatabase();
  const database = getDb();
  if (database) {
    try {
      database.runSync(
        `INSERT INTO budgets (category, limit_amount) VALUES (?, ?)
         ON CONFLICT(category) DO UPDATE SET limit_amount = excluded.limit_amount`,
        [category, limit_amount]
      );
      return;
    } catch (err) {
      console.warn('upsertBudget error:', err);
    }
  }

  const existingIdx = memoryBudgets.findIndex((b) => b.category === category);
  if (existingIdx >= 0) {
    memoryBudgets[existingIdx].limit_amount = limit_amount;
  } else {
    memoryBudgets.push({
      id: nextBudgetId++,
      category,
      limit_amount,
    });
  }
}

export function deleteBudget(id: number) {
  initDatabase();
  const database = getDb();
  if (database) {
    try {
      database.runSync('DELETE FROM budgets WHERE id = ?', [id]);
      return;
    } catch (err) {
      console.warn('deleteBudget error:', err);
    }
  }
  memoryBudgets = memoryBudgets.filter((b) => b.id !== id);
}

// Backup & Restore
export function exportAllDataJSON(): string {
  const profile = getUserProfile();
  const txs = getTransactions();
  const budgets = getBudgets();

  const data = {
    app: 'RSDVault',
    version: '1.0.0',
    exported_at: new Date().toISOString(),
    profile,
    transactions: txs,
    budgets,
  };

  return JSON.stringify(data, null, 2);
}

export function importAllDataJSON(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (!data || data.app !== 'RSDVault') {
      return false;
    }

    if (data.profile) {
      updateUserProfile(data.profile);
    }

    if (Array.isArray(data.transactions)) {
      if (db) {
        db.runSync('DELETE FROM transactions');
        for (const tx of data.transactions) {
          db.runSync(
            'INSERT INTO transactions (title, amount, type, category, created_at) VALUES (?, ?, ?, ?, ?)',
            [tx.title, tx.amount, tx.type, tx.category, tx.created_at || new Date().toISOString()]
          );
        }
      } else {
        memoryTransactions = [...data.transactions];
      }
    }

    if (Array.isArray(data.budgets)) {
      if (db) {
        db.runSync('DELETE FROM budgets');
        for (const b of data.budgets) {
          db.runSync(
            'INSERT INTO budgets (category, limit_amount) VALUES (?, ?)',
            [b.category, b.limit_amount]
          );
        }
      } else {
        memoryBudgets = [...data.budgets];
      }
    }

    return true;
  } catch (err) {
    console.warn('Import error:', err);
    return false;
  }
}

