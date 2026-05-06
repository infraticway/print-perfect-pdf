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
  // ====== PÁGINA 2 — Bebidas Quentes (coluna esquerda) ======
  { id: "espresso-havanna", label: "Espresso Havanna - Blend Exclusivo (50ml)", section: "Bebidas Quentes", page: 2, x: 22, y: 20.4 },
  { id: "espresso-doppio", label: "Espresso Doppio (130ml)", section: "Bebidas Quentes", page: 2, x: 22, y: 29.7 },
  { id: "espresso-macchiato", label: "Espresso Macchiato", section: "Bebidas Quentes", page: 2, x: 22, y: 35.2 },
  { id: "espresso-dulce", label: "Espresso com Dulce de Leche (50ml)", section: "Bebidas Quentes", page: 2, x: 22, y: 41 },
  { id: "cafe-latte", label: "Café Latte (130ml)", section: "Bebidas Quentes", page: 2, x: 22, y: 49.2 },
  { id: "cappuccino-italiano", label: "Cappuccino Italiano (130ml)", section: "Bebidas Quentes", page: 2, x: 22, y: 56.4 },
  { id: "cappuccino-vienense", label: "Cappuccino Vienense (240ml)", section: "Bebidas Quentes", page: 2, x: 22, y: 63.6 },
  { id: "cappuccino-havanna", label: "Cappuccino Havanna (130ml)", section: "Bebidas Quentes", page: 2, x: 22, y: 70.8 },

  // ====== PÁGINA 2 — Bebidas Quentes (coluna direita) ======
  { id: "3coracoes-cappuccino", label: "3 Corações Cappuccino (160ml)", section: "Bebidas Quentes", page: 2, x: 92, y: 25.5 },
  { id: "mocha-dulce", label: "Mocha com Dulce de Leche (240ml)", section: "Bebidas Quentes", page: 2, x: 92, y: 31.5 },
  { id: "dulce-quente", label: "Dulce de Leche Quente (240ml)", section: "Bebidas Quentes", page: 2, x: 92, y: 38 },
  { id: "chocolate-quente", label: "Chocolate Quente (150ml)", section: "Bebidas Quentes", page: 2, x: 92, y: 43.5 },
  { id: "choco-havanna", label: "Choco Havanna (130ml)", section: "Bebidas Quentes", page: 2, x: 92, y: 49 },
  { id: "cha-importado", label: "Chá Importado (150ml)", section: "Bebidas Quentes", page: 2, x: 92, y: 54.5 },

  // ====== PÁGINA 2 — Extras ======
  { id: "extra-chantilly", label: "Extra: Chantilly (35g)", section: "Extras", page: 2, x: 18, y: 91 },
  { id: "extra-dulce", label: "Extra: Dulce de Leche (50g)", section: "Extras", page: 2, x: 32, y: 91 },
  { id: "extra-leite-vegetal", label: "Extra: Leite Vegetal A Tal da Castanha (50ml)", section: "Extras", page: 2, x: 46, y: 91 },

  // ====== PÁGINA 2 — Para Levar ======
  { id: "cafe-3coracoes-moido", label: "Café 3 Corações Havanna Torrado e Moído (250g)", section: "Para Levar", page: 2, x: 36, y: 79.5 },
  { id: "capsulas-cappuccino", label: "Cappuccino Doce de Leite Havanna 3 Corações (10 cápsulas)", section: "Para Levar", page: 2, x: 36, y: 91.8 },

  // ====== PÁGINA 3 — Bebidas Geladas (coluna esquerda) ======
  { id: "agua-sem-gas", label: "Água Sem Gás", section: "Bebidas Geladas", page: 3, x: 22, y: 18.5 },
  { id: "agua-com-gas", label: "Água Com Gás", section: "Bebidas Geladas", page: 3, x: 22, y: 21.7 },
  { id: "refrigerante", label: "Refrigerante (350ml)", section: "Bebidas Geladas", page: 3, x: 22, y: 25.5 },
  { id: "suco", label: "Suco (300ml)", section: "Bebidas Geladas", page: 3, x: 22, y: 32.7 },

  // ====== PÁGINA 3 — Bebidas Geladas (coluna meio) ======
  { id: "soda-italiana", label: "Soda Italiana (380ml)", section: "Bebidas Geladas", page: 3, x: 51, y: 18.5 },
  { id: "cha-batido-gelado", label: "Chá Batido & Gelado (480ml)", section: "Bebidas Geladas", page: 3, x: 51, y: 30.5 },
  { id: "alfajor-au-cafe", label: "Alfajor au Café (200ml)", section: "Bebidas Geladas", page: 3, x: 51, y: 43 },
  { id: "cappuccino-helado", label: "Cappuccino Helado Dulce de Leche (330ml)", section: "Bebidas Geladas", page: 3, x: 51, y: 53.5 },
  { id: "havanna-shake", label: "Havanna Shake", section: "Bebidas Geladas", page: 3, x: 51, y: 65 },
  { id: "latte-helado", label: "Latte Helado (300ml)", section: "Bebidas Geladas", page: 3, x: 51, y: 75 },
  { id: "milkshake-choco-dulce", label: "Milk Shake de Chocolate com Dulce de Leche (380ml)", section: "Bebidas Geladas", page: 3, x: 51, y: 83 },

  // ====== PÁGINA 3 — Vannaccinos ======
  { id: "vanna-dulce-sem-cafe", label: "Vannaccino Dulce de Leche — Sem Café", section: "Vannaccinos", page: 3, x: 88, y: 33.5 },
  { id: "vanna-dulce-com-cafe", label: "Vannaccino Dulce de Leche — Com Café", section: "Vannaccinos", page: 3, x: 96, y: 33.5 },
  { id: "vanna-choco-sem-cafe", label: "Vannaccino Chocolate c/ Dulce — Sem Café", section: "Vannaccinos", page: 3, x: 88, y: 39.5 },
  { id: "vanna-choco-com-cafe", label: "Vannaccino Chocolate c/ Dulce — Com Café", section: "Vannaccinos", page: 3, x: 96, y: 39.5 },
  { id: "vanna-morango-sem-cafe", label: "Vannaccino Morango c/ Dulce — Sem Café", section: "Vannaccinos", page: 3, x: 88, y: 45.5 },
  { id: "vanna-morango-com-cafe", label: "Vannaccino Morango c/ Dulce — Com Café", section: "Vannaccinos", page: 3, x: 96, y: 45.5 },
  { id: "iced-yopro-sem-cafe", label: "Iced YoPRO Dulce Zero — Sem Café (400ml)", section: "Vannaccinos", page: 3, x: 75, y: 87 },
  { id: "iced-yopro-com-cafe", label: "Iced YoPRO Dulce Zero — Com Café (400ml)", section: "Vannaccinos", page: 3, x: 82, y: 87 },

  // ====== PÁGINA 4 — Clássicos Argentinos ======
  { id: "empanada-carne", label: "Empanada Carne Suave (100g)", section: "Clássicos Argentinos", page: 4, x: 28, y: 23.5 },
  { id: "empanada-presunto-queijo", label: "Empanada Presunto e Queijo (100g)", section: "Clássicos Argentinos", page: 4, x: 28, y: 26 },
  { id: "empanada-queijo-cebola", label: "Empanada Queijo com Cebola (100g)", section: "Clássicos Argentinos", page: 4, x: 28, y: 28.5 },
  { id: "medialuna-doce", label: "Medialuna Doce (2 unid., 70g)", section: "Clássicos Argentinos", page: 4, x: 28, y: 33 },
  { id: "medialuna-salgada", label: "Medialuna Salgada (2 unid., 70g)", section: "Clássicos Argentinos", page: 4, x: 28, y: 41 },
  { id: "medialuna-combo", label: "Medialuna Combo (1 doce + 1 salgada)", section: "Clássicos Argentinos", page: 4, x: 28, y: 48.5 },

  // ====== PÁGINA 4 — Clássicos Brasileiros ======
  { id: "pdq-multigraos", label: "Pão de Queijo Multigrãos (90g)", section: "Clássicos Brasileiros", page: 4, x: 51, y: 50.5 },
  { id: "pdq-tradicional", label: "Pão de Queijo Tradicional (70g)", section: "Clássicos Brasileiros", page: 4, x: 51, y: 53.5 },
  { id: "pdq-recheado", label: "Pão de Queijo Recheado c/ Doce de Leite (75g)", section: "Clássicos Brasileiros", page: 4, x: 51, y: 56.5 },
  { id: "mini-pdq", label: "Mini Pão de Queijo - Porção 8 unid. (120g)", section: "Clássicos Brasileiros", page: 4, x: 51, y: 59.5 },
  { id: "coxinha-frango", label: "Coxinha de Frango com Requeijão (110g)", section: "Clássicos Brasileiros", page: 4, x: 51, y: 64.5 },
  { id: "coxinha-costela", label: "Coxinha de Costela com Requeijão (110g)", section: "Clássicos Brasileiros", page: 4, x: 51, y: 70.5 },
  { id: "bauruzinho", label: "Bauruzinho de Presunto e Queijo (130g)", section: "Clássicos Brasileiros", page: 4, x: 51, y: 76 },
  { id: "folhado-frango", label: "Folhado de Frango com Azeitona (130g)", section: "Clássicos Brasileiros", page: 4, x: 51, y: 81.5 },
  { id: "torta-frango", label: "Torta de Frango — fatia (150g)", section: "Clássicos Brasileiros", page: 4, x: 51, y: 87 },
  { id: "torta-palmito", label: "Torta de Palmito — fatia (150g)", section: "Clássicos Brasileiros", page: 4, x: 51, y: 92.5 },

  // ====== PÁGINA 4 — Especiais Havanna ======
  { id: "croissant-serrano", label: "Croissant Serrano (135g)", section: "Especiais Havanna", page: 4, x: 75, y: 28.5 },
  { id: "croissant-porteno", label: "Croissant Porteño (148g)", section: "Especiais Havanna", page: 4, x: 75, y: 36.5 },
  { id: "choripan", label: "Choripan (235g)", section: "Especiais Havanna", page: 4, x: 75, y: 65 },
  { id: "croque-el-senor", label: "Croque El Señor (200g)", section: "Especiais Havanna", page: 4, x: 75, y: 75 },
  { id: "palermo-soho", label: "Palermo Soho (130g)", section: "Especiais Havanna", page: 4, x: 75, y: 83.5 },
  { id: "torrada-petropolis", label: "Torrada Petrópolis (150g)", section: "Especiais Havanna", page: 4, x: 75, y: 89.5 },

  // ====== PÁGINA 5 — Doces ======
  { id: "bolo-chocolatudo", label: "Bolo Chocolatudo (140g)", section: "Doces", page: 5, x: 25, y: 11.5 },
  { id: "bolo-red-velvet", label: "Bolo Red Velvet (170g)", section: "Doces", page: 5, x: 25, y: 19 },
  { id: "brownie-dulce", label: "Brownie com Dulce de Leche (185g)", section: "Doces", page: 5, x: 25, y: 25.5 },
  { id: "torta-havanna", label: "Torta Havanna (120g)", section: "Doces", page: 5, x: 25, y: 31.5 },
  { id: "torta-havanna-zero", label: "Torta Havanna Zero (120g)", section: "Doces", page: 5, x: 25, y: 38.5 },
  { id: "torta-la-chocolina", label: "Torta La Chocolina (100g)", section: "Doces", page: 5, x: 25, y: 46 },
  { id: "mini-torta-dulce", label: "Mini Torta Dulce de Leche (90g)", section: "Doces", page: 5, x: 25, y: 52.5 },
  { id: "mini-torta-amendoas", label: "Mini Torta de Amêndoas (90g)", section: "Doces", page: 5, x: 25, y: 59.5 },
  { id: "mini-torta-limao", label: "Mini Torta de Limão (90g)", section: "Doces", page: 5, x: 25, y: 67 },
  { id: "mini-torta-banana", label: "Mini Torta Crumble de Banana (90g)", section: "Doces", page: 5, x: 25, y: 73.5 },
  { id: "petit-gateau", label: "Petit Gateau de Dulce de Leche (140g)", section: "Doces", page: 5, x: 25, y: 81 },
  { id: "churros", label: "Churros (4 unid.)", section: "Doces", page: 5, x: 25, y: 86.5 },
  { id: "cubanito-2", label: "Cubanito 2 unid.", section: "Doces", page: 5, x: 50, y: 91 },
  { id: "cubanito-4", label: "Cubanito 4 unid.", section: "Doces", page: 5, x: 60, y: 91 },

  // ====== PÁGINA 5 — Tortas para Levar ======
  { id: "bolo-chocolatudo-grande", label: "Bolo Chocolatudo (1.4 kg)", section: "Tortas para Levar", page: 5, x: 70, y: 36.5 },
  { id: "torta-havanna-grande", label: "Torta Havanna (1.1 kg)", section: "Tortas para Levar", page: 5, x: 70, y: 50.5 },
  { id: "torta-havanna-zero-grande", label: "Torta Havanna Zero (1.1 kg)", section: "Tortas para Levar", page: 5, x: 70, y: 60 },

  // ====== PÁGINA 6 — Alfajores ======
  { id: "alfajor-chocolate-leite", label: "Alfajor Solito Chocolate ao Leite (55g)", section: "Alfajores", page: 6, x: 28, y: 14 },
  { id: "alfajor-chocolate-branco", label: "Alfajor Solito Chocolate Branco (55g)", section: "Alfajores", page: 6, x: 28, y: 16.5 },
  { id: "alfajor-merengue", label: "Alfajor Solito Merengue (47g)", section: "Alfajores", page: 6, x: 28, y: 19 },
  { id: "alfajor-nozes", label: "Alfajor Solito Nozes (55g)", section: "Alfajores", page: 6, x: 28, y: 21.5 },
  { id: "alfajor-70cacao", label: "Alfajor Solito 70% Cacao (65g)", section: "Alfajores", page: 6, x: 28, y: 24 },
  { id: "alfajor-mar-del-plata", label: "Alfajor Mar Del Plata (90g)", section: "Alfajores", page: 6, x: 28, y: 28 },
  { id: "alfajor-super-dulce", label: "Alfajor Super Dulce de Leche (70g)", section: "Alfajores", page: 6, x: 28, y: 41.5 },
  { id: "alfajor-pistache-dubai", label: "Alfajor Pistache Dubai (65g)", section: "Alfajores", page: 6, x: 28, y: 50 },
  { id: "mini-alfajor-leite", label: "Mini Alfajor Solito — Chocolate ao Leite (25g)", section: "Alfajores", page: 6, x: 28, y: 60 },
  { id: "mini-alfajor-branco", label: "Mini Alfajor Solito — Chocolate Branco (25g)", section: "Alfajores", page: 6, x: 28, y: 62.5 },
  { id: "alfajor-vegano", label: "Alfajor Vegano (70g)", section: "Alfajores", page: 6, x: 45, y: 30 },
  { id: "alfajor-sem-acucar", label: "Alfajor Sem Açúcar (70g)", section: "Alfajores", page: 6, x: 45, y: 41.5 },

  // ====== PÁGINA 6 — Clássicos & Dulce de Leche ======
  { id: "barrita", label: "Barrita (30g)", section: "Clássicos", page: 6, x: 65, y: 8.5 },
  { id: "galletita-limon", label: "Galletita de Limón (35g)", section: "Clássicos", page: 6, x: 65, y: 14 },
  { id: "havannet-solito", label: "Havannet Solito (38g)", section: "Clássicos", page: 6, x: 65, y: 20 },
  { id: "caixa-6-havannets", label: "Caixa com 6 Havannets", section: "Clássicos", page: 6, x: 65, y: 26.5 },

  { id: "ddl-tradicional-170", label: "Dulce de Leche Tradicional — Pote 170g", section: "Dulce de Leche", page: 6, x: 65, y: 41 },
  { id: "ddl-tradicional-420", label: "Dulce de Leche Tradicional — Pote 420g", section: "Dulce de Leche", page: 6, x: 65, y: 43.5 },
  { id: "ddl-tradicional-700", label: "Dulce de Leche Tradicional — Pote 700g", section: "Dulce de Leche", page: 6, x: 65, y: 46 },
  { id: "ddl-zero-acucar", label: "Dulce de Leche Zero Açúcar — Pote 420g", section: "Dulce de Leche", page: 6, x: 65, y: 51 },
  { id: "ddl-zero-lactose", label: "Dulce de Leche Zero Lactose — Pote 420g", section: "Dulce de Leche", page: 6, x: 65, y: 59 },
  { id: "caramelo-salgado", label: "Caramelo Salgado Mar Del Plata — Pote 420g", section: "Dulce de Leche", page: 6, x: 65, y: 65.5 },
  { id: "creme-pistache", label: "Creme de Pistache Dubai — Pote 170g", section: "Dulce de Leche", page: 6, x: 65, y: 72.5 },

  // ====== PÁGINA 6 — Caixas de Alfajores ======
  { id: "caixa-4-alfajores", label: "Caixa com 4 Alfajores (70%/Mar del Plata/Sem Açúcar/Pistache)", section: "Caixas", page: 6, x: 95, y: 9 },
  { id: "caixa-6-leite", label: "Caixa com 6 Alfajores — Chocolate ao Leite", section: "Caixas", page: 6, x: 95, y: 22.5 },
  { id: "caixa-6-merengue", label: "Caixa com 6 Alfajores — Merengue", section: "Caixas", page: 6, x: 95, y: 25 },
  { id: "caixa-6-misto", label: "Caixa com 6 Alfajores — Misto", section: "Caixas", page: 6, x: 95, y: 27.5 },
  { id: "caixa-12-leite", label: "Caixa com 12 Alfajores — Chocolate ao Leite", section: "Caixas", page: 6, x: 95, y: 33 },
  { id: "caixa-12-misto", label: "Caixa com 12 Alfajores — Misto", section: "Caixas", page: 6, x: 95, y: 36 },
  { id: "havannitas", label: "Havannitas (9g)", section: "Chocolates", page: 6, x: 95, y: 49 },
];

export const PAGES = [
  { num: 2, src: "/menu/page-2.jpg" },
  { num: 3, src: "/menu/page-3.jpg" },
  { num: 4, src: "/menu/page-4.jpg" },
  { num: 5, src: "/menu/page-5.jpg" },
  { num: 6, src: "/menu/page-6.jpg" },
];

export const PAGE_ASPECT = 3308 / 2339; // largura / altura

export function formatPrice(v: number | null | undefined): string {
  if (v == null || isNaN(v)) return "";
  return `R$ ${v.toFixed(2).replace(".", ",")}`;
}
