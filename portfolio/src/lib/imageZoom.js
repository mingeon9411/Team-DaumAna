export const clampZoom = (value) => Math.min(400, Math.max(1, Number.isFinite(value) ? value : 100));

export const fitZoom = (image, viewport) => clampZoom(Math.floor(Math.min(
  (viewport.width - 32) / image.width,
  (viewport.height - 32) / image.height,
  1,
) * 100));
