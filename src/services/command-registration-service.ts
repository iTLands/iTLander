import { REST } from "@discordjs/rest";
import {
  APIApplicationCommand,
  RESTGetAPIApplicationCommandsResult,
  RESTPatchAPIApplicationCommandJSONBody,
  RESTPostAPIApplicationCommandsJSONBody,
  Routes,
} from "discord.js";
import { Logger } from "./logger";
import path from "path";
import fs from "fs";
import { ROOT_DIR } from "../constants";
import { Config } from "../config";

const logsPath = path.join(ROOT_DIR, "lang", "logs.json");
const Logs = JSON.parse(fs.readFileSync(logsPath, "utf-8"));

export class CommandRegistrationService {
  constructor(private rest: REST) {}

  public async process(
    localCmds: RESTPostAPIApplicationCommandsJSONBody[],
    args: string[],
  ): Promise<void> {
    let remoteCmds = (await this.rest.get(
      Routes.applicationCommands(Config.discord.applicationId!),
    )) as RESTGetAPIApplicationCommandsResult;

    let localCmdsOnRemote = localCmds.filter((localCmd) =>
      remoteCmds.some((remoteCmd) => remoteCmd.name === localCmd.name),
    );

    let localCmdsOnly = localCmds.filter(
      (localCmd) =>
        !remoteCmds.some((remoteCmd) => remoteCmd.name === localCmd.name),
    );

    let remoteCmdsOnly = remoteCmds.filter(
      (remoteCmd) =>
        !localCmds.some((localCmd) => localCmd.name === remoteCmd.name),
    );

    switch (args[3]) {
      case "view": {
        Logger.info(
          Logs.info.commandActionView
            .replaceAll(
              "{LOCAL_AND_REMOTE_LIST}",
              this.formatCommandList(localCmdsOnRemote),
            )
            .replaceAll(
              "{LOCAL_ONLY_LIST}",
              this.formatCommandList(localCmdsOnly),
            )
            .replaceAll(
              "{REMOTE_ONLY_LIST}",
              this.formatCommandList(remoteCmdsOnly),
            ),
        );
        return;
      }
      case "register": {
        if (localCmdsOnly.length > 0) {
          Logger.info(
            Logs.info.commandActionCreating.replaceAll(
              "{COMMAND_LIST}",
              this.formatCommandList(localCmdsOnly),
            ),
          );

          for (let localCmd of localCmdsOnly) {
            await this.rest.post(
              Routes.applicationCommands(Config.discord.applicationId!),
              {
                body: localCmd,
              },
            );
          }
          Logger.info(Logs.info.commandActionCreated);
        }

        if (localCmdsOnRemote.length > 0) {
          Logger.info(
            Logs.info.commandActionUpdating.replaceAll(
              "{COMMAND_LIST}",
              this.formatCommandList(localCmdsOnRemote),
            ),
          );

          for (let localCmd of localCmdsOnRemote) {
            await this.rest.post(
              Routes.applicationCommands(Config.discord.applicationId!),
              {
                body: localCmd,
              },
            );
          }

          Logger.info(Logs.info.commandActionUpdated);
        }
        return;
      }
      case "clear": {
        Logger.info(
          Logs.info.commandActionClearing.replaceAll(
            "{COMMAND_LIST}",
            this.formatCommandList(remoteCmds),
          ),
        );

        await this.rest.put(
          Routes.applicationCommands(Config.discord.applicationId!),
          { body: [] },
        );
        Logger.info(Logs.info.commandActionCleared);
        return;
      }
    }
  }

  private formatCommandList(
    cmds: RESTPostAPIApplicationCommandsJSONBody[] | APIApplicationCommand[],
  ): string {
    return cmds.length > 0
      ? cmds.map((cmd: { name: string }) => `${cmd.name}`).join(", ")
      : "N/A";
  }
}
