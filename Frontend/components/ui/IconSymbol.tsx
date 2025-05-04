import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';

interface IconSymbolProps {
  name: string;
  size: number;
  color: string;
  style?: any;
}

export const IconSymbol = ({ name, size, color, style }: IconSymbolProps) => {
  return <MaterialIcons name={name as any} size={size} color={color} style={style} />;
};