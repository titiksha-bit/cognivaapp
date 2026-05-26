const mongoose = require('mongoose');
require('dotenv').config();
const HealthMetric = require('./models/HealthMetric');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  await HealthMetric.deleteMany({});
  await HealthMetric.insertMany([
    { userId: "1", metric_type: 'heart_rate', value: 72, unit: 'bpm' },
    { userId: "1", metric_type: 'blood_sugar', value: 98, unit: 'mg/dL' },
    { userId: "1", metric_type: 'spo2', value: 98, unit: '%' }
  ]);
  console.log('Seeded health metrics');
  process.exit();
});