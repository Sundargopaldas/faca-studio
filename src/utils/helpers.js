const crypto = require('crypto');
const path = require('path');

// Gerar ID único
const generateId = (prefix = '') => {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(4).toString('hex');
  return `${prefix}${timestamp}_${random}`;
};

// Gerar nome de arquivo único
const generateFileName = (originalName, prefix = '') => {
  const ext = path.extname(originalName);
  const name = path.basename(originalName, ext);
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString('hex');
  
  return `${prefix}${name}_${timestamp}_${random}${ext}`;
};

// Formatar data
const formatDate = (date, format = 'pt-BR') => {
  if (!date) return null;
  
  const d = new Date(date);
  
  if (format === 'pt-BR') {
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  if (format === 'ISO') {
    return d.toISOString();
  }
  
  return d.toString();
};

// Formatar moeda
const formatCurrency = (value, currency = 'BRL') => {
  if (value === null || value === undefined) return 'R$ 0,00';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency
  }).format(value);
};

// Formatar tamanho de arquivo
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Calcular porcentagem
const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

// Gerar slug
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .trim();
};

// Validar URL
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// Gerar hash
const generateHash = (data, algorithm = 'sha256') => {
  return crypto.createHash(algorithm).update(data).digest('hex');
};

// Gerar token aleatório
const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Converter pixels para cm
const pixelsToCm = (pixels, dpi = 96) => {
  return (pixels / dpi) * 2.54;
};

// Converter cm para pixels
const cmToPixels = (cm, dpi = 96) => {
  return (cm / 2.54) * dpi;
};

// Calcular área
const calculateArea = (width, height) => {
  return width * height;
};

// Calcular perímetro
const calculatePerimeter = (width, height) => {
  return 2 * (width + height);
};

// Calcular volume
const calculateVolume = (width, height, depth) => {
  return width * height * depth;
};

// Arredondar para casas decimais
const roundTo = (value, decimals = 2) => {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

// Verificar se é número
const isNumber = (value) => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

// Verificar se é inteiro
const isInteger = (value) => {
  return Number.isInteger(Number(value));
};

// Verificar se é positivo
const isPositive = (value) => {
  return Number(value) > 0;
};

// Verificar se está no range
const isInRange = (value, min, max) => {
  const num = Number(value);
  return num >= min && num <= max;
};

// Limitar string
const limitString = (str, maxLength = 100, suffix = '...') => {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - suffix.length) + suffix;
};

// Capitalizar primeira letra
const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Capitalizar todas as palavras
const capitalizeWords = (str) => {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

// Remover acentos
const removeAccents = (str) => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

// Gerar cor aleatória
const generateRandomColor = () => {
  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Gerar gradiente CSS
const generateGradient = (color1, color2, direction = '135deg') => {
  return `linear-gradient(${direction}, ${color1} 0%, ${color2} 100%)`;
};

// Debounce function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function
const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Sleep function
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Retry function
const retry = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await sleep(delay);
      return retry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

// Deep clone
const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

// Merge objects
const mergeObjects = (target, ...sources) => {
  if (!sources.length) return target;
  const source = sources.shift();
  
  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeObjects(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }
  
  return mergeObjects(target, ...sources);
};

// Check if is object
const isObject = (item) => {
  return item && typeof item === 'object' && !Array.isArray(item);
};

module.exports = {
  generateId,
  generateFileName,
  formatDate,
  formatCurrency,
  formatFileSize,
  calculatePercentage,
  generateSlug,
  isValidUrl,
  generateHash,
  generateToken,
  pixelsToCm,
  cmToPixels,
  calculateArea,
  calculatePerimeter,
  calculateVolume,
  roundTo,
  isNumber,
  isInteger,
  isPositive,
  isInRange,
  limitString,
  capitalize,
  capitalizeWords,
  removeAccents,
  generateRandomColor,
  generateGradient,
  debounce,
  throttle,
  sleep,
  retry,
  deepClone,
  mergeObjects,
  isObject
};

