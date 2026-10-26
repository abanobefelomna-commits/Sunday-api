import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './users/user.entity.js';
import { RefreshToken } from './auth/refresh-token.entity.js';
import { Class } from './classes/class.entity.js';
import { Servant } from './servants/servant.entity.js';
import { Child } from './children/child.entity.js';
import { Attendance } from './attendance/attendance.entity.js';
import { Visitation } from './visitations/visitation.entity.js';
import { News } from './news/news.entity.js';

const connectionString =
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.DATABASE_URL ||
  '';

const AppDataSource = new DataSource({
  type: 'postgres',
  ...(connectionString
    ? {
        url: connectionString,
        ssl: { rejectUnauthorized: false },
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 5432),
        username: process.env.DB_USER,
        password: process.env.DB_PASS || process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME,
      }),
  entities: [
    User,
    RefreshToken,
    Class,
    Servant,
    Child,
    Attendance,
    Visitation,
    News,
  ],
  migrations: ['dist/migrations/*.js'],
  synchronize: false,
});

export default AppDataSource;
