require('dotenv').config();

const { createApp } = require('./app');
const { createSupabaseClient } = require('./config/supabase');
const { createModels } = require('./models');

const port = Number(process.env.PORT || 3000);
const app = createApp({
  models: createModels(createSupabaseClient()),
});

app.listen(port, () => {
  console.log(`Library API listening on port ${port}`);
});
