import express from 'express';
import router from './routes.js';

const app = express();
const port = 3000;

app.use(express.json());

app.use("/api", router);
app.use("/api", router);

const startServer = async () => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};

startServer();
