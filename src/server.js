require('dotenv').config();

const { createApp } = require('./app');
const { createSupabaseClient } = require('./config/supabase');
const { createModels } = require('./models');

const app = createApp({
  models: createModels(createSupabaseClient()),
});

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => {
    console.log(`Library API listening on port ${port}`);
  });
}

module.exports = app;
