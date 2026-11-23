#!/usr/bin/env node
// Seed: ingrediente + produse (cu variații de mărime) + traduceri en/ro/ru.
// Idempotent (ON CONFLICT pe slug / code) — poate fi rulat de mai multe ori.
//
//   npm run db:seed
import { config } from 'dotenv';
import { expand } from 'dotenv-expand';
import pg from 'pg';

expand(config({ quiet: true }));

const LOCALES = ['en', 'ro', 'ru'];

// code: [en, ro, ru]
const INGREDIENTS = {
  tomato_sauce: ['Tomato sauce', 'Sos de roșii', 'Томатный соус'],
  mozzarella: ['Mozzarella', 'Mozzarella', 'Моцарелла'],
  basil: ['Basil', 'Busuioc', 'Базилик'],
  pepperoni: ['Pepperoni', 'Pepperoni', 'Пепперони'],
  ham: ['Ham', 'Șuncă', 'Ветчина'],
  mushrooms: ['Mushrooms', 'Ciuperci', 'Грибы'],
  olives: ['Olives', 'Măsline', 'Оливки'],
  onion: ['Red onion', 'Ceapă roșie', 'Красный лук'],
  bell_pepper: ['Bell pepper', 'Ardei gras', 'Болгарский перец'],
  corn: ['Sweet corn', 'Porumb', 'Кукуруза'],
  pineapple: ['Pineapple', 'Ananas', 'Ананас'],
  bacon: ['Bacon', 'Bacon', 'Бекон'],
  chicken: ['Chicken', 'Pui', 'Курица'],
  sausage: ['Sausage', 'Cârnați', 'Колбаски'],
  gorgonzola: ['Gorgonzola', 'Gorgonzola', 'Горгонзола'],
  parmesan: ['Parmesan', 'Parmezan', 'Пармезан'],
  goat_cheese: ['Goat cheese', 'Brânză de capră', 'Козий сыр'],
  arugula: ['Arugula', 'Rucola', 'Руккола'],
  cherry_tomatoes: ['Cherry tomatoes', 'Roșii cherry', 'Томаты черри'],
  garlic: ['Garlic', 'Usturoi', 'Чеснок'],
  oregano: ['Oregano', 'Oregano', 'Орегано'],
  bbq_sauce: ['BBQ sauce', 'Sos BBQ', 'Соус BBQ'],
  jalapeno: ['Jalapeño', 'Jalapeño', 'Халапеньо'],
  tuna: ['Tuna', 'Ton', 'Тунец'],
  shrimp: ['Shrimp', 'Creveți', 'Креветки'],
  anchovies: ['Anchovies', 'Anșoa', 'Анчоусы'],
  artichoke: ['Artichoke', 'Anghinare', 'Артишоки'],
  spinach: ['Spinach', 'Spanac', 'Шпинат'],
  prosciutto: ['Prosciutto', 'Prosciutto', 'Прошутто'],
  ricotta: ['Ricotta', 'Ricotta', 'Рикотта'],
  cream_sauce: ['Cream sauce', 'Sos de smântână', 'Сливочный соус'],
  egg: ['Egg', 'Ou', 'Яйцо'],
  beef: ['Beef', 'Vită', 'Говядина'],
  potato: ['Potato', 'Cartof', 'Картофель'],
  nutella: ['Chocolate-hazelnut spread', 'Cremă de ciocolată și alune', 'Шоколадно-ореховая паста'],
  mascarpone: ['Mascarpone', 'Mascarpone', 'Маскарпоне'],
  strawberry: ['Strawberry', 'Căpșuni', 'Клубника'],
  cocoa: ['Cocoa', 'Cacao', 'Какао'],
  honey: ['Honey', 'Miere', 'Мёд'],
  walnuts: ['Walnuts', 'Nuci', 'Грецкие орехи'],
};

// Pizza de bază: slug, [en, ro, ru], preț (bani, mărimea M), ingrediente
const T = 'tomato_sauce';
const M = 'mozzarella';
const PIZZAS = [
  ['margherita', ['Margherita', 'Margherita', 'Маргарита'], 8900, [T, M, 'basil']],
  ['pepperoni', ['Pepperoni', 'Pepperoni', 'Пепперони'], 10900, [T, M, 'pepperoni']],
  ['prosciutto-funghi', ['Ham & Mushrooms', 'Șuncă și ciuperci', 'Ветчина и грибы'], 10900, [T, M, 'ham', 'mushrooms']],
  ['quattro-formaggi', ['Four Cheese', 'Patru brânzeturi', 'Четыре сыра'], 12900, [M, 'gorgonzola', 'parmesan', 'goat_cheese']],
  ['hawaiian', ['Hawaiian', 'Hawaiană', 'Гавайская'], 10900, [T, M, 'ham', 'pineapple']],
  ['bbq-chicken', ['BBQ Chicken', 'Pui BBQ', 'Курица BBQ'], 11900, ['bbq_sauce', M, 'chicken', 'onion', 'corn']],
  ['diavola', ['Diavola', 'Diavola', 'Дьявола'], 11500, [T, M, 'pepperoni', 'jalapeno', 'garlic']],
  ['capricciosa', ['Capricciosa', 'Capricciosa', 'Капричоза'], 11900, [T, M, 'ham', 'mushrooms', 'artichoke', 'olives']],
  ['vegetariana', ['Vegetarian', 'Vegetariană', 'Вегетарианская'], 10500, [T, M, 'bell_pepper', 'mushrooms', 'olives', 'onion', 'corn']],
  ['carbonara', ['Carbonara', 'Carbonara', 'Карбонара'], 11900, ['cream_sauce', M, 'bacon', 'egg', 'parmesan']],
  ['tonno', ['Tuna', 'Cu ton', 'С тунцом'], 11900, [T, M, 'tuna', 'onion', 'olives']],
  ['frutti-di-mare', ['Seafood', 'Fructe de mare', 'Морепродукты'], 14900, [T, M, 'shrimp', 'tuna', 'garlic', 'oregano']],
  ['prosciutto-rucola', ['Prosciutto & Arugula', 'Prosciutto și rucola', 'Прошутто и руккола'], 13900, [T, M, 'prosciutto', 'arugula', 'parmesan', 'cherry_tomatoes']],
  ['napoli', ['Napoli', 'Napoli', 'Неаполитана'], 10500, [T, M, 'anchovies', 'olives', 'oregano']],
  ['quattro-stagioni', ['Four Seasons', 'Patru anotimpuri', 'Четыре сезона'], 12500, [T, M, 'ham', 'mushrooms', 'artichoke', 'olives']],
  ['spinaci-ricotta', ['Spinach & Ricotta', 'Spanac și ricotta', 'Шпинат и рикотта'], 11500, [M, 'spinach', 'ricotta', 'garlic']],
  ['meat-lovers', ['Meat Lovers', 'Meat Lovers', 'Мясная'], 13500, [T, M, 'pepperoni', 'sausage', 'bacon', 'ham']],
  ['texas', ['Texas', 'Texas', 'Техас'], 12900, ['bbq_sauce', M, 'beef', 'bacon', 'onion', 'jalapeno']],
  ['caprese', ['Caprese', 'Caprese', 'Капрезе'], 10900, [M, 'cherry_tomatoes', 'basil', 'garlic']],
  ['salsiccia', ['Sausage & Peppers', 'Cârnați și ardei', 'Колбаски и перец'], 11900, [T, M, 'sausage', 'bell_pepper', 'onion']],
  ['bianca', ['Bianca', 'Bianca', 'Бьянка'], 10500, ['cream_sauce', M, 'garlic', 'oregano', 'parmesan']],
  ['chicken-mushroom', ['Chicken & Mushrooms', 'Pui și ciuperci', 'Курица и грибы'], 11900, ['cream_sauce', M, 'chicken', 'mushrooms']],
  ['pizza-honey-goat', ['Honey Goat Cheese', 'Brânză de capră cu miere', 'Козий сыр с мёдом'], 12900, [M, 'goat_cheese', 'honey', 'walnuts', 'arugula']],
  ['potato-rosemary', ['Potato & Bacon', 'Cartofi și bacon', 'Картофель и бекон'], 10900, ['cream_sauce', M, 'potato', 'bacon', 'garlic']],
];

// Variații de mărime: [sufix slug, sufix nume, multiplicator preț]
const SIZES = [
  ['25', '25 cm', 0.75],
  ['32', '32 cm', 1],
  ['40', '40 cm', 1.4],
];

// Alte produse: slug, nume, descriere [en, ro, ru] sau null, preț, ingrediente
const EXTRAS = [];
const add = (slug, names, descs, price, ings = [], available = true) =>
  EXTRAS.push({ slug, names, descs, price, ings, available });

// Băuturi, în 2 mărimi
const DRINKS = [
  ['cola', ['Cola', 'Cola', 'Кола'], 1500],
  ['lemonade', ['Lemonade', 'Limonadă', 'Лимонад'], 1900],
  ['orange-juice', ['Orange juice', 'Suc de portocale', 'Апельсиновый сок'], 2200],
  ['iced-tea', ['Iced tea', 'Ceai rece', 'Холодный чай'], 1700],
  ['sparkling-water', ['Sparkling water', 'Apă carbogazoasă', 'Газированная вода'], 1000],
  ['still-water', ['Still water', 'Apă plată', 'Вода без газа'], 900],
];
const VOLUMES = [
  ['033', '0.33 L', 1],
  ['05', '0.5 L', 1.4],
];
for (const [slug, names, price] of DRINKS) {
  for (const [vs, vl, mult] of VOLUMES) {
    add(`${slug}-${vs}`, names.map((n) => `${n} ${vl}`), null, Math.round((price * mult) / 10) * 10);
  }
}

add('tiramisu', ['Tiramisu', 'Tiramisu', 'Тирамису'], ['Classic mascarpone dessert with cocoa', 'Desert clasic cu mascarpone și cacao', 'Классический десерт с маскарпоне и какао'], 3500, ['mascarpone', 'cocoa']);
add('nutella-calzone', ['Sweet Calzone', 'Calzone dulce', 'Сладкий кальцоне'], ['Folded dough with chocolate-hazelnut spread', 'Aluat pliat cu cremă de ciocolată și alune', 'Сложенное тесто с шоколадно-ореховой пастой'], 4200, ['nutella', 'strawberry']);
add('strawberry-pizza', ['Strawberry Dessert Pizza', 'Pizza desert cu căpșuni', 'Десертная пицца с клубникой'], ['Sweet pizza with mascarpone and strawberries', 'Pizza dulce cu mascarpone și căpșuni', 'Сладкая пицца с маскарпоне и клубникой'], 4900, ['mascarpone', 'strawberry', 'honey']);
add('honey-walnut-bites', ['Honey Walnut Bites', 'Bile cu miere și nuci', 'Шарики с мёдом и орехами'], ['Fried dough bites with honey and walnuts', 'Bucățele de aluat prăjit cu miere și nuci', 'Жареные кусочки теста с мёдом и орехами'], 3200, ['honey', 'walnuts']);
add('cocoa-brownie', ['Chocolate Brownie', 'Brownie cu ciocolată', 'Шоколадный брауни'], ['Dense chocolate brownie', 'Brownie dens cu ciocolată', 'Плотный шоколадный брауни'], 3000, ['cocoa', 'walnuts']);
add('cheesecake', ['Strawberry Cheesecake', 'Cheesecake cu căpșuni', 'Чизкейк с клубникой'], ['Creamy cheesecake with strawberry topping', 'Cheesecake cremos cu topping de căpșuni', 'Нежный чизкейк с клубничным топпингом'], 3600, ['mascarpone', 'strawberry']);
add('panna-cotta', ['Panna Cotta', 'Panna Cotta', 'Панна-котта'], ['Vanilla cream with berry sauce', 'Cremă de vanilie cu sos de fructe de pădure', 'Ванильный крем с ягодным соусом'], 3400, ['strawberry']);
add('honey-ricotta-dessert', ['Ricotta with Honey', 'Ricotta cu miere', 'Рикотта с мёдом'], ['Fresh ricotta, honey and walnuts', 'Ricotta proaspătă, miere și nuci', 'Свежая рикотта, мёд и орехи'], 3300, ['ricotta', 'honey', 'walnuts'], false);

add('garlic-bread', ['Garlic Bread', 'Pâine cu usturoi', 'Чесночный хлеб'], ['Baked bread with garlic and herbs', 'Pâine coaptă cu usturoi și ierburi', 'Запечённый хлеб с чесноком и травами'], 2400, ['garlic', 'oregano']);
add('cheesy-garlic-bread', ['Cheesy Garlic Bread', 'Pâine cu usturoi și brânză', 'Чесночный хлеб с сыром'], ['Garlic bread topped with melted mozzarella', 'Pâine cu usturoi și mozzarella topită', 'Чесночный хлеб с расплавленной моцареллой'], 2900, ['garlic', 'mozzarella']);
add('french-fries', ['French Fries', 'Cartofi prăjiți', 'Картофель фри'], ['Crispy golden fries', 'Cartofi prăjiți crocanți', 'Хрустящий золотистый картофель фри'], 2200, ['potato']);
add('potato-wedges', ['Potato Wedges', 'Cartofi wedges', 'Картофельные дольки'], ['Oven-baked seasoned wedges', 'Cartofi la cuptor condimentați', 'Запечённые приправленные дольки'], 2500, ['potato', 'garlic']);
add('caesar-salad', ['Chicken Caesar Salad', 'Salată Caesar cu pui', 'Салат Цезарь с курицей'], ['Chicken, parmesan and fresh greens', 'Pui, parmezan și salată verde', 'Курица, пармезан и свежая зелень'], 3800, ['chicken', 'parmesan']);
add('caprese-salad', ['Caprese Salad', 'Salată Caprese', 'Салат Капрезе'], ['Mozzarella, tomatoes and basil', 'Mozzarella, roșii și busuioc', 'Моцарелла, помидоры и базилик'], 3600, ['mozzarella', 'cherry_tomatoes', 'basil']);
add('arugula-salad', ['Arugula & Parmesan Salad', 'Salată rucola cu parmezan', 'Салат руккола с пармезаном'], ['Arugula, parmesan and cherry tomatoes', 'Rucola, parmezan și roșii cherry', 'Руккола, пармезан и томаты черри'], 3400, ['arugula', 'parmesan', 'cherry_tomatoes']);
add('chicken-wings', ['BBQ Chicken Wings', 'Aripioare de pui BBQ', 'Куриные крылышки BBQ'], ['Crispy wings glazed with BBQ sauce', 'Aripioare crocante cu sos BBQ', 'Хрустящие крылышки в соусе BBQ'], 4500, ['chicken', 'bbq_sauce']);

for (const [slug, names, descs, price, ings] of [
  ['sauce-garlic', ['Garlic sauce', 'Sos de usturoi', 'Чесночный соус'], ['Creamy garlic dip', 'Sos cremos de usturoi', 'Сливочный чесночный соус'], 500, ['garlic', 'cream_sauce']],
  ['sauce-bbq', ['BBQ sauce', 'Sos BBQ', 'Соус BBQ'], ['Smoky BBQ dip', 'Sos BBQ afumat', 'Копчёный соус BBQ'], 500, ['bbq_sauce']],
  ['sauce-tomato', ['Tomato sauce', 'Sos de roșii', 'Томатный соус'], ['Classic tomato dip', 'Sos clasic de roșii', 'Классический томатный соус'], 400, ['tomato_sauce', 'basil']],
  ['sauce-cheese', ['Cheese sauce', 'Sos de brânză', 'Сырный соус'], ['Warm cheese dip', 'Sos cald de brânză', 'Тёплый сырный соус'], 600, ['parmesan', 'cream_sauce']],
  ['sauce-spicy', ['Spicy sauce', 'Sos picant', 'Острый соус'], ['Hot jalapeño dip', 'Sos picant cu jalapeño', 'Острый соус с халапеньо'], 500, ['jalapeno']],
  ['sauce-pesto', ['Basil pesto', 'Pesto de busuioc', 'Песто с базиликом'], ['Basil, parmesan and garlic', 'Busuioc, parmezan și usturoi', 'Базилик, пармезан и чеснок'], 700, ['basil', 'parmesan', 'garlic']],
]) {
  add(slug, names, descs, price, ings);
}

function pizzaDescription(ings, i) {
  return ings.map((code) => INGREDIENTS[code][i]).join(', ');
}

function buildProducts() {
  const products = [];
  PIZZAS.forEach(([base, names, price, ings], idx) => {
    for (const [sizeSlug, sizeLabel, mult] of SIZES) {
      products.push({
        slug: `${base}-${sizeSlug}`,
        names: names.map((n) => `${n} ${sizeLabel}`),
        descs: LOCALES.map((_, i) => pizzaDescription(ings, i)),
        price: Math.round((price * mult) / 10) * 10,
        ings,
        // câteva variații indisponibile, ca să existe și cazul acesta
        available: !(idx % 9 === 8 && sizeSlug === '40'),
      });
    }
  });
  return [...products, ...EXTRAS];
}

async function main() {
  const products = buildProducts();
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query('begin');

    const ingredientIds = new Map();
    for (const [code, names] of Object.entries(INGREDIENTS)) {
      const { rows } = await client.query(
        `insert into ingredients (code, is_available) values ($1, true)
         on conflict (code) do update set updated_at = now()
         returning id`,
        [code],
      );
      const id = rows[0].id;
      ingredientIds.set(code, id);
      for (const [i, locale] of LOCALES.entries()) {
        await client.query(
          `insert into ingredient_translations (ingredient_id, locale, name)
           values ($1, $2, $3)
           on conflict (ingredient_id, locale) do update
             set name = excluded.name, updated_at = now()`,
          [id, locale, names[i]],
        );
      }
    }

    for (const p of products) {
      const { rows } = await client.query(
        `insert into products (slug, price_cents, is_available) values ($1, $2, $3)
         on conflict (slug) do update
           set price_cents = excluded.price_cents,
               is_available = excluded.is_available,
               updated_at = now()
         returning id`,
        [p.slug, p.price, p.available],
      );
      const id = rows[0].id;
      for (const [i, locale] of LOCALES.entries()) {
        await client.query(
          `insert into product_translations (product_id, locale, name, description)
           values ($1, $2, $3, $4)
           on conflict (product_id, locale) do update
             set name = excluded.name,
                 description = excluded.description,
                 updated_at = now()`,
          [id, locale, p.names[i], p.descs?.[i] ?? null],
        );
      }
      await client.query('delete from product_ingredients where product_id = $1', [id]);
      for (const code of p.ings) {
        await client.query(
          `insert into product_ingredients (product_id, ingredient_id) values ($1, $2)`,
          [id, ingredientIds.get(code)],
        );
      }
    }

    await client.query('commit');
    console.log(
      `Seeded ${products.length} products and ${ingredientIds.size} ingredients.`,
    );
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    await client.end();
  }
}

try {
  await main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
