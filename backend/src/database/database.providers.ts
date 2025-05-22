import { sequelize } from './connection';

export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async () => {
      try {
        await sequelize.authenticate();
        await sequelize.sync({ force: false, alter: true });

        console.log('Connected to Postgres.');
        return sequelize;
      } catch (error) {
        console.error('Unable to connect to the database:', error);
        throw error;
      }
    },
  },
];
