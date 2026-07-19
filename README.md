# mysql-export-csv-sample

> Demonstrates how the **core-ts** ecosystem can be composed to build a production-style batch export application.

This project is **not simply a CSV export example**.

It demonstrates how several small, focused libraries work together to build a complete enterprise data export pipeline with very little application code.

Instead of using a large framework, each library has a single responsibility and can be reused independently.

- **config-plus** — Configuration management
- **logger-core** — Logging
- **mysql2-core** — MySQL provider
- **io-one** — File formatting and writing

The application itself contains almost no infrastructure code because those responsibilities are delegated to reusable libraries.

---

# Architecture

```text
                 MySQL
                   │
                   ▼
              mysql2-core
                   │
                   ▼
              Application
                   │
      ┌────────────┼────────────┐
      ▼            ▼            ▼
config-plus    logger-core    io-one
      │            │            │
      └────────────┴────────────┘
                   │
                   ▼
              Export Files
```

---

# Export Pipeline

```text
      MySQL
        │
        ▼
 Streaming Export
   (mysql2-core)
        │
        ▼
Application Objects
        │
        ▼
DelimiterFormatter
    (io-one)
        │
        ▼
   CSV Records
        │
        ▼
    FileWriter
     (io-one)
        │
        ▼
    users.csv
```

---

# Libraries

| Library     | Responsibility                                       |
| ----------- |------------------------------------------------------|
| config-plus | Load and merge application configuration             |
| logger-core | Logging                                              |
| mysql2-core | MySQL implementation of sql-core and streaming export|
| io-one      | CSV formatting, file writing and workflow utilities  |

Each library focuses on a single responsibility, making the application easier to understand and maintain.

---

# Why This Sample?

Most online examples look like this:

```ts
const rows = await connection.query(...)
const csv = ...
fs.writeFile(...)
```

That may be enough for a simple demo, but production applications usually require much more:

- Configuration
- Logging
- File naming
- Output directory creation
- Object serialization
- CSV formatting
- Error handling

This sample demonstrates how those concerns can be solved by composing reusable libraries instead of writing project-specific infrastructure.

---

# Ecosystem

```text
         core-ts ecosystem


           Configuration
                 │
            config-plus


              Logging
                 │
            logger-core


              Database
                 │
            mysql2-core


            File Output
                 │
               io-one
```

Each library can evolve independently while remaining easy to combine.

---

# Why is Export in mysql2-core?

Database streaming depends on the underlying database driver.

For example:

- MySQL uses **mysql2**
- PostgreSQL uses **pg**
- Oracle uses **oracledb**
- SQL Server uses **mssql**
- SQLite uses its own driver

Because every driver exposes a different streaming API, streaming export is implemented in the corresponding provider library.

`io-one` remains completely database-independent.

Its responsibility is simply to format objects and write files.

This separation keeps both libraries focused and reusable.

---

# Configuration

Application configuration is managed by **config-plus**.

```ts
const cfg = merge(config, process.env, environments, process.env.ENV)
```

Configuration can be overridden for different environments without modifying application code.

---

# Logging

The sample uses **logger-core** together with **io-one**.

```ts
const logWriter = new LogWriter(logFile, logDirectory)
```

Log files are automatically timestamped using the workflow utilities provided by **io-one**.

Example:

```text
EXPORT_20260716_143010.log
```

---

# Schema-Driven Export

Objects are converted into CSV using metadata.

```ts
const formatter = new DelimiterFormatter<User>(",", userAttributes)
```

The exporter knows nothing about CSV.

The formatter knows nothing about MySQL.

Each component has a single responsibility.

---

# Generic Exporter

The exporter is reusable for any entity.

```ts
const exporter = new Exporter<User>(connection, queryBuilder.build, formatter.format, writer.write, writer.end, userAttributes)

await exporter.export()
```

To export another table, simply replace:

- SQL query
- Entity type
- Schema

The export pipeline remains unchanged.

---

# Workflow Utilities

This sample also demonstrates why **io-one** contains a small set of workflow utilities.

```ts
const filename = getPrefix("user_", now) + "_" + timeToString(now) + ".csv"
```

Instead of creating project-specific helper functions, these common batch-processing utilities are shared across applications.

---

# Running the Sample

```bash
npm install
npm start
```

After execution:

```text
output/
├── user.csv
└── logs/
    ├── EXPORT_20260716_143010.log
    └── ERROR_20260716_143010.log
```

---

# Design Principles

This sample demonstrates the design philosophy of the **core-ts** ecosystem.

- Small, focused libraries
- Clear separation of responsibilities
- Thin provider adapters
- Schema-driven programming
- Minimal application code
- Reusable production infrastructure

---

# What This Sample Demonstrates

- Production-style batch export
- Generic exporter
- Schema-driven serialization
- CSV generation
- Layered configuration
- Structured logging
- Clean architecture
- Composable TypeScript libraries

---

# Related Projects

- **config-plus** – Configuration management
- **logger-core** – Lightweight logging
- **mysql2-core** – MySQL implementation of sql-core
- **sql-core** – Standard SQL abstraction
- **io-one** – File I/O, CSV and fixed-length formatting


---

# License

MIT