import { merge } from "config-plus"
import { createWriteStream, DelimiterFormatter, FileWriter, getPrefix, LogWriter, timeToString } from "io-one"
import { createLogger } from "logger-core"
import mysql from "mysql2"
import { Exporter, Statement } from "mysql2-core"
import path from "path"
import { config, environments } from "./config"
import { User, userModel } from "./user"

const cfg = merge(config, process.env, environments, process.env.ENV)

export class QueryBuilder {
  build = (): Promise<Statement> =>
    Promise.resolve({
      query: "SELECT * FROM userexport",
    })
}

async function main() {
  const now = new Date()
  const errorWriter = new LogWriter(getPrefix(cfg.error.prefix, now) + "_" + timeToString(now) + cfg.error.suffix, cfg.error.directory)
  const logWriter = new LogWriter(getPrefix(cfg.info.prefix, now) + "_" + timeToString(now) + cfg.info.suffix, cfg.info.directory)

  const logger = createLogger(cfg.log, undefined, undefined, errorWriter.write, logWriter.write)

  const dir = "./dest_dir/"
  const filename = "export.csv"
  const streamWrite = createWriteStream(dir, filename)
  const writer = new FileWriter(streamWrite)
  const connection = mysql.createConnection(cfg.db)

  const formatter = new DelimiterFormatter<User>(",", userModel)
  const queryBuilder = new QueryBuilder()

  logger.info(`Export '${path.join(dir, filename)}' file`)
  const exporter = new Exporter<User>(connection, queryBuilder.build, formatter.format, writer.write, writer.end, userModel)
  const total = await exporter.export()

  logger.info(`Export '${path.join(dir, filename)}' file. Total: ${total}`)
  console.log("total " + total)
}

main()
