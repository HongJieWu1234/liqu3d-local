export function snapQuarterTurn(rotation) {
  const turns = Math.round(rotation / (Math.PI / 2));
  return ((turns % 4 + 4) % 4) * Math.PI / 2;
}
