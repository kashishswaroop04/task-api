
import 'dotenv/config';
import express from 'express';
import { readFileSync } from 'node:fs';
import swaggerUi from 'swagger-ui-express';
import { parse } from 'yaml';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { getAllTasksHandler } from './controllers/taskController.js';
import { validateCompletedQuery } from './middleware/validators.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Task API', docs: '/api-docs' });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.get('/tasks', validateCompletedQuery, getAllTasksHandler);
app.use('/api/admin/tasks', adminRoutes);

const openapiText = readFileSync(
  new URL('../openapi.yaml', import.meta.url),
  'utf8'
);

app.get('/openapi.yaml', (req, res) => {
  res.type('application/yaml').send(openapiText);
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(parse(openapiText)));

app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(err.stack);
  }

  if (!err.status) {
    err.status = 500;
    err.message = 'Internal Server Error';
  }

  res.status(err.status).json({ errors: err.message });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
