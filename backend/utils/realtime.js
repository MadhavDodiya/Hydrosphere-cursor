let io = null;

export function setIO(nextIO) {
  io = nextIO;
}

export function getIO() {
  return io;
}

export function emitInquiryUpdated(inquiry) {
  if (!io || !inquiry?._id) return;
  io.to(`inquiry:${inquiry._id.toString()}`).emit("inquiry:updated", inquiry);
  if (inquiry.supplierId) io.to(`user:${inquiry.supplierId.toString()}`).emit("inquiry:updated", inquiry);
  if (inquiry.buyerId) io.to(`user:${inquiry.buyerId.toString()}`).emit("inquiry:updated", inquiry);
}

export function emitInquiryCreated(inquiry) {
  if (!io || !inquiry?._id) return;
  if (inquiry.supplierId) io.to(`user:${inquiry.supplierId.toString()}`).emit("inquiry:created", inquiry);
}
