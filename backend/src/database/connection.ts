import { uniqBy } from 'lodash';
import { Model, ModelCtor, Sequelize } from 'sequelize-typescript';

import { databaseConfig } from './database.config';
import { Models } from './models';

export const sequelize = new Sequelize(databaseConfig);

const uniqueModels = uniqBy(
  Models.filter((model) => model?.prototype instanceof Model),
  (model) => model.name,
);

sequelize.addModels(uniqueModels as ModelCtor<Model<any, any>>[]);
