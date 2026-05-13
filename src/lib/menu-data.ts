// Cardápio Havanna — cada item referencia uma página (image em /menu/page-N.jpg)
// e a posição (x, y) em % onde o preço deve aparecer sobreposto.
// As posições foram calibradas a partir da arte original do PDF.

export type MenuItem = {
  id: string;
  label: string; // nome amigável para o admin
  section: string;
  page: number; // 2..6
  x: number; // 0..100 (%) — borda esquerda do badge de preço
  y: number; // 0..100 (%) — linha vertical do badge (alinhada ao título do item)
};

export const ITEMS: MenuItem[] = [
  // ====== PÁGINA 2 — Bebidas Quentes (coluna esquerda, x=24.3%) ======
  { id: "espresso-havanna", label: "Espresso Havanna - Blend Exclusivo (50ml)", section: "Bebidas Quentes", page: 2, x: 22.53, y: 18.36 },
  { id: "espresso-doppio", label: "Espresso Doppio (130ml)", section: "Bebidas Quentes", page: 2, x: 22.53, y: 27.31 },
  { id: "espresso-macchiato", label: "Espresso Macchiato (50ml)", section: "Bebidas Quentes", page: 2, x: 22.53, y: 32.1 },
  { id: "espresso-macchiato-130", label: "Espresso Macchiato (130ml)", section: "Bebidas Quentes", page: 2, x: 26.72, y: 32.1 },
  { id: "espresso-dulce", label: "Espresso com Dulce de Leche (50ml)", section: "Bebidas Quentes", page: 2, x: 22.53, y: 36.6 },
  { id: "cafe-latte", label: "Café Latte (130ml)", section: "Bebidas Quentes", page: 2, x: 22.53, y: 43.61 },
  { id: "cappuccino-italiano", label: "Cappuccino Italiano (130ml)", section: "Bebidas Quentes", page: 2, x: 22.53, y: 49.26 },
  { id: "cappuccino-vienense", label: "Cappuccino Vienense (240ml)", section: "Bebidas Quentes", page: 2, x: 22.53, y: 55.07 },
  { id: "cappuccino-havanna", label: "Cappuccino Havanna (130ml)", section: "Bebidas Quentes", page: 2, x: 22.53, y: 60.72 },

  // ====== PÁGINA 2 — Bebidas Quentes (coluna direita, x=93.2%) ======
  { id: "3coracoes-cappuccino", label: "3 Corações Cappuccino (160ml)", section: "Bebidas Quentes", page: 2, x: 91.37, y: 25.54 },
  { id: "mocha-dulce", label: "Mocha com Dulce de Leche (240ml)", section: "Bebidas Quentes", page: 2, x: 91.37, y: 31.07 },
  { id: "dulce-quente", label: "Dulce de Leche Quente (240ml)", section: "Bebidas Quentes", page: 2, x: 91.37, y: 36.94 },
  { id: "chocolate-quente", label: "Chocolate Quente (150ml)", section: "Bebidas Quentes", page: 2, x: 91.37, y: 42.7 },
  { id: "choco-havanna", label: "Choco Havanna (130ml)", section: "Bebidas Quentes", page: 2, x: 91.37, y: 48.29 },
  { id: "cha-importado", label: "Chá Importado (150ml)", section: "Bebidas Quentes", page: 2, x: 91.37, y: 53.93 },

  // ====== PÁGINA 2 — Extras (caixa inferior esquerda) ======
  { id: "extra-chantilly", label: "Extra: Chantilly (35g)", section: "Extras", page: 2, x: 5.97, y: 86.09 },
  { id: "extra-dulce", label: "Extra: Dulce de Leche (50g)", section: "Extras", page: 2, x: 12.7, y: 86.09 },
  { id: "extra-leite-vegetal", label: "Extra: Leite Vegetal A Tal da Castanha (50ml)", section: "Extras", page: 2, x: 20.03, y: 86.09 },

  // ====== PÁGINA 2 — Para Levar (coluna direita inferior) ======
  { id: "cafe-3coracoes-moido", label: "Café 3 Corações Havanna Torrado e Moído (250g)", section: "Para Levar", page: 2, x: 91.37, y: 73.15 },
  { id: "capsulas-cappuccino", label: "Cappuccino Doce de Leite Havanna 3 Corações (10 cápsulas)", section: "Para Levar", page: 2, x: 91.37, y: 85.4 },

  // ====== PÁGINA 3 — Bebidas Geladas (coluna esquerda, x=18%) ======
  { id: "agua-sem-gas", label: "Água Sem Gás", section: "Bebidas Geladas", page: 3, x: 16.24, y: 19.58 },
  { id: "agua-com-gas", label: "Água Com Gás", section: "Bebidas Geladas", page: 3, x: 16.24, y: 21.75 },
  { id: "refrigerante", label: "Refrigerante (350ml)", section: "Bebidas Geladas", page: 3, x: 16.24, y: 17.42 },
  { id: "suco", label: "Suco (300ml)", section: "Bebidas Geladas", page: 3, x: 16.24, y: 25.11 },

  // ====== PÁGINA 3 — Bebidas Geladas (coluna meio, x=42%) ======
  { id: "soda-italiana", label: "Soda Italiana (380ml)", section: "Bebidas Geladas", page: 3, x: 41.19, y: 17.42 },
  { id: "cha-batido-gelado", label: "Chá Batido & Gelado (480ml)", section: "Bebidas Geladas", page: 3, x: 41.19, y: 26.08 },
  { id: "alfajor-au-cafe", label: "Alfajor au Café (200ml)", section: "Bebidas Geladas", page: 3, x: 41.19, y: 33.49 },
  { id: "cappuccino-helado", label: "Cappuccino Helado Dulce de Leche (330ml)", section: "Bebidas Geladas", page: 3, x: 41.19, y: 40.34 },
  { id: "havanna-shake", label: "Havanna Shake", section: "Bebidas Geladas", page: 3, x: 41.11, y: 47.92 },
  { id: "latte-helado", label: "Latte Helado (300ml)", section: "Bebidas Geladas", page: 3, x: 41.19, y: 53.91 },
  { id: "milkshake-choco-dulce", label: "Milk Shake de Chocolate com Dulce de Leche (380ml)", section: "Bebidas Geladas", page: 3, x: 41.19, y: 59.78 },

  // ====== PÁGINA 3 — Vannaccinos (3 sabores × sem/com café) ======
  { id: "vanna-dulce-sem-cafe", label: "Vannaccino Dulce de Leche — Sem Café", section: "Vannaccinos", page: 3, x: 86.3, y: 42.27 },
  { id: "vanna-dulce-com-cafe", label: "Vannaccino Dulce de Leche — Com Café", section: "Vannaccinos", page: 3, x: 90.65, y: 42.27 },
  { id: "vanna-choco-sem-cafe", label: "Vannaccino Chocolate c/ Dulce — Sem Café", section: "Vannaccinos", page: 3, x: 86.3, y: 42.27 },
  { id: "vanna-choco-com-cafe", label: "Vannaccino Chocolate c/ Dulce — Com Café", section: "Vannaccinos", page: 3, x: 90.65, y: 42.27 },
  { id: "vanna-morango-sem-cafe", label: "Vannaccino Morango c/ Dulce — Sem Café", section: "Vannaccinos", page: 3, x: 87, y: 62.0 },
  { id: "vanna-morango-com-cafe", label: "Vannaccino Morango c/ Dulce — Com Café", section: "Vannaccinos", page: 3, x: 90.65, y: 42.27 },
  { id: "iced-yopro-sem-cafe", label: "Iced YoPRO Dulce Zero — Sem Café (400ml)", section: "Vannaccinos", page: 3, x: 87, y: 84.0 },
  { id: "iced-yopro-com-cafe", label: "Iced YoPRO Dulce Zero — Com Café (400ml)", section: "Vannaccinos", page: 3, x: 90.65, y: 42.27 },

  // ====== PÁGINA 4 — Clássicos Argentinos (coluna esquerda, x=20%) ======
  { id: "empanada-carne", label: "Empanada Carne Suave (100g)", section: "Clássicos Argentinos", page: 4, x: 20.31, y: 28.82 },
  { id: "empanada-presunto-queijo", label: "Empanada Presunto e Queijo (100g)", section: "Clássicos Argentinos", page: 4, x: 20.31, y: 33.38 },
  { id: "empanada-queijo-cebola", label: "Empanada Queijo com Cebola (100g)", section: "Clássicos Argentinos", page: 4, x: 20.31, y: 21.24 },
  { id: "medialuna-doce", label: "Medialuna Doce (2 unid., 70g)", section: "Clássicos Argentinos", page: 4, x: 20.31, y: 37.88 },
  { id: "medialuna-salgada", label: "Medialuna Salgada (2 unid., 70g)", section: "Clássicos Argentinos", page: 4, x: 20.31, y: 37.88 },
  { id: "medialuna-combo", label: "Medialuna Combo (1 doce + 1 salgada)", section: "Clássicos Argentinos", page: 4, x: 20.31, y: 37.88 },

  // ====== PÁGINA 4 — Clássicos Brasileiros (coluna meio, x=43%) ======
  { id: "pdq-multigraos", label: "Pão de Queijo Multigrãos (90g)", section: "Clássicos Brasileiros", page: 4, x: 41.15, y: 56.87 },
  { id: "pdq-tradicional", label: "Pão de Queijo Tradicional (70g)", section: "Clássicos Brasileiros", page: 4, x: 41.15, y: 58.64 },
  { id: "pdq-recheado", label: "Pão de Queijo Recheado c/ Doce de Leite (75g)", section: "Clássicos Brasileiros", page: 4, x: 41.15, y: 60.35 },
  { id: "mini-pdq", label: "Mini Pão de Queijo - Porção 8 unid. (120g)", section: "Clássicos Brasileiros", page: 4, x: 41.15, y: 62.06 },
  { id: "coxinha-frango", label: "Coxinha de Frango com Requeijão (110g)", section: "Clássicos Brasileiros", page: 4, x: 41.15, y: 64.0 },
  { id: "coxinha-costela", label: "Coxinha de Costela com Requeijão (110g)", section: "Clássicos Brasileiros", page: 4, x: 41.15, y: 68.5 },
  { id: "bauruzinho", label: "Bauruzinho de Presunto e Queijo (130g)", section: "Clássicos Brasileiros", page: 4, x: 41.15, y: 73.06 },
  { id: "folhado-frango", label: "Folhado de Frango com Azeitona (130g)", section: "Clássicos Brasileiros", page: 4, x: 41.15, y: 77.45 },
  { id: "torta-frango", label: "Torta de Frango — fatia (150g)", section: "Clássicos Brasileiros", page: 4, x: 41.15, y: 82.24 },
  { id: "torta-palmito", label: "Torta de Palmito — fatia (150g)", section: "Clássicos Brasileiros", page: 4, x: 41.15, y: 86.97 },

  // ====== PÁGINA 4 — Especiais Havanna (coluna direita, x=92%) ======
  { id: "croissant-serrano", label: "Croissant Serrano (135g)", section: "Especiais Havanna", page: 4, x: 91.13, y: 68.16 },
  { id: "croissant-porteno", label: "Croissant Porteño (148g)", section: "Especiais Havanna", page: 4, x: 91.13, y: 75.4 },
  { id: "choripan", label: "Choripan (235g)", section: "Especiais Havanna", page: 4, x: 91.13, y: 82.35 },
  { id: "croque-el-senor", label: "Croque El Señor (200g)", section: "Especiais Havanna", page: 4, x: 91.13, y: 88.45 },
  { id: "palermo-soho", label: "Palermo Soho (130g)", section: "Especiais Havanna", page: 4, x: 91.13, y: 88.45 },
  { id: "torrada-petropolis", label: "Torrada Petrópolis (150g)", section: "Especiais Havanna", page: 4, x: 91.13, y: 88.45 },

  // ====== PÁGINA 5 — Doces (coluna esquerda, x=22%) ======
  { id: "bolo-chocolatudo", label: "Bolo Chocolatudo (140g)", section: "Doces", page: 5, x: 21.52, y: 13.88 },
  { id: "bolo-red-velvet", label: "Bolo Red Velvet (170g)", section: "Doces", page: 5, x: 21.52, y: 22.26 },
  { id: "brownie-dulce", label: "Brownie com Dulce de Leche (185g)", section: "Doces", page: 5, x: 21.52, y: 28.65 },
  { id: "torta-havanna", label: "Torta Havanna (120g)", section: "Doces", page: 5, x: 21.52, y: 35.21 },
  { id: "torta-havanna-zero", label: "Torta Havanna Zero (120g)", section: "Doces", page: 5, x: 21.52, y: 40.51 },
  { id: "torta-la-chocolina", label: "Torta La Chocolina (100g)", section: "Doces", page: 5, x: 21.52, y: 47.52 },
  { id: "mini-torta-dulce", label: "Mini Torta Dulce de Leche (90g)", section: "Doces", page: 5, x: 21.52, y: 53.51 },
  { id: "mini-torta-amendoas", label: "Mini Torta de Amêndoas (90g)", section: "Doces", page: 5, x: 21.52, y: 59.61 },
  { id: "mini-torta-limao", label: "Mini Torta de Limão (90g)", section: "Doces", page: 5, x: 21.52, y: 66.62 },
  { id: "mini-torta-banana", label: "Mini Torta Crumble de Banana (90g)", section: "Doces", page: 5, x: 21.52, y: 72.26 },
  { id: "petit-gateau", label: "Petit Gateau de Dulce de Leche (140g)", section: "Doces", page: 5, x: 21.52, y: 84.64 },
  { id: "churros", label: "Churros (4 unid.)", section: "Doces", page: 5, x: 21.52, y: 79.16 },
  { id: "cubanito-2", label: "Cubanito 2 unid.", section: "Doces", page: 5, x: 17.13, y: 90.45 },
  { id: "cubanito-4", label: "Cubanito 4 unid.", section: "Doces", page: 5, x: 21.52, y: 90.45 },

  // ====== PÁGINA 5 — Tortas para Levar (coluna direita, x=92%) ======
  { id: "bolo-chocolatudo-grande", label: "Bolo Chocolatudo (1.4 kg)", section: "Tortas para Levar", page: 5, x: 70.9, y: 41.11 },
  { id: "torta-havanna-grande", label: "Torta Havanna (1.1 kg)", section: "Tortas para Levar", page: 5, x: 70.9, y: 49.03 },
  { id: "torta-havanna-zero-grande", label: "Torta Havanna Zero (1.1 kg)", section: "Tortas para Levar", page: 5, x: 70.9, y: 54.73 },

  // ====== PÁGINA 6 — Alfajores (coluna esquerda, x=24%) ======
  { id: "alfajor-chocolate-leite", label: "Alfajor Solito Chocolate ao Leite (55g)", section: "Alfajores", page: 6, x: 20.31, y: 19.64 },
  { id: "alfajor-chocolate-branco", label: "Alfajor Solito Chocolate Branco (55g)", section: "Alfajores", page: 6, x: 20.31, y: 21.35 },
  { id: "alfajor-merengue", label: "Alfajor Solito Merengue (47g)", section: "Alfajores", page: 6, x: 20.31, y: 16.39 },
  { id: "alfajor-nozes", label: "Alfajor Solito Nozes (55g)", section: "Alfajores", page: 6, x: 20.31, y: 23.46 },
  { id: "alfajor-70cacao", label: "Alfajor Solito 70% Cacao (65g)", section: "Alfajores", page: 6, x: 20.31, y: 32.81 },
  { id: "alfajor-mar-del-plata", label: "Alfajor Mar Del Plata (90g)", section: "Alfajores", page: 6, x: 20.31, y: 39.71 },
  { id: "alfajor-super-dulce", label: "Alfajor Super Dulce de Leche (70g)", section: "Alfajores", page: 6, x: 20.31, y: 47.58 },
  { id: "alfajor-pistache-dubai", label: "Alfajor Pistache Dubai (65g)", section: "Alfajores", page: 6, x: 20.31, y: 47.58 },
  { id: "mini-alfajor-leite", label: "Mini Alfajor Solito — Chocolate ao Leite (25g)", section: "Alfajores", page: 6, x: 24, y: 78.0 },
  { id: "mini-alfajor-branco", label: "Mini Alfajor Solito — Chocolate Branco (25g)", section: "Alfajores", page: 6, x: 24, y: 80.5 },
  { id: "alfajor-vegano", label: "Alfajor Vegano (70g)", section: "Alfajores", page: 6, x: 41.23, y: 30.87 },
  { id: "alfajor-sem-acucar", label: "Alfajor Sem Açúcar (70g)", section: "Alfajores", page: 6, x: 41.23, y: 37.37 },

  // ====== PÁGINA 6 — Clássicos & Dulce de Leche (coluna meio, x=68%) ======
  { id: "barrita", label: "Barrita (30g)", section: "Clássicos", page: 6, x: 70.29, y: 11.32 },
  { id: "galletita-limon", label: "Galletita de Limón (35g)", section: "Clássicos", page: 6, x: 70.29, y: 15.31 },
  { id: "havannet-solito", label: "Havannet Solito (38g)", section: "Clássicos", page: 6, x: 70.29, y: 21.24 },
  { id: "caixa-6-havannets", label: "Caixa com 6 Havannets", section: "Clássicos", page: 6, x: 70.29, y: 27.0 },

  { id: "ddl-tradicional-170", label: "Dulce de Leche Tradicional — Pote 170g", section: "Dulce de Leche", page: 6, x: 70.29, y: 40.22 },
  { id: "ddl-tradicional-420", label: "Dulce de Leche Tradicional — Pote 420g", section: "Dulce de Leche", page: 6, x: 70.29, y: 43.47 },
  { id: "ddl-tradicional-700", label: "Dulce de Leche Tradicional — Pote 700g", section: "Dulce de Leche", page: 6, x: 70.29, y: 46.21 },
  { id: "ddl-zero-acucar", label: "Dulce de Leche Zero Açúcar — Pote 420g", section: "Dulce de Leche", page: 6, x: 70.29, y: 53.91 },
  { id: "ddl-zero-lactose", label: "Dulce de Leche Zero Lactose — Pote 420g", section: "Dulce de Leche", page: 6, x: 70.29, y: 59.21 },
  { id: "caramelo-salgado", label: "Caramelo Salgado Mar Del Plata — Pote 420g", section: "Dulce de Leche", page: 6, x: 70.29, y: 66.85 },
  { id: "creme-pistache", label: "Creme de Pistache Dubai — Pote 170g", section: "Dulce de Leche", page: 6, x: 68, y: 96.0 },

  // ====== PÁGINA 6 — Caixas de Alfajores & Chocolates (coluna direita, x=93%) ======
  { id: "caixa-4-alfajores", label: "Caixa com 4 Alfajores (70%/Mar del Plata/Sem Açúcar/Pistache)", section: "Caixas", page: 6, x: 91.13, y: 12.97 },
  { id: "caixa-6-leite", label: "Caixa com 6 Alfajores — Chocolate ao Leite", section: "Caixas", page: 6, x: 90.81, y: 15.91 },
  { id: "caixa-6-merengue", label: "Caixa com 6 Alfajores — Merengue", section: "Caixas", page: 6, x: 91.13, y: 17.82 },
  { id: "caixa-6-misto", label: "Caixa com 6 Alfajores — Misto", section: "Caixas", page: 6, x: 90.85, y: 20.47 },
  { id: "caixa-12-leite", label: "Caixa com 12 Alfajores — Chocolate ao Leite", section: "Caixas", page: 6, x: 90.89, y: 28.28 },
  { id: "caixa-12-misto", label: "Caixa com 12 Alfajores — Misto", section: "Caixas", page: 6, x: 91.13, y: 40.22 },
  { id: "havannitas", label: "Havannitas (9g)", section: "Chocolates", page: 6, x: 93, y: 64.5 },
];

// Páginas 1 e 7 são páginas únicas (capa/contracapa) com proporção retrato.
// Páginas 2 a 6 são spreads duplos com proporção paisagem.
const SPREAD_ASPECT = 3308 / 2339;
const SINGLE_ASPECT = 1654 / 2339;

export const PAGES = [
  { num: 1, src: "/menu/page-1.jpg", aspect: SINGLE_ASPECT },
  { num: 2, src: "/menu/page-2.jpg", aspect: SPREAD_ASPECT },
  { num: 3, src: "/menu/page-3.jpg", aspect: SPREAD_ASPECT },
  { num: 4, src: "/menu/page-4.jpg", aspect: SPREAD_ASPECT },
  { num: 5, src: "/menu/page-5.jpg", aspect: SPREAD_ASPECT },
  { num: 6, src: "/menu/page-6.jpg", aspect: SPREAD_ASPECT },
  { num: 7, src: "/menu/page-7.jpg", aspect: SINGLE_ASPECT },
];

export const PAGE_ASPECT = SPREAD_ASPECT; // padrão (spread)

export function formatPrice(v: number | null | undefined): string {
  if (v == null || isNaN(v)) return "";
  return `R$ ${v.toFixed(2).replace(".", ",")}`;
}
