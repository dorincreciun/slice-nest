CREATE TABLE products (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  is_available boolean NOT NULL DEFAULT FALSE,
  image_url text DEFAULT NULL,
  slug text NOT NULL UNIQUE,
  price_cents integer NOT NULL CHECK (price_cents > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz DEFAULT NULL
)
