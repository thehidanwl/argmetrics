import React from 'react';
import { View } from 'react-native';

interface Props {
  data: number[];
  color: string;
  width?: number;
  height?: number;
  opacityRange?: [number, number]; // [min, max] — default [0.35, 1]
}

/**
 * Mini gráfico de barras para mostrar tendencia en listas.
 * Normaliza los valores al rango disponible.
 */
export default function Sparkline({ data, color, width = 56, height = 24, opacityRange = [0.35, 1] }: Props) {
  if (data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const [opMin, opMax] = opacityRange;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', width, height, gap: 2 }}>
      {data.map((v, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: Math.max(2, Math.round(((v - min) / range) * (height - 4)) + 2),
            backgroundColor: color,
            opacity: opMin + (opMax - opMin) * (i / Math.max(data.length - 1, 1)),
            borderRadius: 1,
          }}
        />
      ))}
    </View>
  );
}
