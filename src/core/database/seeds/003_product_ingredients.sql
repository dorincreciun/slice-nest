-- Rețetele: ce ingrediente are fiecare pizza (tabela de legătură M:N).
-- Necesită migrarea product_ingredients. Ambele id-uri se caută după slug / code.
INSERT INTO
  product_ingredients (product_id, ingredient_id)
SELECT
  p.id,
  i.id
FROM
  (
    VALUES
      ('margherita', 'tomato_sauce'),
      ('margherita', 'mozzarella'),
      ('margherita', 'basil'),
      ('pepperoni', 'tomato_sauce'),
      ('pepperoni', 'mozzarella'),
      ('pepperoni', 'pepperoni'),
      ('prosciutto-funghi', 'tomato_sauce'),
      ('prosciutto-funghi', 'mozzarella'),
      ('prosciutto-funghi', 'ham'),
      ('prosciutto-funghi', 'mushrooms'),
      ('quattro-formaggi', 'mozzarella'),
      ('quattro-formaggi', 'gorgonzola'),
      ('quattro-formaggi', 'parmesan')
  ) AS t (slug, code)
  JOIN products p ON p.slug = t.slug
  JOIN ingredients i ON i.code = t.code
ON CONFLICT (product_id, ingredient_id) DO NOTHING;
