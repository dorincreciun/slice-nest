-- Ingrediente + traduceri. Idempotent: poate fi rulat de câte ori vrei.
-- Legătura cu traducerile se face prin `code` (UNIQUE), nu prin id hardcodat.
INSERT INTO
  ingredients (code, is_available)
VALUES
  ('tomato_sauce', TRUE),
  ('mozzarella', TRUE),
  ('basil', TRUE),
  ('pepperoni', TRUE),
  ('ham', TRUE),
  ('mushrooms', TRUE),
  ('gorgonzola', TRUE),
  ('parmesan', TRUE)
ON CONFLICT (code) DO NOTHING;

INSERT INTO
  ingredient_translations (ingredient_id, locale, name)
SELECT
  i.id,
  t.locale::locale,
  t.name
FROM
  (
    VALUES
      ('tomato_sauce', 'ro', 'Sos de roșii'),
      ('tomato_sauce', 'en', 'Tomato sauce'),
      ('tomato_sauce', 'ru', 'Томатный соус'),
      ('mozzarella', 'ro', 'Mozzarella'),
      ('mozzarella', 'en', 'Mozzarella'),
      ('mozzarella', 'ru', 'Моцарелла'),
      ('basil', 'ro', 'Busuioc'),
      ('basil', 'en', 'Basil'),
      ('basil', 'ru', 'Базилик'),
      ('pepperoni', 'ro', 'Pepperoni'),
      ('pepperoni', 'en', 'Pepperoni'),
      ('pepperoni', 'ru', 'Пепперони'),
      ('ham', 'ro', 'Șuncă'),
      ('ham', 'en', 'Ham'),
      ('ham', 'ru', 'Ветчина'),
      ('mushrooms', 'ro', 'Ciuperci'),
      ('mushrooms', 'en', 'Mushrooms'),
      ('mushrooms', 'ru', 'Грибы'),
      ('gorgonzola', 'ro', 'Gorgonzola'),
      ('gorgonzola', 'en', 'Gorgonzola'),
      ('gorgonzola', 'ru', 'Горгонзола'),
      ('parmesan', 'ro', 'Parmezan'),
      ('parmesan', 'en', 'Parmesan'),
      ('parmesan', 'ru', 'Пармезан')
  ) AS t (code, locale, name)
  JOIN ingredients i ON i.code = t.code
ON CONFLICT (ingredient_id, locale) DO NOTHING;
