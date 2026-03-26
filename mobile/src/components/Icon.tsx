import React from 'react';
import { Text } from 'react-native';

const GLYPHS: Record<string, number> = {
  'trending-up': 0xeefc,
  'people': 0xeda0,
  'briefcase': 0xeab2,
  'library': 0xecb6,
  'home': 0xec83,
  'cash': 0xeb06,
  'bar-chart': 0xea70,
  'alert-circle': 0xea14,
  'shield-checkmark': 0xee79,
  'analytics': 0xea1c,
  'wallet': 0xef26,
  'pricetag': 0xedeb,
  'card': 0xeae8,
  'calculator': 0xeacd,
  'globe': 0xec50,
  'chevron-back': 0xeb2a,
  'chevron-forward': 0xeb3c,
  'chevron-up': 0xeb42,
  'chevron-down': 0xeb33,
  'settings-outline': 0xee6d,
  'bar-chart-outline': 0xea71,
  'warning-outline': 0xef2a,
  'notifications-outline': 0xed80,
  'moon-outline': 0xed62,
  'refresh-outline': 0xee19,
  'information-circle-outline': 0xec9a,
  'git-compare': 0xec41,
};

interface Props {
  name: string;
  size: number;
  color: string;
}

export default function Icon({ name, size, color }: Props) {
  const code = GLYPHS[name];
  if (code == null) return null;
  return (
    <Text
      style={{ fontFamily: 'Ionicons', fontSize: size, color }}
      allowFontScaling={false}
      selectable={false}
    >
      {String.fromCodePoint(code)}
    </Text>
  );
}
