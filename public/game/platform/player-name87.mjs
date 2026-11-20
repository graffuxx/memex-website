export const normalizePlayerName87=value=>typeof value==='string'?value.trim().replace(/ +/g,' '):'';
export const validPlayerName87=value=>/^[A-Za-z0-9][A-Za-z0-9 _-]{2,23}$/.test(normalizePlayerName87(value));
