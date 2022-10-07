CREATE TABLE IF NOT EXISTS users (
  id serial PRIMARY KEY,
  canvas_user_id INTEGER NOT NULL UNIQUE,
  name TEXT,
  email TEXT
);

CREATE TABLE IF NOT EXISTS evaluations (
  id serial PRIMARY KEY,
  canvas_assignment_id INTEGER UNIQUE,
  canvas_course_id INTEGER,
  canvas_group_category_id INTEGER,
  canvas_group_category_name TEXT
);

CREATE TABLE IF NOT EXISTS assigned_evaluations (
  id serial PRIMARY KEY,
  evaluation_id INTEGER,

  canvas_assignment_id INTEGER,
  evaluator_canvas_id INTEGER,
  evaluator_name TEXT,
  evaluatee_canvas_id INTEGER,
  evaluatee_name TEXT,
  completed BOOLEAN DEFAULT false,

  discussion_score INTEGER,
  on_task_score INTEGER,
  ideas_score INTEGER,
  work_quality_score INTEGER,
  work_quantity_score INTEGER,
  communication_score INTEGER,

  advice_for_evaluatee TEXT,
  notes_for_instructor TEXT,

  submitted_at TIMESTAMP,

  FOREIGN KEY (evaluation_id) REFERENCES evaluations (id)
);

CREATE TABLE IF NOT EXISTS evaluation_summaries (
  id serial PRIMARY KEY,
  evaluation_id INTEGER,
  evaluatee_canvas_id INTEGER,
  evaluatee_name TEXT,

  result_sourcedid TEXT NOT NULL,
  grade_passback_url TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,

  discussion_score FLOAT,
  on_task_score FLOAT,
  ideas_score FLOAT,
  work_quality_score FLOAT,
  work_quantity_score FLOAT,
  communication_score FLOAT,

  advice_for_evaluatee TEXT,
  notes_for_instructor TEXT,

  FOREIGN KEY (evaluation_id) REFERENCES evaluations (id)
);

/*
CREATE TABLE IF NOT EXISTS evaluation_groups (
  id serial PRIMARY KEY,
  evaluation_id INTEGER,
  canvas_group_id INTEGER,
  canvas_group_name TEXT,

  FOREIGN KEY (evaluation_id) REFERENCES evaluations (id)
)

CREATE TABLE IF NOT EXISTS evaluation_responses (
  evaluation_response_id serial PRIMARY KEY,
  evaluation_by_user_id INTEGER,
  evaluation_of_user_id INTEGER,

)*/