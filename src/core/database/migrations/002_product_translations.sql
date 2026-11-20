CREATE TYPE locale AS enum('en', 'ro', 'ru');

CREATE TABLE product_translations (
  product_id integer NOT NULL,
  locale locale NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT product_translations_pk PRIMARY KEY (product_id, locale),
  CONSTRAINT product_translations_product_id_fk FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
);
