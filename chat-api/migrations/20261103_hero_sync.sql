-- Persistência aditiva da Forja V5, sem alterar cadastros, progresso ou turmas.
CREATE TABLE IF NOT EXISTS public.pit_student_heroes (
  student_id uuid PRIMARY KEY REFERENCES public.pit_students(id) ON DELETE CASCADE,
  klass text NOT NULL DEFAULT 'warrior' CHECK (klass IN ('warrior','mage','hunter','guardian')),
  attributes jsonb NOT NULL DEFAULT '{"FOR":0,"DES":0,"INT":0,"VIT":0,"DEF":0}'::jsonb
    CHECK (jsonb_typeof(attributes) = 'object'),
  talents jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(talents) = 'array'),
  revision integer NOT NULL DEFAULT 1 CHECK (revision >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.pit_student_heroes IS
 'Uma ficha por UUID autenticado; atributos e talentos revalidados segundo missões aprovadas no servidor.';
