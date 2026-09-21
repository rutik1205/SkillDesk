const asyncHandler = require('../utils/asyncHandler');
const serviceService = require('../services/serviceService');

const createService = asyncHandler(async (req, res) => {
  const service = await serviceService.createService(req.user._id, req.body);
  res.status(201).json({ success: true, data: { service } });
});

const getServices = asyncHandler(async (req, res) => {
  const result = await serviceService.getServices(req.query);
  res.json({ success: true, data: result });
});

const getServiceById = asyncHandler(async (req, res) => {
  const service = await serviceService.getServiceById(req.params.id);
  res.json({ success: true, data: { service } });
});

const updateService = asyncHandler(async (req, res) => {
  const service = await serviceService.updateService(
    req.params.id,
    req.user._id,
    req.body
  );
  res.json({ success: true, data: { service } });
});

const deleteService = asyncHandler(async (req, res) => {
  const result = await serviceService.deleteService(req.params.id, req.user._id);
  res.json({ success: true, data: result });
});

const getMyServices = asyncHandler(async (req, res) => {
  const services = await serviceService.getMyServices(req.user._id);
  res.json({ success: true, data: { services } });
});

const getFeaturedServices = asyncHandler(async (req, res) => {
  const services = await serviceService.getFeaturedServices();
  res.json({ success: true, data: { services } });
});

module.exports = {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
  getMyServices,
  getFeaturedServices,
};
