CREATE TYPE locale AS ENUM ('ro', 'ru', 'en');

CREATE TABLE products (
  id           integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  image_url    text        NOT NULL,
  price_cents  integer     NOT NULL,
  is_available boolean     NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT products_price_cents_positive CHECK (price_cents > 0)
);

CREATE TABLE product_translations (
  id                integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  locale            locale  NOT NULL DEFAULT 'en',
  name              varchar NOT NULL,
  short_description varchar NOT NULL,
  description       varchar NOT NULL,
  product_id        integer NOT NULL REFERENCES products (id) ON DELETE CASCADE
);
