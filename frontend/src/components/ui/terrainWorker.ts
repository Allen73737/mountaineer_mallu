import { bakeTerrain } from './terrainMath';

// Bakes the terrain off the main thread: building ~65k vertices with ray-marched shadows takes a few
// hundred milliseconds on a slow laptop, which would otherwise freeze scrolling
self.onmessage = (e: MessageEvent<{ segments: number; size: number; sun: [number, number, number] }>) => {
    const { segments, size, sun } = e.data;
    const bake = bakeTerrain(segments, size, sun);
    (self as unknown as Worker).postMessage(bake, [bake.positions.buffer, bake.light.buffer]);
};
