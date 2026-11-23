CREATE TABLE product_ingredients (
  product_id integer NOT NULL,
  ingredient_id integer NOT NULL,
  CONSTRAINT product_ingredients_pkey PRIMARY KEY (product_id, ingredient_id),
  CONSTRAINT product_ingredients_product_id_fkey FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
  CONSTRAINT product_ingredients_ingredient_id_fkey FOREIGN KEY (ingredient_id) REFERENCES ingredients (id) ON DELETE RESTRICT
);

CREATE INDEX product_ingredients_ingredient_id_idx
  ON product_ingredients (ingredient_id);
