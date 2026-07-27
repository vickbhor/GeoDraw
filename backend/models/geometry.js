const mongoose = require('mongoose');

const geometrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['Point', 'LineString', 'Polygon'], required: true },
  color: { type: String, default: '#3388ff' },
  geojson: { type: Object, required: true } // full GeoJSON Feature
}, { timestamps: true });

module.exports = mongoose.model('Geometry', geometrySchema);