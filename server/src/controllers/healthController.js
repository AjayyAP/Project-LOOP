function getHealthStatus(_request, response) {
  response.status(200).json({
    success: true,
    message: 'Server running successfully',
  });
}

export { getHealthStatus };
