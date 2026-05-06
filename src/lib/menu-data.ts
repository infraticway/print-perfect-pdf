export type MenuItem = {
  id: string;
  name: string;
  desc?: string;
};

export type MenuSection = {
  id: string;
  title: string;
  items: MenuItem[];
};

export const MENU: MenuSection[] = [
  {
    id: "bebidas-quentes",
    title: "Bebidas Quentes",
    items: [
      { id: "espresso-havanna", name: "Espresso Havanna - Blend Exclusivo", desc: "50ml" },
      { id: "espresso-doppio", name: "Espresso Doppio", desc: "130ml" },
      { id: "espresso-macchiato", name: "Espresso Macchiato", desc: "50ml" },
      { id: "espresso-dulce", name: "Espresso com Dulce de Leche", desc: "50ml" },
      { id: "cafe-latte", name: "Café Latte", desc: "130ml" },
      { id: "cappuccino-italiano", name: "Cappuccino Italiano", desc: "130ml" },
      { id: "cappuccino-vienense", name: "Cappuccino Vienense", desc: "240ml" },
      { id: "cappuccino-havanna", name: "Cappuccino Havanna", desc: "130ml" },
      { id: "3coracoes-cappuccino", name: "3 Corações Cappuccino", desc: "160ml" },
      { id: "mocha-dulce", name: "Mocha com Dulce de Leche", desc: "240ml" },
      { id: "dulce-quente", name: "Dulce de Leche Quente", desc: "240ml" },
      { id: "chocolate-quente", name: "Chocolate Quente", desc: "150ml" },
      { id: "choco-havanna", name: "Choco Havanna", desc: "130ml" },
      { id: "cha-importado", name: "Chá Importado", desc: "150ml" },
      { id: "extra-chantilly", name: "Extra: Chantilly", desc: "35g" },
      { id: "extra-dulce", name: "Extra: Dulce de Leche", desc: "50g" },
      { id: "extra-leite-vegetal", name: "Extra: Leite Vegetal A Tal da Castanha", desc: "50ml" },
    ],
  },
  {
    id: "para-levar",
    title: "Para Levar",
    items: [
      { id: "cafe-3coracoes-moido", name: "Café 3 Corações Havanna Torrado e Moído", desc: "250g" },
      { id: "capsulas-cappuccino", name: "Cappuccino Doce de Leite Havanna 3 Corações", desc: "10 cápsulas" },
    ],
  },
  {
    id: "bebidas-geladas",
    title: "Bebidas Geladas",
    items: [
      { id: "agua-sem-gas", name: "Água sem Gás" },
      { id: "agua-com-gas", name: "Água com Gás" },
      { id: "refrigerante", name: "Refrigerante", desc: "350ml" },
      { id: "suco", name: "Suco", desc: "300ml" },
      { id: "soda-italiana", name: "Soda Italiana", desc: "380ml" },
      { id: "cha-batido-gelado", name: "Chá Batido Gelado", desc: "480ml" },
      { id: "alfajor-au-cafe", name: "Alfajor au Café", desc: "200ml" },
      { id: "cappuccino-helado", name: "Cappuccino Helado Dulce de Leche", desc: "330ml" },
      { id: "havanna-shake", name: "Havanna Shake" },
      { id: "latte-helado", name: "Latte Helado", desc: "300ml" },
      { id: "milkshake-choco-dulce", name: "Milk Shake de Chocolate com Dulce de Leche", desc: "380ml" },
    ],
  },
  {
    id: "vannaccinos",
    title: "Vannaccinos (400ml)",
    items: [
      { id: "vanna-dulce", name: "Vannaccino Dulce de Leche" },
      { id: "vanna-choco-dulce", name: "Vannaccino Chocolate com Dulce de Leche" },
      { id: "vanna-morango-dulce", name: "Vannaccino Morango com Dulce de Leche" },
      { id: "vanna-com-cafe", name: "Adicional: Com Café" },
      { id: "iced-yopro", name: "Iced YoPRO com Dulce de Leche Zero", desc: "400ml" },
    ],
  },
  {
    id: "classicos-argentinos",
    title: "Clássicos Argentinos",
    items: [
      { id: "empanada-carne", name: "Empanada Carne Suave", desc: "100g" },
      { id: "empanada-presunto-queijo", name: "Empanada Presunto e Queijo", desc: "100g" },
      { id: "empanada-queijo-cebola", name: "Empanada Queijo com Cebola", desc: "100g" },
      { id: "medialuna-doce", name: "Medialuna Doce", desc: "2 unid. - 70g" },
      { id: "medialuna-salgada", name: "Medialuna Salgada", desc: "2 unid. - 70g" },
      { id: "medialuna-combo", name: "Medialuna Combo (1 doce + 1 salgada)", desc: "70g" },
    ],
  },
  {
    id: "classicos-brasileiros",
    title: "Clássicos Brasileiros",
    items: [
      { id: "pdq-multigraos", name: "Pão de Queijo Multigrãos", desc: "90g" },
      { id: "pdq-tradicional", name: "Pão de Queijo Tradicional", desc: "70g" },
      { id: "pdq-recheado", name: "Pão de Queijo Recheado com Doce de Leite", desc: "75g" },
      { id: "mini-pdq", name: "Mini Pão de Queijo - Porção 8 unid.", desc: "120g" },
      { id: "coxinha-frango", name: "Coxinha de Frango com Requeijão", desc: "110g" },
      { id: "coxinha-costela", name: "Coxinha de Costela com Requeijão", desc: "110g" },
      { id: "bauruzinho", name: "Bauruzinho de Presunto e Queijo", desc: "130g" },
      { id: "folhado-frango", name: "Folhado de Frango com Azeitona", desc: "130g" },
      { id: "torta-frango", name: "Torta de Frango (fatia)", desc: "150g" },
      { id: "torta-palmito", name: "Torta de Palmito (fatia)", desc: "150g" },
    ],
  },
  {
    id: "especiais-havanna",
    title: "Especiais Havanna",
    items: [
      { id: "croissant-serrano", name: "Croissant Serrano", desc: "135g" },
      { id: "croissant-porteno", name: "Croissant Porteño", desc: "148g" },
      { id: "choripan", name: "Choripan", desc: "235g" },
      { id: "croque-el-senor", name: "Croque El Señor", desc: "200g" },
      { id: "palermo-soho", name: "Palermo Soho", desc: "130g" },
      { id: "torrada-petropolis", name: "Torrada Petrópolis", desc: "150g" },
    ],
  },
  {
    id: "doces",
    title: "Doces",
    items: [
      { id: "bolo-chocolatudo", name: "Bolo Chocolatudo", desc: "140g" },
      { id: "bolo-red-velvet", name: "Bolo Red Velvet", desc: "170g" },
      { id: "brownie-dulce", name: "Brownie com Dulce de Leche", desc: "185g" },
      { id: "torta-havanna", name: "Torta Havanna", desc: "120g" },
      { id: "torta-havanna-zero", name: "Torta Havanna Zero", desc: "120g" },
      { id: "torta-la-chocolina", name: "Torta La Chocolina", desc: "100g" },
      { id: "mini-torta-dulce", name: "Mini Torta Dulce de Leche", desc: "90g" },
      { id: "mini-torta-amendoas", name: "Mini Torta de Amêndoas", desc: "90g" },
      { id: "mini-torta-limao", name: "Mini Torta de Limão", desc: "90g" },
      { id: "mini-torta-banana", name: "Mini Torta Crumble de Banana", desc: "90g" },
      { id: "petit-gateau", name: "Petit Gateau de Dulce de Leche", desc: "140g" },
      { id: "churros", name: "Churros (4 unid.)" },
      { id: "cubanito-2", name: "Cubanito 2 unid." },
      { id: "cubanito-4", name: "Cubanito 4 unid." },
    ],
  },
  {
    id: "tortas-levar",
    title: "Tortas para Levar",
    items: [
      { id: "bolo-chocolatudo-grande", name: "Bolo Chocolatudo", desc: "1.4 kg" },
      { id: "torta-havanna-grande", name: "Torta Havanna", desc: "1.1 kg" },
      { id: "torta-havanna-zero-grande", name: "Torta Havanna Zero", desc: "1.1 kg" },
    ],
  },
  {
    id: "alfajores",
    title: "Alfajores",
    items: [
      { id: "alfajor-chocolate-leite", name: "Alfajor Solito Chocolate ao Leite", desc: "55g" },
      { id: "alfajor-chocolate-branco", name: "Alfajor Solito Chocolate Branco", desc: "55g" },
      { id: "alfajor-merengue", name: "Alfajor Solito Merengue", desc: "47g" },
      { id: "alfajor-nozes", name: "Alfajor Solito Nozes", desc: "55g" },
      { id: "alfajor-70cacao", name: "Alfajor Solito 70% Cacao", desc: "65g" },
      { id: "alfajor-mar-del-plata", name: "Alfajor Mar Del Plata", desc: "90g" },
      { id: "alfajor-super-dulce", name: "Alfajor Super Dulce de Leche", desc: "70g" },
      { id: "alfajor-pistache-dubai", name: "Alfajor Pistache Dubai", desc: "65g" },
      { id: "mini-alfajor-leite", name: "Mini Alfajor Solito Chocolate ao Leite", desc: "25g" },
      { id: "mini-alfajor-branco", name: "Mini Alfajor Solito Chocolate Branco", desc: "25g" },
      { id: "alfajor-vegano", name: "Alfajor Vegano", desc: "70g" },
      { id: "alfajor-sem-acucar", name: "Alfajor Sem Açúcar", desc: "70g" },
    ],
  },
  {
    id: "caixas-alfajores",
    title: "Caixas de Alfajores",
    items: [
      { id: "caixa-4-alfajores", name: "Caixa com 4 Alfajores (70% / Mar del Plata / Sem açúcar / Pistache)" },
      { id: "caixa-6-leite", name: "Caixa com 6 Alfajores Chocolate ao Leite" },
      { id: "caixa-6-merengue", name: "Caixa com 6 Alfajores Merengue" },
      { id: "caixa-6-misto", name: "Caixa com 6 Alfajores Misto (Leite + Merengue)" },
      { id: "caixa-12-leite", name: "Caixa com 12 Alfajores Chocolate ao Leite" },
      { id: "caixa-12-misto", name: "Caixa com 12 Alfajores Misto (Leite + Merengue)" },
    ],
  },
  {
    id: "classicos-chocolates",
    title: "Clássicos & Chocolates",
    items: [
      { id: "barrita", name: "Barrita", desc: "30g" },
      { id: "galletita-limon", name: "Galletita de Limón", desc: "35g" },
      { id: "havannet-solito", name: "Havannet Solito", desc: "38g" },
      { id: "caixa-6-havannets", name: "Caixa com 6 Havannets" },
      { id: "havannitas", name: "Havannitas", desc: "9g" },
    ],
  },
  {
    id: "dulce-de-leche",
    title: "Dulce de Leche",
    items: [
      { id: "ddl-tradicional-170", name: "Dulce de Leche Tradicional - Pote 170g" },
      { id: "ddl-tradicional-420", name: "Dulce de Leche Tradicional - Pote 420g" },
      { id: "ddl-tradicional-700", name: "Dulce de Leche Tradicional - Pote 700g" },
      { id: "ddl-zero-acucar", name: "Dulce de Leche Zero Açúcar - Pote 420g" },
      { id: "ddl-zero-lactose", name: "Dulce de Leche Zero Lactose - Pote 420g" },
      { id: "caramelo-salgado", name: "Caramelo Salgado Mar Del Plata - Pote 420g" },
      { id: "creme-pistache", name: "Creme de Pistache Dubai - Pote 170g" },
    ],
  },
];
