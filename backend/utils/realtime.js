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
  if (inquiry.sellerId) io.to(`user:${inquiry.sellerId.toString()}`).emit("inquiry:updated", inquiry);
  if (inquiry.buyerId) io.to(`user:${inquiry.buyerId.toString()}`).emit("inquiry:updated", inquiry);
}

export function emitInquiryCreated(inquiry) {
  if (!io || !inquiry?._id) return;
  if (inquiry.sellerId) io.to(`user:${inquiry.sellerId.toString()}`).emit("inquiry:created", inquiry);
}

