import { anthropic, createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { exec } from "child_process";
import { cli, command } from "cleye";
import dotenv from "dotenv";
import { promisify } from "util";
import * as readline from "readline";

const models = [
  "claude-3-5-haiku-latest",
  "claude-3-5-sonnet-latest",
  "claude-3-7-sonnet-20250219",
  "claude-4-sonnet-20250514",
  "claude-4-opus-20250514",
] as const;

type Models = (typeof models)[number];
function isModel(model: Models) {
  const isValid = models.includes(model);
  if (!isValid) {
    throw new Error(
      `Invalid model: ${model}, 
      \nAvailable models: \n${models.join(", \n")}\n\n`
    );
  }
  return model;
}

// Promisify exec for async/await usage
const execAsync = promisify(exec);

dotenv.config({ path: "~/.config/.aicommits/.env" });

// Parse argv
const argv = cli({
  commands: [
    command(
      {
        name: "config",
        description: "Configure Anthropic API key",
        parameters: [
          "<action>", // "set" | "get" | "unset"
          "[key]", // "api-key"
        ],
        help: {
          examples: [
            "config set ANTHROPIC_API_KEY=<your-api-key>",
            "config get ANTHROPIC_API_KEY",
            "config unset ANTHROPIC_API_KEY",
          ],
        },
      },
      async (argv) => {
        if (argv._.action === "set") {
          console.log("Validating API key...");
          if (!argv._.key) {
            throw new Error(
              "Key is required when setting the API key. You can get the API key from https://console.anthropic.com/api-keys"
            );
          }
          try {
            const newAnthropic = createAnthropic({
              apiKey: argv._.key.replace("ANTHROPIC_API_KEY=", ""),
            });

            const { text } = await generateText({
              model: newAnthropic("claude-3-5-haiku-latest"),
              prompt: `Hello`,
            });

            if (text) {
              console.log("API key is valid");

              await runCommand("mkdir -p ~/.config/.aicommits");
              await runCommand("touch ~/.config/.aicommits/.env");

              const apiKey = argv._.key.replace("ANTHROPIC_API_KEY=", "");
              await runCommand(
                `echo 'ANTHROPIC_API_KEY=${apiKey}' > ~/.config/.aicommits/.env`
              );

              console.log("API key saved successfully!");
            }
          } catch (error) {
            console.error("Could not validate API key:", error);
            process.exit(1);
          }
        }
        if (argv._.action === "get") {
          console.log("Getting API key...");
          console.log(process.env.ANTHROPIC_API_KEY);
        }
        if (argv._.action === "unset") {
          console.log("Unsetting API key...");
          await runCommand("rm -f ~/.config/.aicommits/.env");
          console.log("API key unset successfully!");
        }
      }
    ),
    command(
      {
        name: "commit",
        description: "Commit the changes",
        parameters: [
          "[prompt]", // Optional prompt to generate a commit message for the changes
        ],
        help: {
          examples: ["commit 'Add new feature'"],
        },
        flags: {
          // Parses `--time` as a string
          model: {
            type: isModel,
            description: `Model to use. Available models: ${models.join(", ")}`,
            default: "claude-3-5-haiku-latest",
          },
        },
      },
      async (argv) => {
        try {
          if (!process.env.ANTHROPIC_API_KEY) {
            throw new Error(
              `Please set the ANTHROPIC_API_KEY environment variable.
                \n\nYou can get the API key from https://console.anthropic.com/api-keys\n\n
                Run the following command: \n\n
                echo "ANTHROPIC_API_KEY=sk-ant-api03-..." >> .env
                `
            );
          }

          const { stdout } = await runCommand("git status");
          if (stdout.includes("no changes added to commit")) {
            console.log("You need to add changes to commit");
            process.exit(0);
          }

          const { stdout: changes } = await runCommand("git diff --cached");

          console.log("Generating commit message...");

          const { text } = await generateText({
            model: anthropic(argv.flags.model),
            prompt: `Write an short and concise description of the changes you've made to the codebase. Please pack related changes together.
              If you detect a change where to user is adding a .env, node_modules or other sensitive files, please warn the user that this is not a good idea instead of writing a commit message.
              Please ignore changes to .lock files.
              ${
                argv._.prompt
                  ? `Please take the following prompt into account for the entire commit message: ${argv._.prompt}`
                  : ""
              }
              Please format the changes in markdown, and use the following format:
              # Changes
              - Change 1
              - Change 2
              # Reasoning
              - Reasoning for change 1
              - Reasoning for change 2
              # Summary
              - Summary of the changes
              - Summary of the reasoning
        
              The changes are:
              ${changes}
              `,
          });

          console.log("\n\nCommit message generated successfully!\n\n");
          console.log(text);
          console.log("\n\n");

          // Prompt user to choose whether to commit
          const shouldCommit = await promptUser(
            "\nDo you want to commit with this message? (y/N): "
          );

          if (
            shouldCommit.toLowerCase() === "y" ||
            shouldCommit.toLowerCase() === "yes"
          ) {
            try {
              await runCommand(`git commit -m "${text.replace(/"/g, '\\"')}"`);
              console.log("\nChanges committed successfully!");
            } catch (error) {
              console.error("Failed to commit changes:", error);
              process.exit(1);
            }
          } else {
            console.log("\nCommit cancelled.");
            process.exit(0);
          }
        } catch (error) {
          console.error("Error:", error);
          process.exit(1);
        }
      }
    ),
  ],
});

// Helper function to run shell commands
async function runCommand(
  command: string
): Promise<{ stdout: string; stderr: string }> {
  try {
    const { stdout, stderr } = await execAsync(command);
    return { stdout: stdout.trim(), stderr: stderr.trim() };
  } catch (error: any) {
    throw new Error(`Command failed: ${error.message}`);
  }
}

// Helper function to prompt user for input
function promptUser(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}
