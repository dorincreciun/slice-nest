-- Pizze + traduceri. Prețul e în bani (integer minor units): 12900 = 129.00 MDL.
-- Legătura cu traducerile se face prin `slug` (UNIQUE), nu prin id hardcodat.
INSERT INTO
  products (slug, price_cents, is_available)
VALUES
  ('margherita', 12900, TRUE),
  ('pepperoni', 15900, TRUE),
  ('prosciutto-funghi', 16900, TRUE),
  ('quattro-formaggi', 17900, TRUE)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO
  product_translations (product_id, locale, name, description)
SELECT
  p.id,
  t.locale::locale,
  t.name,
  t.description
FROM
  (
    VALUES
      ('margherita', 'ro', 'Margherita', 'Sos de roșii, mozzarella, busuioc proaspăt'),
      ('margherita', 'en', 'Margherita', 'Tomato sauce, mozzarella, fresh basil'),
      ('margherita', 'ru', 'Маргарита', 'Томатный соус, моцарелла, свежий базилик'),
      ('pepperoni', 'ro', 'Pepperoni', 'Sos de roșii, mozzarella, pepperoni'),
      ('pepperoni', 'en', 'Pepperoni', 'Tomato sauce, mozzarella, pepperoni'),
      ('pepperoni', 'ru', 'Пепперони', 'Томатный соус, моцарелла, пепперони'),
      ('prosciutto-funghi', 'ro', 'Prosciutto e Funghi', 'Sos de roșii, mozzarella, șuncă, ciuperci'),
      ('prosciutto-funghi', 'en', 'Prosciutto e Funghi', 'Tomato sauce, mozzarella, ham, mushrooms'),
      ('prosciutto-funghi', 'ru', 'Прошутто э фунги', 'Томатный соус, моцарелла, ветчина, грибы'),
      ('quattro-formaggi', 'ro', 'Quattro Formaggi', 'Mozzarella, gorgonzola, parmezan'),
      ('quattro-formaggi', 'en', 'Quattro Formaggi', 'Mozzarella, gorgonzola, parmesan'),
      ('quattro-formaggi', 'ru', 'Кватро формаджи', 'Моцарелла, горгонзола, пармезан')
  ) AS t (slug, locale, name, description)
  JOIN products p ON p.slug = t.slug
ON CONFLICT (product_id, locale) DO NOTHING;
