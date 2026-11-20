CREATE TABLE ingredients (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  is_available boolean NOT NULL DEFAULT FALSE,
  code text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE ingredient_translations (
  ingredient_id integer NOT NULL,
  locale locale NOT NULL,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ingredient_translations_pk PRIMARY KEY (ingredient_id, locale),
  CONSTRAINT ingredient_translations_ingredient_id_fk FOREIGN KEY (ingredient_id) REFERENCES ingredients (id) ON DELETE CASCADE
);
