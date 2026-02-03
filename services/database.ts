import * as SQLite from "expo-sqlite";

const DATABASE_NAME = "shofit.db";

export interface User {
  id: number;
  email: string;
  name: string;
  password: string; // In production, this should be hashed
  created_at: string;
}

export interface UserMeasurements {
  id: number;
  user_id: number;
  shoulders: number;
  bust: number;
  waist: number;
  hips: number;
  updated_at: string;
}

export interface UserImage {
  id: number;
  user_id: number;
  image_uri: string;
  image_type: "profile" | "fitting";
  created_at: string;
}

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async init() {
    try {
      this.db = await SQLite.openDatabaseAsync(DATABASE_NAME);
      await this.createTables();
      console.log("Database initialized successfully");
    } catch (error) {
      console.error("Error initializing database:", error);
      throw error;
    }
  }

  private async createTables() {
    if (!this.db) throw new Error("Database not initialized");

    // Users table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Measurements table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS measurements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        shoulders REAL NOT NULL,
        bust REAL NOT NULL,
        waist REAL NOT NULL,
        hips REAL NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );
    `);

    // Images table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        image_uri TEXT NOT NULL,
        image_type TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );
    `);
  }

  // User operations
  async createUser(
    email: string,
    name: string,
    password: string,
  ): Promise<User | null> {
    if (!this.db) throw new Error("Database not initialized");

    try {
      const result = await this.db.runAsync(
        "INSERT INTO users (email, name, password) VALUES (?, ?, ?)",
        [email, name, password],
      );

      if (result.lastInsertRowId) {
        return this.getUserById(result.lastInsertRowId);
      }
      return null;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    if (!this.db) throw new Error("Database not initialized");

    try {
      const result = await this.db.getFirstAsync<User>(
        "SELECT * FROM users WHERE email = ?",
        [email],
      );
      return result || null;
    } catch (error) {
      console.error("Error getting user by email:", error);
      return null;
    }
  }

  async getUserById(id: number): Promise<User | null> {
    if (!this.db) throw new Error("Database not initialized");

    try {
      const result = await this.db.getFirstAsync<User>(
        "SELECT * FROM users WHERE id = ?",
        [id],
      );
      return result || null;
    } catch (error) {
      console.error("Error getting user by id:", error);
      return null;
    }
  }

  async verifyUser(email: string, password: string): Promise<User | null> {
    if (!this.db) throw new Error("Database not initialized");

    try {
      const user = await this.getUserByEmail(email);
      if (user && user.password === password) {
        return user;
      }
      return null;
    } catch (error) {
      console.error("Error verifying user:", error);
      return null;
    }
  }

  // Measurements operations
  async saveMeasurements(
    userId: number,
    measurements: {
      shoulders: number;
      bust: number;
      waist: number;
      hips: number;
    },
  ): Promise<boolean> {
    if (!this.db) throw new Error("Database not initialized");

    try {
      // Check if measurements exist
      const existing = await this.getMeasurements(userId);

      if (existing) {
        // Update existing measurements
        await this.db.runAsync(
          "UPDATE measurements SET shoulders = ?, bust = ?, waist = ?, hips = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?",
          [
            measurements.shoulders,
            measurements.bust,
            measurements.waist,
            measurements.hips,
            userId,
          ],
        );
      } else {
        // Insert new measurements
        await this.db.runAsync(
          "INSERT INTO measurements (user_id, shoulders, bust, waist, hips) VALUES (?, ?, ?, ?, ?)",
          [
            userId,
            measurements.shoulders,
            measurements.bust,
            measurements.waist,
            measurements.hips,
          ],
        );
      }
      return true;
    } catch (error) {
      console.error("Error saving measurements:", error);
      return false;
    }
  }

  async getMeasurements(userId: number): Promise<UserMeasurements | null> {
    if (!this.db) throw new Error("Database not initialized");

    try {
      const result = await this.db.getFirstAsync<UserMeasurements>(
        "SELECT * FROM measurements WHERE user_id = ?",
        [userId],
      );
      return result || null;
    } catch (error) {
      console.error("Error getting measurements:", error);
      return null;
    }
  }

  // Image operations
  async saveImage(
    userId: number,
    imageUri: string,
    imageType: "profile" | "fitting",
  ): Promise<boolean> {
    if (!this.db) throw new Error("Database not initialized");

    try {
      await this.db.runAsync(
        "INSERT INTO images (user_id, image_uri, image_type) VALUES (?, ?, ?)",
        [userId, imageUri, imageType],
      );
      return true;
    } catch (error) {
      console.error("Error saving image:", error);
      return false;
    }
  }

  async getImages(
    userId: number,
    imageType?: "profile" | "fitting",
  ): Promise<UserImage[]> {
    if (!this.db) throw new Error("Database not initialized");

    try {
      let query = "SELECT * FROM images WHERE user_id = ?";
      const params: any[] = [userId];

      if (imageType) {
        query += " AND image_type = ?";
        params.push(imageType);
      }

      query += " ORDER BY created_at DESC";

      const results = await this.db.getAllAsync<UserImage>(query, params);
      return results || [];
    } catch (error) {
      console.error("Error getting images:", error);
      return [];
    }
  }

  async deleteImage(imageId: number): Promise<boolean> {
    if (!this.db) throw new Error("Database not initialized");

    try {
      await this.db.runAsync("DELETE FROM images WHERE id = ?", [imageId]);
      return true;
    } catch (error) {
      console.error("Error deleting image:", error);
      return false;
    }
  }

  async clearUserData(userId: number): Promise<boolean> {
    if (!this.db) throw new Error("Database not initialized");

    try {
      await this.db.runAsync("DELETE FROM measurements WHERE user_id = ?", [
        userId,
      ]);
      await this.db.runAsync("DELETE FROM images WHERE user_id = ?", [userId]);
      return true;
    } catch (error) {
      console.error("Error clearing user data:", error);
      return false;
    }
  }
}

export const dbService = new DatabaseService();
