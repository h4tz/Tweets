import { app } from './app';
import { config } from './config';

app.listen(config.port, () => {
  console.log(`twitter-backend-ts listening on http://localhost:${config.port}`);
});
