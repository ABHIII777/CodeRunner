-- CodeRunner Database Tables

-- Users
CREATE TABLE users (
    user_id       SERIAL PRIMARY KEY,
    first_name    VARCHAR(50)  NOT NULL,
    last_name     VARCHAR(50)  NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT         NOT NULL,
    created_at    TIMESTAMP    DEFAULT NOW()
);

-- Projects (each user can have many projects)
CREATE TABLE projects (
    project_id   SERIAL PRIMARY KEY,
    user_id      INT REFERENCES users(user_id),
    project_name VARCHAR(100) NOT NULL,
    created_at   TIMESTAMP DEFAULT NOW()
);

-- Files (each project can have many files)
CREATE TABLE files (
    file_id    SERIAL PRIMARY KEY,
    project_id INT REFERENCES projects(project_id),
    file_name  VARCHAR(255) NOT NULL,
    language   VARCHAR(50),
    content    TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Code Runs (execution history)
CREATE TABLE code_runs (
    run_id      SERIAL PRIMARY KEY,
    file_id     INT REFERENCES files(file_id),
    user_id     INT REFERENCES users(user_id),
    language    VARCHAR(50),
    status      VARCHAR(20),
    output      TEXT,
    executed_at TIMESTAMP DEFAULT NOW()
);

-- Activities (dashboard activity feed)
CREATE TABLE activities (
    activity_id SERIAL PRIMARY KEY,
    user_id     INT REFERENCES users(user_id),
    file_name   VARCHAR(255),
    language    VARCHAR(50),
    status      VARCHAR(20),
    created_at  TIMESTAMP DEFAULT NOW()
);
