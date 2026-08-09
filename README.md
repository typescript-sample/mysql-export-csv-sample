# mysql-export-csv-sample

> Demonstrates how the [**core-ts**](https://github.com/core-ts) ecosystem can be composed to build a production-style batch export application.

This project is **not simply a CSV export example**.

It demonstrates how several small, focused libraries work together to build a complete enterprise data export pipeline with very little application code.

Instead of using a large framework, each library has a single responsibility and can be reused independently.

- [**config-plus**](https://www.npmjs.com/package/config-plus) — Configuration management
- [**logger-core**](https://www.npmjs.com/package/logger-core) — Logging
- [**mysql2-core**](https://www.npmjs.com/package/mysql2-core) — MySQL provider
- [**export-kit**](https://www.npmjs.com/package/export-kit) — File formatting and writing

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
config-plus   logger-core   export-kit
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
   CSVFormatter
   (export-kit)
        │
        ▼
   CSV Records
        │
        ▼
    FileWriter
   (export-kit)
        │
        ▼
user_YYYYMMDD_HHMMSS.csv
```

---

# Libraries

| Library     | Responsibility                                       |
| ----------- |------------------------------------------------------|
| [`config-plus`](https://www.npmjs.com/package/config-plus) | Load and merge application configuration             |
| [`logger-core`](https://www.npmjs.com/package/logger-core) | Logging                                              |
| [`mysql2-core`](https://www.npmjs.com/package/mysql2-core) | MySQL implementation of sql-core and streaming export|
| [`export-kit`](https://www.npmjs.com/package/export-kit)   | CSV formatting, file writing and workflow utilities  |

Each library focuses on a single responsibility, making the application easier to understand and maintain.

---

# Project Structure

```text
src
│
├── app.ts                 # Application bootstrap and Dependency composition
├── config.ts              # Application configuration
│
└── user/
    └── index.ts
```

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
            export-kit
```

Each library can evolve independently while remaining easy to combine.

---

# Why is Export in mysql2-core?

Database streaming depends on the underlying database driver.

For example:

- MySQL uses [**mysql2**](https://www.npmjs.com/package/mysql2)
- PostgreSQL uses [**pg**](https://www.npmjs.com/package/pg)
- Oracle uses [**oracledb**](https://www.npmjs.com/package/oracledb)
- SQL Server uses [**mssql**](https://www.npmjs.com/package/mssql)
- SQLite uses its own driver

Because every driver exposes a different streaming API, streaming export is implemented in the corresponding provider library.

[`export-kit`](https://www.npmjs.com/package/export-kit) remains completely database-independent.

Its responsibility is simply to format objects and write files.

This separation keeps both libraries focused and reusable.

---

# Configuration

Application configuration is managed by [**config-plus**](https://www.npmjs.com/package/config-plus).

```ts
const cfg = merge(config, process.env, environments, process.env.ENV)
```

Configuration can be overridden for different environments without modifying application code.

```text
          Default Configuration
                   │
                   ▼
Environment Configuration (SIT, UAT, PRD)
                   │
                   ▼
   Environment Variables (process.env)
                   │
                   ▼
          Final Configuration
```

---

# Logging

The sample uses [**logger-core**](https://www.npmjs.com/package/logger-core) together with [**export-kit**](https://www.npmjs.com/package/export-kit).

[`logger-core`](https://www.npmjs.com/package/logger-core) provides structured logging. Responsible for:
* application logs
* error logs
* progress logging
 
```ts
import { getPrefix, LogWriter, timeToString } from "export-kit"
import { createFileLogger } from "logger-core"

const now = new Date()

const errorWriter = new LogWriter(getPrefix("error_", now) + "_" + timeToString(now) + ".txt", "./log/")
const logWriter = new LogWriter(getPrefix("log_", now) + "_" + timeToString(now) + ".txt", "./log/")

const logger = createFileLogger(cfg.log, errorWriter.write, logWriter.write)
```

Log files are automatically timestamped using the workflow utilities provided by [**export-kit**](https://www.npmjs.com/package/export-kit).

Example:

```text
log_20260808_175912.txt
error_20260808_175912.txt
```

---

# Schema-Driven Export

Objects are converted into CSV using metadata.

```ts
const formatter = new CSVFormatter<User>(userModel, ",")
```

The exporter knows nothing about CSV.

The formatter knows nothing about MySQL.

Each component has a single responsibility.

---

# Generic Exporter

The exporter is reusable for any entity.

```ts
const exporter = new Exporter<User>(connection, queryBuilder.build, formatter.format, writer.write, writer.end, userModel)

const total = await exporter.export()
```

To export another table, simply replace:

- SQL query
- Entity type
- Schema

The export pipeline remains unchanged.

---

# Workflow Utilities

This sample also demonstrates why [**export-kit**](https://www.npmjs.com/package/export-kit) contains a small set of workflow utilities.

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
out_dir/
  ├── user_20260808_175912.csv
log/
  ├── log_20260808_175912.txt
  └── error_20260808_175912.txt
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

- [**config-plus**](https://www.npmjs.com/package/config-plus) – Configuration management
- [**logger-core**](https://www.npmjs.com/package/logger-core) – Lightweight logging
- [**mysql2-core**](https://www.npmjs.com/package/mysql2-core) – MySQL implementation of sql-core
- [**sql-core**](https://www.npmjs.com/package/sql-core) – Standard SQL abstraction
- [**export-kit**](https://www.npmjs.com/package/export-kit) – File I/O, CSV and fixed-length formatting
- [**import-service**](https://www.npmjs.com/package/import-service) – Generic enterprise import framework with validation, mapping, batching and error reporting

---

# License

MIT