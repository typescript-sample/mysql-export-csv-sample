import { merge } from "config-plus"
import { createWriteStream, CSVFormatter, FileWriter, getPrefix, LogWriter, timeToString, toString } from "export-kit"
import { createFileLogger } from "logger-core"
import mysql from "mysql2"
import { Exporter, select, Statement } from "mysql2-core"
import path from "path"
import { config, environments } from "./config"
import { User, userSchema } from "./user"

const cfg = merge(config, process.env, environments, process.env.ENV)

export class QueryBuilder {
  build = (): Promise<Statement> =>
    Promise.resolve({
      query: select("userexport", userSchema),
    })
}

async function exportData() {
  const now = new Date()
  const errorWriter = new LogWriter(`${getPrefix(cfg.error.prefix, now)}_${timeToString(now)}${cfg.error.suffix}`, cfg.error.directory)
  const logWriter = new LogWriter(`${getPrefix(cfg.info.prefix, now)}_${timeToString(now)}${cfg.info.suffix}`, cfg.info.directory)

  const logger = createFileLogger(cfg.log, errorWriter.write, logWriter.write)

  const connection = mysql.createConnection(cfg.db)
  const queryBuilder = new QueryBuilder()
  const formatter = new CSVFormatter<User>(userSchema, ",")

  const dir = cfg.file.path
  const filename = `${getPrefix(cfg.file.prefix, now)}_${timeToString(now)}.csv`
  const streamWrite = createWriteStream(dir, filename)
  const writer = new FileWriter(streamWrite)

  try {
    logger.info(`Start to export '${path.join(dir, filename)}' file`)
    const exporter = new Exporter<User>(connection, filename, queryBuilder.build, formatter.format, writer.write, writer.end, userSchema, logger.info, 3)
    const total = await exporter.export()
    logger.info(`Export '${path.join(dir, filename)}' file. Total: ${total}`)
  } catch (err) {
    logger.error(`Error when export "${path.join(dir, filename)}" file. Details: ${toString(err)}`)
  } finally {
    errorWriter.end()
    logWriter.end()
  }
}

exportData()
